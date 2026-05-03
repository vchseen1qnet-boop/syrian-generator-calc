import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import Slider from "@react-native-community/slider";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SyrianHeader } from "@/components/SyrianHeader";
import { InputRow } from "@/components/InputRow";
import { useApp } from "@/context/AppContext";
import { REFERENCE_TABLE, formatCurrency, formatNumber } from "@/utils/calculations";

export default function DieselScreen() {
  const colors = useColors();
  const { dieselPrice, setDieselPrice, dieselPriceUSD, setDieselPriceUSD } = useApp();

  const [selectedKVA, setSelectedKVA] = useState(10);
  const [customHours, setCustomHours] = useState("6");
  const [priceInputSYP, setPriceInputSYP] = useState(dieselPrice.toString());
  const [priceInputUSD, setPriceInputUSD] = useState(dieselPriceUSD.toString());

  const p = (v: string) => parseFloat(v) || 0;

  function interpolateLiters(kva: number): number {
    const sorted = [...REFERENCE_TABLE].sort((a, b) => a.kva - b.kva);
    if (kva <= sorted[0].kva) return sorted[0].litersPerHour;
    if (kva >= sorted[sorted.length - 1].kva) return sorted[sorted.length - 1].litersPerHour;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (kva >= sorted[i].kva && kva <= sorted[i + 1].kva) {
        const ratio = (kva - sorted[i].kva) / (sorted[i + 1].kva - sorted[i].kva);
        return sorted[i].litersPerHour + ratio * (sorted[i + 1].litersPerHour - sorted[i].litersPerHour);
      }
    }
    return 5;
  }

  const litersPerHour = interpolateLiters(selectedKVA);
  const hoursVal = p(customHours);
  const priceValSYP = p(priceInputSYP) || dieselPrice;
  const priceValUSD = p(priceInputUSD) || dieselPriceUSD;
  const litersPerDay = litersPerHour * hoursVal;
  const litersPerMonth = litersPerDay * 30;
  const costPerDaySYP = litersPerDay * priceValSYP;
  const costPerMonthSYP = costPerDaySYP * 30;
  const costPerDayUSD = litersPerDay * priceValUSD;
  const costPerMonthUSD = costPerDayUSD * 30;

  function savePrices() {
    const nSYP = p(priceInputSYP);
    const nUSD = p(priceInputUSD);
    if (nSYP > 0) setDieselPrice(nSYP);
    if (nUSD > 0) setDieselPriceUSD(nUSD);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SyrianHeader title="استهلاك الديزل" subtitle="مرجع سريع ومحدد" />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={80}
      >
        {/* Dual price card */}
        <View style={[styles.priceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>سعر ليتر الديزل</Text>

          <View style={styles.dualPriceRow}>
            <DieselPriceField
              label="ليرة سورية"
              badge="ل.س"
              badgeColor={colors.syrianGreen}
              value={priceInputSYP}
              onChangeText={setPriceInputSYP}
              colors={colors}
            />
            <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
            <DieselPriceField
              label="دولار أمريكي"
              badge="$"
              badgeColor="#1DA462"
              value={priceInputUSD}
              onChangeText={setPriceInputUSD}
              colors={colors}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.syrianRed }]}
            onPress={savePrices}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>حفظ الأسعار</Text>
          </TouchableOpacity>
        </View>

        {/* Slider */}
        <View style={[styles.sliderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>اختر قدرة المولد</Text>
          <View style={styles.kvaDisplay}>
            <Text style={[styles.kvaValue, { color: colors.syrianRed }]}>{selectedKVA}</Text>
            <Text style={[styles.kvaUnit, { color: colors.mutedForeground }]}>KVA</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={150}
            step={1}
            value={selectedKVA}
            onValueChange={(v) => setSelectedKVA(Math.round(v))}
            minimumTrackTintColor={colors.syrianRed}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.syrianRed}
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: colors.mutedForeground }]}>150 KVA</Text>
            <Text style={[styles.sliderLabel, { color: colors.mutedForeground }]}>5 KVA</Text>
          </View>

          <View style={[styles.resultBadge, { backgroundColor: colors.syrianRed + "15", borderColor: colors.syrianRed }]}>
            <Text style={[styles.resultBig, { color: colors.syrianRed }]}>
              {formatNumber(litersPerHour)} ل/ساعة
            </Text>
            <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>
              الاستهلاك التقريبي لمولد {selectedKVA} KVA
            </Text>
          </View>
        </View>

        {/* Hours calculator */}
        <View style={[styles.calcCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>احسب لساعات محددة</Text>
          <InputRow
            label="ساعات تشغيل يومية"
            unit="ساعة"
            value={customHours}
            onChangeText={setCustomHours}
          />
          {hoursVal > 0 && (
            <View style={styles.dualResults}>
              {/* SYP column */}
              <View style={[styles.resultCol, { borderColor: colors.syrianGreen, backgroundColor: colors.syrianGreen + "10" }]}>
                <View style={[styles.colHeader, { backgroundColor: colors.syrianGreen }]}>
                  <Text style={styles.colHeaderText}>ل.س</Text>
                </View>
                <View style={styles.colBody}>
                  <DualCalcRow label="يومياً" value={formatCurrency(costPerDaySYP)} liters={`${formatNumber(litersPerDay)} ل`} colors={colors} />
                  <DualCalcRow label="شهرياً" value={formatCurrency(costPerMonthSYP)} liters={`${formatNumber(litersPerMonth)} ل`} colors={colors} />
                </View>
              </View>

              {/* USD column */}
              <View style={[styles.resultCol, { borderColor: "#1DA462", backgroundColor: "#1DA46210" }]}>
                <View style={[styles.colHeader, { backgroundColor: "#1DA462" }]}>
                  <Text style={styles.colHeaderText}>$</Text>
                </View>
                <View style={styles.colBody}>
                  <DualCalcRow label="يومياً" value={`$${costPerDayUSD.toFixed(2)}`} liters="" colors={colors} usd />
                  <DualCalcRow label="شهرياً" value={`$${costPerMonthUSD.toFixed(2)}`} liters="" colors={colors} usd />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Reference table */}
        <Text style={[styles.tableTitle, { color: colors.foreground }]}>جدول مرجعي</Text>
        <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.tableHeader, { backgroundColor: colors.syrianRed }]}>
            <Text style={styles.thCell}>ل/ساعة</Text>
            <Text style={styles.thCell}>KVA</Text>
          </View>
          {REFERENCE_TABLE.map((row) => (
            <View
              key={row.kva}
              style={[
                styles.tableRow,
                {
                  backgroundColor:
                    Math.abs(selectedKVA - row.kva) < 4
                      ? colors.syrianGreen + "25"
                      : "transparent",
                },
              ]}
            >
              <Text style={[styles.tdCell, { color: colors.syrianRed, fontWeight: "700" }]}>
                {row.litersPerHour}
              </Text>
              <Text style={[styles.tdCell, { color: colors.foreground, fontWeight: "600" }]}>
                {row.kva} KVA
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </KeyboardAwareScrollView>
    </View>
  );
}

function DieselPriceField({
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

function DualCalcRow({
  label,
  value,
  liters,
  colors,
  usd = false,
}: {
  label: string;
  value: string;
  liters: string;
  colors: any;
  usd?: boolean;
}) {
  return (
    <View style={styles.dualCalcRow}>
      <Text style={[styles.dualValue, { color: usd ? "#1DA462" : colors.syrianRed }]}>{value}</Text>
      {liters ? <Text style={[styles.dualLiters, { color: colors.mutedForeground }]}>{liters}</Text> : null}
      <Text style={[styles.dualLabel, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", textAlign: "right", marginBottom: 10 },
  priceCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  dualPriceRow: { flexDirection: "row", gap: 10 },
  verticalDivider: { width: 1 },
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
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  sliderCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  kvaDisplay: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 4 },
  kvaValue: { fontSize: 52, fontWeight: "900" },
  kvaUnit: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  slider: { width: "100%", height: 44 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between" },
  sliderLabel: { fontSize: 11 },
  resultBadge: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  resultBig: { fontSize: 28, fontWeight: "900" },
  resultLabel: { fontSize: 13, marginTop: 4 },
  calcCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  dualResults: { flexDirection: "row", gap: 10 },
  resultCol: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  colHeader: {
    paddingVertical: 7,
    alignItems: "center",
  },
  colHeaderText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  colBody: { padding: 10, gap: 10 },
  dualCalcRow: { alignItems: "flex-end", gap: 2 },
  dualLabel: { fontSize: 12, fontWeight: "600" },
  dualValue: { fontSize: 14, fontWeight: "800" },
  dualLiters: { fontSize: 11 },
  tableTitle: { fontSize: 15, fontWeight: "700", textAlign: "right" },
  table: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  thCell: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  tdCell: {
    flex: 1,
    fontSize: 14,
    textAlign: "center",
  },
});
