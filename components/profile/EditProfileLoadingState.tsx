import React from 'react';
import { View } from 'react-native';
import Skeleton from '@/components/ui/Skeleton';
import { Radius, Spacing } from '@/constants/theme';

export default function EditProfileLoadingState() {
  return (
    <View>
      <Skeleton width="100%" height={Spacing.xxxl} borderRadius={Radius.l} style={{ marginBottom: Spacing.m }} />
      <Skeleton width="100%" height={Spacing.xxxl} borderRadius={Radius.l} style={{ marginBottom: Spacing.m }} />
      <Skeleton width="100%" height={Spacing.xxxl} borderRadius={Radius.l} style={{ marginBottom: Spacing.m }} />
    </View>
  );
}
