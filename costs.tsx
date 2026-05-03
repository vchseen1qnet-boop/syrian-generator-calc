import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SyrianHeader } from "@/components/SyrianHeader";
import { InputRow } from "@/components/InputRow";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useApp } from "@/context/AppContext";
import { calculateDieselCost, getDefaultEfficiency, formatCurrency, formatNumber } from "@/utils/calculations";

export default function CostsScreen() {
  const colors = useColors();
  const { dieselPrice, dieselPriceUSD } = useApp();

  const [kva, setKva] = useState("10");
  const [hours, setHours] = useState("6");
  const [priceSYP, setPriceSYP] = useState(dieselPrice.toString());
  const [priceUSD, setPriceUSD] = useState(dieselPriceUSD.toString());
  const [efficiency, setEfficiency] = useState("");

  const p = (v: string) => parseFloat(v) || 0;

  const resultSYP = useMemo(() => {
    const kvaVal = p(kva);
    const hoursVal = p(hours);
    const priceVal = p(priceSYP) || dieselPrice;
    const effVal = p(efficiency) || getDefaultEfficiency(kvaVal);
    if (kvaVal <= 0 || hoursVal <= 0) return null;
    return calculateDieselCost(kvaVal, hoursVal, priceVal, effVal);
  }, [kva, hours, priceSYP, efficiency, dieselPrice]);

  const resultUSD = useMemo(() => {
    const kvaVal = p(kva);
    const hoursVal = p(hours);
    const priceVal = p(priceUSD) || dieselPriceUSD;
    const effVal = p(efficiency) || getDefaultEfficiency(kvaVal);
    if (kvaVal <= 0 || hoursVal <= 0) return null;
    return calculateDieselCost(kvaVal, hoursVal, priceVal, effVal);
  }, [kva, hours, priceUSD, efficiency, dieselPriceUSD]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SyrianHeader title="حاسبة التكلفة اليومية" subtitle="احسب تكاليف تشغيل المولد" />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={80}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>بيانات المولد</Text>

        <InputRow
          label="قدرة المولد (KVA)"
          unit="KVA"
          value={kva}
          onChangeText={setKva}
          hint="أدخل قدرة مولدك"
        />
        <InputRow
          label="ساعات التشغيل اليومية"
          unit="ساعة"
          value={hours}
          onChangeText={setHours}
          hint="كم ساعة يعمل المولد يومياً"
        />

        {/* Price section - dual currency */}
        <View style={[styles.priceSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.priceTitle, { color: colors.foreground }]}>سعر ليتر الديزل</Text>
          <View style={styles.priceRow}>
            <PriceField
              label="ليرة سورية"
              badge="ل.س"
              badgeColor={colors.syrianGreen}
              value={priceSYP}
              onChangeText={setPriceSYP}
              colors={colors}
            />
            <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />
            <PriceField
              label="دولار أمريكي"
              badge="$"
              badgeColor="#1DA462"
              value={priceUSD}
              onChangeText={setPriceUSD}
              colors={colors}
            />
          </View>
          <Text style={[styles.priceNote, { color: colors.mutedForeground }]}>
            كلا السعرين قابل للتعديل يدوياً
          </Text>
        </View>

        <InputRow
          label="كفاءة المولد (ل/KVA/س)"
          unit="L/KVA"
          value={efficiency}
          onChangeText={setEfficiency}
          hint={`افتراضي: ${getDefaultEfficiency(p(kva)).toFixed(3)} ل/KVA/س`}
        />

        {resultSYP && resultUSD && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 8 }]}>
              الاستهلاك
            </Text>

            <View style={[styles.consumptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ConsumptionRow label="استهلاك ساعي" value={`${formatNumber(resultSYP.litersPerHour)} ل/ساعة`} colors={colors} />
              <ConsumptionRow label="استهلاك يومي" value={`${formatNumber(resultSYP.litersPerDay)} ليتر/يوم`} colors={colors} />
              <ConsumptionRow label="استهلاك شهري" value={`${formatNumber(resultSYP.litersPerMonth)} ليتر/شهر`} colors={colors} />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 8 }]}>
              التكلفة بالليرة السورية
            </Text>
            <View style={[styles.resultGrid, { backgroundColor: colors.card, borderColor: colors.syrianGreen }]}>
              <View style={[styles.currencyHeader, { backgroundColor: colors.syrianGreen }]}>
                <Text style={styles.currencyHeaderText}>ل.س — ليرة سورية</Text>
              </View>
              <View style={styles.resultBody}>
                <CostRow label="التكلفة اليومية" value={formatCurrency(resultSYP.costPerDay)} colors={colors} highlight />
                <CostRow label="التكلفة الشهرية" value={formatCurrency(resultSYP.costPerMonth)} colors={colors} highlight />
                <CostRow label="التكلفة السنوية" value={formatCurrency(resultSYP.costPerYear)} colors={colors} highlight big />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 8 }]}>
              التكلفة بالدولار الأمريكي
            </Text>
            <View style={[styles.resultGrid, { backgroundColor: colors.card, borderColor: "#1DA462" }]}>
              <View style={[styles.currencyHeader, { backgroundColor: "#1DA462" }]}>
                <Text style={styles.currencyHeaderText}>$ — دولار أمريكي</Text>
              </View>
              <View style={styles.resultBody}>
                <CostRow
                  label="التكلفة اليومية"
                  value={`$${resultUSD.costPerDay.toFixed(2)}`}
                  colors={colors}
                  highlight
                  usd
                />
                <CostRow
                  label="التكلفة الشهرية"
                  value={`$${resultUSD.costPerMonth.toFixed(2)}`}
                  colors={colors}
                  highlight
                  usd
                />
                <CostRow
                  label="التكلفة السنوية"
                  value={`$${resultUSD.costPerYear.toFixed(2)}`}
                  colors={colors}
                  highlight
                  big
                  usd
                />
              </View>
            </View>

            <View style={[styles.tipCard, { backgroundColor: colors.syrianGreen + "20", borderColor: colors.syrianGreen }]}>
              <Text style={[styles.tipText, { color: colors.syrianGreen }]}>
                💡 تلميح: لتخفيض التكاليف، قلل ساعات التشغيل وحافظ على صيانة المولد دورياً
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </KeyboardAwareScrollView>
      <WhatsAppButton litersPerHour={resultSYP?.litersPerHour} />
    </View>
  );
}

function PriceField({
  label,
  badge,
  badgeColor,
  value,
  onChangeText,
  colors,
}: {
  label: string;
  badge: string;
  badgeColor: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: any;
}) {
  return (
    <View style={styles.priceField}>
      <View style={styles.priceFieldHeader}>
        <Text style={[styles.priceFieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <View style={[styles.priceBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.priceBadgeText}>{badge}</Text>
        </View>
      </View>
      <TextInput
        style={[styles.priceInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        textAlign="right"
        placeholder="0"
        placeholderTextColor={colors.mutedForeground}
      />
    </View>
  );
}

function ConsumptionRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.costRow}>
      <Text style={[styles.costValue, { color: colors.foreground, fontSize: 15, fontWeight: "600" }]}>{value}</Text>
      <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function CostRow({
  label,
  value,
  colors,
  highlight = false,
  big = false,
  usd = false,
}: {
  label: string;
  value: string;
  colors: any;
  highlight?: boolean;
  big?: boolean;
  usd?: boolean;
}) {
  const valueColor = usd ? "#1DA462" : colors.syrianRed;
  return (
    <View style={styles.costRow}>
      <Text
        style={[
          styles.costValue,
          {
            color: highlight ? valueColor : colors.foreground,
            fontSize: big ? 20 : 15,
            fontWeight: big ? "900" : highlight ? "700" : "600",
          },
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  priceSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  priceTitle: { fontSize: 15, fontWeight: "700", textAlign: "right" },
  priceRow: { flexDirection: "row", gap: 10 },
  priceDivider: { width: 1 },
  priceNote: { fontSize: 11, textAlign: "center", fontStyle: "italic" },
  priceField: { flex: 1, gap: 6 },
  priceFieldHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceFieldLabel: { fontSize: 12, fontWeight: "600", textAlign: "right", flexShrink: 1 },
  priceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priceBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  priceInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
  },
  consumptionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  resultGrid: {
    borderRadius: 14,
    borderWidth: 2,
    overflow: "hidden",
  },
  currencyHeader: {
    paddingVertical: 8,
    alignItems: "center",
  },
  currencyHeaderText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  resultBody: {
    padding: 14,
    gap: 10,
  },
  divider: { height: 1 },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costLabel: { fontSize: 14 },
  costValue: { fontSize: 15 },
  tipCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  tipText: { fontSize: 13, textAlign: "right", lineHeight: 20, fontWeight: "600" },
});
