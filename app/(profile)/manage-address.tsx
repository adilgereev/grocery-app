import MapPicker from '@/components/address/MapPicker';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { AddressActionButtons } from '@/components/address/AddressActionButtons';
import { AddressDetailsSection } from '@/components/address/AddressDetailsSection';
import { AddressMainSection } from '@/components/address/AddressMainSection';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useManageAddress } from '@/hooks/forms/useManageAddress';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddAddressScreen() {
  const {
    isEditMode, isSubmitting, mapVisible, setMapVisible,
    control, handleSubmit, setValue, errors, isValid,
    address, isPrivateHouse, lat, lon,
    error, isLoading, clearError,
    apartmentRef, entranceRef, floorRef, intercomRef,
    handleSubmitAddress, handleDelete, handleMapSelect,
  } = useManageAddress();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title={isEditMode ? 'Редактирование адреса' : 'Новый адрес'} />

      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraHeight={85}
        extraScrollHeight={65}
      >
        <AddressMainSection
          address={address}
          isPrivateHouse={isPrivateHouse}
          onAddressChange={(text) => setValue('text', text, { shouldValidate: true })}
          onHouseChange={(house) => setValue('house', house, { shouldValidate: true })}
          onCoordsChange={(newLat, newLon) => { setValue('lat', newLat); setValue('lon', newLon); }}
          onTogglePrivateHouse={(val) => setValue('is_private_house', val)}
          onOpenMap={() => setMapVisible(true)}
          error={errors.house?.message}
        />

        {!isPrivateHouse && (
          <AddressDetailsSection
            control={control}
            apartmentRef={apartmentRef}
            entranceRef={entranceRef}
            floorRef={floorRef}
            intercomRef={intercomRef}
          />
        )}

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={Colors.light.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => clearError()}>
              <Ionicons name="close" size={18} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAwareScrollView>

      <AddressActionButtons
        isEditMode={isEditMode}
        isValid={isValid}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
        onSubmit={handleSubmit(handleSubmitAddress)}
        onDelete={isEditMode ? handleDelete : undefined}
      />

      <Modal visible={mapVisible} animationType="slide">
        <MapPicker
          initialLocation={lat && lon ? { latitude: lat, longitude: lon } : undefined}
          onClose={() => setMapVisible(false)}
          onLocationSelect={handleMapSelect}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: Spacing.l, paddingBottom: 40, flexGrow: 1 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.m, backgroundColor: Colors.light.errorLight,
    borderRadius: Radius.m, borderLeftWidth: 4, borderLeftColor: Colors.light.error,
    marginTop: Spacing.s,
  },
  errorText: { flex: 1, fontSize: 14, color: Colors.light.error },
});
