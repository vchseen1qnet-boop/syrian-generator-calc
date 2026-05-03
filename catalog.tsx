import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SyrianHeader } from "@/components/SyrianHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";

interface CatalogItem {
  id: string;
  icon: string;
  nameAr: string;
  nameEn: string;
  kvaMin: number;
  kvaMax: number;
  fuelMin: number;
  fuelMax: number;
  models: string[];
  notes: string;
}

const CATALOG: CatalogItem[] = [
  {
    id: "small_house",
    icon: "home",
    nameAr: "بيت صغير (3 غرف)",
    nameEn: "Small House",
    kvaMin: 8,
    kvaMax: 10,
    fuelMin: 2.0,
    fuelMax: 2.5,
    models: ["Cummins 8KVA", "Perkins 10KVA", "Kirloskar 8KVA"],
    notes: "مناسب للإضاءة والمكيف الواحد والأجهزة المنزلية الأساسية",
  },
  {
    id: "large_house",
    icon: "home",
    nameAr: "بيت كبير (5+ غرف)",
    nameEn: "Large House",
    kvaMin: 12,
    kvaMax: 15,
    fuelMin: 3.0,
    fuelMax: 3.5,
    models: ["Cummins 15KVA", "Perkins 15KVA", "Caterpillar 12KVA"],
    notes: "يدعم عدة مكيفات وجميع الأجهزة المنزلية",
  },
  {
    id: "shop",
    icon: "storefront",
    nameAr: "محل تجاري",
    nameEn: "Shop/Store",
    kvaMin: 15,
    kvaMax: 20,
    fuelMin: 3.5,
    fuelMax: 4.5,
    models: ["Cummins 20KVA", "Perkins 20KVA", "Stamford 15KVA"],
    notes: "مناسب للمحلات ذات الإضاءة التجارية وأجهزة النقاط",
  },
  {
    id: "workshop",
    icon: "construct",
    nameAr: "ورشة صيانة",
    nameEn: "Maintenance Workshop",
    kvaMin: 25,
    kvaMax: 30,
    fuelMin: 5.5,
    fuelMax: 6.5,
    models: ["Cummins 30KVA", "Perkins 30KVA", "Caterpillar 25KVA"],
    notes: "يدعم المحركات الكهربائية والمعدات الصناعية الخفيفة",
  },
  {
    id: "construction",
    icon: "hammer",
    nameAr: "موقع بناء",
    nameEn: "Construction Site",
    kvaMin: 40,
    kvaMax: 60,
    fuelMin: 8.0,
    fuelMax: 12.0,
    models: ["Cummins 50KVA", "Caterpillar 45KVA", "Perkins 60KVA"],
    notes: "يدعم اللحام والحفر والمعدات الثقيلة",
  },
  {
    id: "clinic",
    icon: "medical",
    nameAr: "عيادة طبية",
    nameEn: "Medical Clinic",
    kvaMin: 12,
    kvaMax: 15,
    fuelMin: 3.0,
    fuelMax: 3.5,
    models: ["Cummins 15KVA", "Perkins 15KVA", "Stamford 12KVA"],
    notes: "يُنصح بمولد ذو تحويل تلقائي فوري لحماية الأجهزة الطبية",
  },
  {
    id: "school",
    icon: "school",
    nameAr: "مدرسة",
    nameEn: "School",
    kvaMin: 20,
    kvaMax: 25,
    fuelMin: 4.5,
    fuelMax: 5.5,
    models: ["Cummins 25KVA", "Perkins 25KVA", "Caterpillar 20KVA"],
    notes: "يدعم الإضاءة والتكييف والمعمل",
  },
  {
    id: "mosque",
    icon: "business",
    nameAr: "جامع",
    nameEn: "Mosque",
    kvaMin: 10,
    kvaMax: 15,
    fuelMin: 2.5,
    fuelMax: 3.5,
    models: ["Cummins 10KVA", "Perkins 15KVA", "Kirloskar 12KVA"],
    notes: "يدعم الإضاءة ومكبرات الصوت والتكييف",
  },
];

export default function CatalogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(id: string) {
    Haptics.selectionAsync();
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SyrianHeader title="كتالوج المولدات" subtitle="اختر الحل المناسب لموقعك" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          اختر نوع الموقع لمعرفة المولد المناسب
        </Text>

        {CATALOG.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggle(item.id)}
            activeOpacity={0.85}
            testID={`catalog-${item.id}`}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: expanded === item.id ? colors.syrianRed : colors.border,
                  borderWidth: expanded === item.id ? 2 : 1,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Ionicons
                  name={expanded === item.id ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.mutedForeground}
                />
                <View style={styles.cardTitleBlock}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.nameAr}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{item.nameEn}</Text>
                </View>
                <View style={[styles.iconCircle, { backgroundColor: colors.syrianRed }]}>
                  <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.kvaRow}>
                <View style={[styles.kvaBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.kvaText, { color: colors.syrianGreen }]}>
                    {item.kvaMin}–{item.kvaMax} KVA
                  </Text>
                </View>
                <View style={[styles.fuelBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.fuelText, { color: colors.mutedForeground }]}>
                    {item.fuelMin}–{item.fuelMax} ل/س
                  </Text>
                </View>
              </View>

              {expanded === item.id && (
                <View style={styles.expandedSection}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.expandedLabel, { color: colors.foreground }]}>ملاحظة:</Text>
                  <Text style={[styles.notes, { color: colors.mutedForeground }]}>{item.notes}</Text>
                  <Text style={[styles.expandedLabel, { color: colors.foreground }]}>موديلات مقترحة:</Text>
                  {item.models.map((m, i) => (
                    <View key={i} style={styles.modelRow}>
                      <View style={[styles.modelDot, { backgroundColor: colors.syrianGreen }]} />
                      <Text style={[styles.modelText, { color: colors.foreground }]}>{m}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
      <WhatsAppButton />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16 },
  intro: {
    fontSize: 13,
    textAlign: "right",
    marginBottom: 14,
    fontWeight: "500",
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleBlock: { flex: 1, alignItems: "flex-end" },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  kvaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  kvaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  kvaText: { fontSize: 13, fontWeight: "700" },
  fuelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  fuelText: { fontSize: 13, fontWeight: "600" },
  expandedSection: { marginTop: 12, gap: 8 },
  divider: { height: 1, marginBottom: 8 },
  expandedLabel: { fontSize: 13, fontWeight: "700", textAlign: "right" },
  notes: { fontSize: 13, textAlign: "right", lineHeight: 20 },
  modelRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" },
  modelDot: { width: 7, height: 7, borderRadius: 4 },
  modelText: { fontSize: 13, fontWeight: "500" },
});
