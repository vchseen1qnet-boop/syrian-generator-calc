import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons, Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme, I18nManager } from "react-native";

import { useColors } from "@/hooks/useColors";

I18nManager.allowRTL(true);

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "bolt.circle", selected: "bolt.circle.fill" }} />
        <Label>حاسبة الأحمال</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="catalog">
        <Icon sf={{ default: "list.bullet.clipboard", selected: "list.bullet.clipboard.fill" }} />
        <Label>الكتالوج</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="costs">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>التكاليف</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="diesel">
        <Icon sf={{ default: "drop", selected: "drop.fill" }} />
        <Label>الديزل</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <Icon sf={{ default: "ellipsis.circle", selected: "ellipsis.circle.fill" }} />
        <Label>المزيد</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.syrianRed,
        tabBarInactiveTintColor: colors.tabBarInactive,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.tabBar,
          borderTopWidth: 0,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar }]} />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "حاسبة الأحمال",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="bolt.circle.fill" tintColor={color} size={24} />
            ) : (
              <Ionicons name="flash" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: "الكتالوج",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="list.bullet.clipboard" tintColor={color} size={24} />
            ) : (
              <Ionicons name="list" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="costs"
        options={{
          title: "التكاليف",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar.fill" tintColor={color} size={24} />
            ) : (
              <Ionicons name="bar-chart" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="diesel"
        options={{
          title: "الديزل",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="drop.fill" tintColor={color} size={24} />
            ) : (
              <Ionicons name="water" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "المزيد",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="ellipsis.circle" tintColor={color} size={24} />
            ) : (
              <Ionicons name="ellipsis-horizontal" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
