import React from 'react';
import { View } from 'react-native';
import Skeleton from '@/components/ui/Skeleton';
import { Radius, Spacing } from '@/constants/theme';

export default function EditProfileLoadingState() {
  return (
    <View>
      <View style={{ marginBottom: Spacing.m + Spacing.s }}>
        <Skeleton width="100%" height={20} borderRadius={Radius.s} style={{ marginBottom: Spacing.s }} />
        <Skeleton width="100%" height={44} borderRadius={Radius.xl} />
      </View>

      <View style={{ marginBottom: Spacing.m + Spacing.s }}>
        <Skeleton width="100%" height={20} borderRadius={Radius.s} style={{ marginBottom: Spacing.s }} />
        <Skeleton width="100%" height={44} borderRadius={Radius.xl} />
      </View>
    </View>
  );
}
