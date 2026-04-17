import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useSetupProfileForm } from '@/hooks/useSetupProfileForm';
import SetupProfileHeader from '@/components/profile/SetupProfileHeader';
import NameInputs from '@/components/profile/NameInputs';
import ConsentCheckbox from '@/components/profile/ConsentCheckbox';
import SaveButton from '@/components/profile/SaveButton';

export default function SetupProfileScreen() {
  const { control, errors, handleSubmit, saving, error, onSave } = useSetupProfileForm();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryLight, Colors.light.white]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={Spacing.m}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <SetupProfileHeader />
            <View style={styles.card}>
              <NameInputs control={control} errors={errors} testIdPrefix="setup" />
              <ConsentCheckbox control={control} error={errors.terms_accepted} />
              {error && <Text style={styles.errorText}>{error}</Text>}
              <SaveButton
                testID="setup-continue-button"
                onPress={handleSubmit(onSave)}
                saving={saving}
                loading={false}
                label="Продолжить"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    paddingBottom: Spacing.xxxl + Spacing.sm,
  },
  card: {
    backgroundColor: Colors.light.glassBackground,
    marginHorizontal: Spacing.m,
    borderRadius: Radius.xxl + 4,
    padding: Spacing.xl,
    ...Shadows.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.glassBorder,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});
