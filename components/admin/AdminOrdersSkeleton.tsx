import ScreenHeader from "@/components/ui/ScreenHeader";
import Skeleton from "@/components/ui/Skeleton";
import { Colors, Radius, Spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminOrdersSkeleton() {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScreenHeader title="Заказы клиентов" />
      <View style={styles.list}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.card}>
            <View style={styles.skeletonCardHeader}>
              <Skeleton width={130} height={18} />
              <Skeleton width={70} height={22} borderRadius={Radius.m} />
            </View>
            <Skeleton width="75%" height={14} style={styles.skeletonLine} />
            <Skeleton
              width="55%"
              height={14}
              style={styles.skeletonLineBottom}
            />
            <View style={styles.skeletonFooter}>
              <Skeleton width={80} height={20} />
              <Skeleton width={100} height={13} />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  list: { padding: Spacing.m, paddingBottom: 60 },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: Spacing.m,
    marginBottom: Spacing.m,
  },
  skeletonCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.m,
  },
  skeletonLine: { marginBottom: Spacing.s },
  skeletonLineBottom: { marginBottom: Spacing.m },
  skeletonFooter: { flexDirection: "row", justifyContent: "space-between" },
});
