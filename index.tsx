import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { InputRow } from "@/components/InputRow";
import { ResultCard } from "@/components/ResultCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SyrianHeader } from "@/components/SyrianHeader";
import { calculateLoads, LoadResult } from "@/utils/calculations";
import { useApp } from "@/context/AppContext";

export default function LoadCalculatorScreen() {
  const colors = useColors();
  const { addToHistory } = useApp();

  const [motors, setMotors] = useState("0");
  const [airConditioners, setAirConditioners] = useState("0");
  const [lights, setLights] = useState("0");
  const [heaters, setHeaters] = useState("0");
  const [otherLoads, setOtherLoads] = useState("0");
  const [powerFactor, setPowerFactor] = useState("0.8");
  const [safetyMargin, setSafetyMargin] = useState(true);
  const [result, setResult] = useState<LoadResult | null>(null);

  const p = (v: string) => parseFloat(v) || 0;

  const calculate = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = calculateLoads({
      motors: p(motors),
      airConditioners: p(airConditioners),
      lights: p(lights),
      heaters: p(heaters),
      otherLoads: p(otherLoads),
      powerFactor: p(powerFactor),
      safetyMargin,
    });
    setResult(res);

    await addToHistory({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `حساب ${new Date().toLocaleDateString("ar-SY")}`,
      motors: p(motors),
      airConditioners: p(airConditioners),
      lights: p(lights),
      heaters: p(heaters),
      otherLoads: p(otherLoads),
      powerFactor: p(powerFactor),
      safetyMargin,
      totalKVA: res.totalKVA,
      totalKW: res.totalKW,
      recommendedSize: res.recommendedSize,
      date: new Date().toISOString(),
    });
  }, [motors, airConditioners, lights, heaters, otherLoads, powerFactor, safetyMargin]);

  const reset = () => {
    setMotors("0");
    setAirConditioners("0");
    setLights("0");
    setHeaters("0");
    setOtherLoads("0");
    setPowerFactor("0.8");
    setSafetyMargin(true);
    setResult(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SyrianHeader title="حاسبة الأحمال" subtitle="احسب احتياجك بدقة" />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={80}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>أدخل أحمالك</Text>

        <InputRow
          label="محركات (كيلو واط)"
          unit="KW"
          value={motors}
          onChangeText={setMotors}
          hint="ادخل الطاقة بالكيلو واط"
        />
        <InputRow
          label="مكيفات (طن)"
          unit="طن"
          value={airConditioners}
          onChangeText={setAirConditioners}
          hint="1 طن = 3.5 KVA تلقائياً"
        />
        <InputRow
          label="إنارة (واط)"
          unit="W"
          value={lights}
          onChangeText={setLights}
        />
        <InputRow
          label="مدافئ (واط)"
          unit="W"
          value={heaters}
          onChangeText={setHeaters}
        />
        <InputRow
          label="أحمال أخرى (واط)"
          unit="W"
          value={otherLoads}
          onChangeText={setOtherLoads}
        />

        <View style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.optionRow}>
            <Switch
              value={safetyMargin}
              onValueChange={setSafetyMargin}
              trackColor={{ false: colors.border, true: colors.syrianGreen }}
              thumbColor={colors.card}
            />
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, { color: colors.foreground }]}>هامش الأمان 20%</Text>
              <Text style={[styles.optionHint, { color: colors.mutedForeground }]}>
                يُنصح بتفعيله لحماية المولد
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <InputRow
            label="معامل القدرة"
            unit="PF"
            value={powerFactor}
            onChangeText={setPowerFactor}
            hint="القيمة الافتراضية 0.8"
          />
        </View>

        <TouchableOpacity
          style={[styles.calcButton, { backgroundColor: colors.syrianRed }]}
          onPress={calculate}
          activeOpacity={0.85}
          testID="calculate-button"
        >
          <Text style={styles.calcButtonText}>احسب الآن</Text>
        </TouchableOpacity>

        {result && (
          <>
            <ResultCard
              totalKVA={result.totalKVA}
              totalKW={result.totalKW}
              recommendedSize={result.recommendedSize}
              hasWarning={result.recommendedSize > 200}
            />

            {result.totalKVA > 0 && (
              <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.detailTitle, { color: colors.foreground }]}>تفاصيل الأحمال</Text>
                {result.motorKVA > 0 && <DetailRow label="المحركات" value={result.motorKVA} colors={colors} />}
                {result.acKVA > 0 && <DetailRow label="المكيفات" value={result.acKVA} colors={colors} />}
                {result.lightsKVA > 0 && <DetailRow label="الإنارة" value={result.lightsKVA} colors={colors} />}
                {result.heatersKVA > 0 && <DetailRow label="المدافئ" value={result.heatersKVA} colors={colors} />}
                {result.otherKVA > 0 && <DetailRow label="أحمال أخرى" value={result.otherKVA} colors={colors} />}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <DetailRow label="الإجمالي" value={result.subtotalKVA} colors={colors} bold />
                {safetyMargin && (
                  <DetailRow label="+ هامش 20%" value={result.totalKVA - result.subtotalKVA} colors={colors} />
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border }]}
              onPress={reset}
              activeOpacity={0.7}
            >
              <Text style={[styles.resetText, { color: colors.mutedForeground }]}>إعادة تعيين</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 100 }} />
      </KeyboardAwareScrollView>

      <WhatsAppButton
        totalKVA={result?.totalKVA}
        recommendedSize={result?.recommendedSize}
      />
    </View>
  );
}

function DetailRow({
  label,
  value,
  colors,
  bold = false,
}: {
  label: string;
  value: number;
  colors: ReturnType<typeof useColors>;
  bold?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailValue, { color: colors.syrianRed, fontWeight: bold ? "800" : "600" }]}>
        {value.toFixed(2)} KVA
      </Text>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground, fontWeight: bold ? "700" : "400" }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionText: { flex: 1, alignItems: "flex-end" },
  optionLabel: { fontSize: 15, fontWeight: "600" },
  optionHint: { fontSize: 11, marginTop: 2 },
  divider: { height: 1, marginVertical: 4 },
  calcButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  calcButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  resetButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  resetText: { fontSize: 15, fontWeight: "600" },
  detailCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
    gap: 8,
  },
  detailTitle: { fontSize: 14, fontWeight: "700", textAlign: "right", marginBottom: 4 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 14 },
});
