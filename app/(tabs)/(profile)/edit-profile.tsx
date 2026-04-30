import React from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useProfileForm } from '@/hooks/forms/useProfileForm';
import PhoneSection from '@/components/profile/PhoneSection';
import NameInputs from '@/components/profile/NameInputs';
import SaveButton from '@/components/profile/SaveButton';
import EditProfileLoadingState from '@/components/profile/EditProfileLoadingState';

export default function EditProfileScreen() {
  const { control, errors, handleSubmit, loading, saving, phone, onSave } = useProfileForm();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Личные данные" />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={Spacing.m}
      >
        {loading ? (
          <EditProfileLoadingState />
        ) : (
          <View>
            <PhoneSection phone={phone} />
            <NameInputs control={control} errors={errors} />
          </View>
        )}
      </KeyboardAwareScrollView>

      <View style={styles.footerInner}>
        <SaveButton
          onPress={handleSubmit(onSave)}
          saving={saving}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.card,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  footerInner: {
    padding: Spacing.l,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
});

