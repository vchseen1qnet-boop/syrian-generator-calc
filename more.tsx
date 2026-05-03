import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SyrianHeader } from "@/components/SyrianHeader";
import { useApp } from "@/context/AppContext";

const FAQ = [
  {
    q: "ما الفرق بين KW و KVA؟",
    a: "KVA هي القدرة الظاهرية وتشمل القدرة الفعلية والقدرة الرد الفعل. أما KW فهي القدرة الفعلية. العلاقة: KW = KVA × معامل القدرة (عادة 0.8).",
  },
  {
    q: "لماذا أضيف هامش 20%؟",
    a: "هامش الأمان يحمي المولد من الحمل الزائد ويضمن عمله بكفاءة. المولد الذي يعمل على 80% من حمله الكامل أكثر كفاءة وأطول عمراً.",
  },
  {
    q: "كيف أحسب استهلاك الديزل؟",
    a: "الاستهلاك ≈ قدرة المولد × 0.2 لتر/KVA/ساعة. مثلاً: مولد 15 KVA يستهلك ≈ 3 لترات/ساعة.",
  },
  {
    q: "متى أحتاج مكثف للمولد؟",
    a: "تحتاج مكثفات عند وجود أحمال كبيرة من المحركات أو المكيفات لتحسين معامل القدرة وتقليل الحمل على المولد.",
  },
  {
    q: "ما هي أفضل ماركات المولدات؟",
    a: "أفضل الماركات: Cummins, Perkins, Caterpillar, Stamford, Kirloskar. تتميز بالموثوقية والخدمة الجيدة في السوق السورية.",
  },
  {
    q: "كم مرة يحتاج المولد للصيانة؟",
    a: "الصيانة الدورية كل 250 ساعة تشغيل أو 3 أشهر (أيهما أقرب). تشمل تغيير الزيت والفلاتر وفحص البطارية.",
  },
];

const QUICK_REF = [
  { name: "مكيف 1 طن", kva: 3.5 },
  { name: "مكيف 1.5 طن", kva: 5.25 },
  { name: "مكيف 2 طن", kva: 7 },
  { name: "ثلاجة", kva: 0.3 },
  { name: "غسالة", kva: 1.5 },
  { name: "مصباح LED 100W", kva: 0.125 },
  { name: "حاسوب", kva: 0.5 },
  { name: "تلفزيون", kva: 0.2 },
  { name: "مضخة ماء 1HP", kva: 1.0 },
  { name: "فرن كهربائي", kva: 3.0 },
];

export default function MoreScreen() {
  const colors = useColors();
  const { history, clearHistory, settings } = useApp();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  function toggleFaq(i: number) {
    Haptics.selectionAsync();
    setExpandedFaq((prev) => (prev === i ? null : i));
  }

  function handleWhatsApp() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL("https://wa.me/963932365420").catch(() => {});
  }

  function confirmClearHistory() {
    if (Platform.OS === "web") {
      clearHistory();
      return;
    }
    Alert.alert("مسح السجل", "هل أنت متأكد من مسح جميع الحسابات السابقة؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "مسح", style: "destructive", onPress: clearHistory },
    ]);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SyrianHeader title="المزيد" subtitle="معلومات ومرجع سريع" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.aboutCard, { backgroundColor: colors.syrianRed }]}>
          <Text style={styles.aboutAppName}>حاسبة المولدات السورية</Text>
          <Text style={styles.aboutSubtitle}>احسب احتياجك بدقة</Text>
          <TouchableOpacity onPress={handleWhatsApp} style={styles.contactBtn} activeOpacity={0.85}>
            <Ionicons name="logo-whatsapp" size={18} color={colors.syrianGreen} />
            <Text style={styles.contactBtnText}>+963 932 365 420</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="مرجع سريع للأحمال" colors={colors} />
        <View style={[styles.refCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {QUICK_REF.map((item, i) => (
            <View
              key={i}
              style={[
                styles.refRow,
                { borderBottomColor: colors.border, borderBottomWidth: i < QUICK_REF.length - 1 ? 1 : 0 },
              ]}
            >
              <Text style={[styles.refKva, { color: colors.syrianRed }]}>{item.kva} KVA</Text>
              <Text style={[styles.refName, { color: colors.foreground }]}>{item.name}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="الأسئلة الشائعة" colors={colors} />
        {FAQ.map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => toggleFaq(i)}
            activeOpacity={0.85}
          >
            <View style={[styles.faqItem, { backgroundColor: colors.card, borderColor: expandedFaq === i ? colors.syrianRed : colors.border }]}>
              <View style={styles.faqHeader}>
                <Ionicons
                  name={expandedFaq === i ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.mutedForeground}
                />
                <Text style={[styles.faqQ, { color: colors.foreground, flex: 1, textAlign: "right" }]}>
                  {item.q}
                </Text>
              </View>
              {expandedFaq === i && (
                <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{item.a}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {history.length > 0 && (
          <>
            <SectionHeader title={`سجل الحسابات (${history.length})`} colors={colors} />
            <View style={[styles.histCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {history.slice(0, 5).map((h, i) => (
                <View
                  key={h.id}
                  style={[
                    styles.histRow,
                    { borderBottomColor: colors.border, borderBottomWidth: i < Math.min(history.length, 5) - 1 ? 1 : 0 },
                  ]}
                >
                  <Text style={[styles.histKva, { color: colors.syrianRed }]}>{h.recommendedSize} KVA</Text>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={[styles.histName, { color: colors.foreground }]}>{h.name}</Text>
                    <Text style={[styles.histDate, { color: colors.mutedForeground }]}>
                      {new Date(h.date).toLocaleDateString("ar-SY")}
                    </Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity onPress={confirmClearHistory} style={[styles.clearBtn, { borderTopColor: colors.border }]}>
                <Text style={[styles.clearText, { color: colors.syrianRed }]}>مسح السجل</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title}</Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10 },
  aboutCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  aboutAppName: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", textAlign: "center" },
  aboutSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 14, textAlign: "center" },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  contactBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  refCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  refName: { fontSize: 14, fontWeight: "500" },
  refKva: { fontSize: 14, fontWeight: "700" },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  faqHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  faqQ: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  faqA: { fontSize: 13, lineHeight: 22, textAlign: "right" },
  histCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  histKva: { fontSize: 16, fontWeight: "800", width: 70, textAlign: "center" },
  histName: { fontSize: 14, fontWeight: "600" },
  histDate: { fontSize: 11, marginTop: 2 },
  clearBtn: { paddingVertical: 12, alignItems: "center", borderTopWidth: 1 },
  clearText: { fontSize: 14, fontWeight: "600" },
});
