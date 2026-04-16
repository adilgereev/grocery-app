import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useAddressStore } from '@/store/addressStore';
import { Address } from '@/types';
import { formatShortAddress } from '@/lib/utils/addressFormatter';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing, Radius, Shadows, Duration } from '@/constants/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function AddressesScreen() {
  const addresses = useAddressStore(state => state.addresses);
  const selectedAddressId = useAddressStore(state => state.selectedAddressId);
  const selectAddress = useAddressStore(state => state.selectAddress);
  const router = useRouter();

  // Строка деталей: квартира, подъезд, этаж (без дублирования из formatShortAddress)
  const formatDetails = (item: Address): string => {
    const parts: string[] = [];
    if (item.apartment) parts.push(`кв. ${item.apartment}`);
    if (item.entrance) parts.push(`под. ${item.entrance}`);
    if (item.floor) parts.push(`эт. ${item.floor}`);
    return parts.join(', ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Мои адреса" />

      <FlatList
        data={addresses}
        ListHeaderComponent={
          addresses.length > 0 ? (
            <Text style={styles.cityHint}>Доставка по г. Буйнакск</Text>
          ) : null
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listGrow}
        renderItem={({ item, index }) => {
          const isSelected = selectedAddressId === item.id;
          const details = formatDetails(item);
          return (
            <Animated.View
              entering={FadeInDown.delay(index * 60).duration(Duration.default)}
              layout={LinearTransition.springify()}
            >
              <TouchableOpacity
                testID={`address-card-${item.id}`}
                style={[styles.addressCard, isSelected && styles.selectedCard]}
                onPress={async () => {
                  await selectAddress(item.id);
                  router.back();
                }}
                activeOpacity={0.7}
              >
                {/* Иконка-маркер */}
                <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                  <Ionicons
                    name="location-sharp"
                    size={22}
                    color={isSelected ? Colors.light.primary : Colors.light.icon}
                  />
                </View>

                {/* Текст адреса */}
                <View style={styles.addressInfo}>
                  <Text style={[styles.addressStreet, isSelected && styles.addressStreetSelected]} numberOfLines={2}>
                    {formatShortAddress(item)}
                  </Text>
                  {details ? (
                    <Text style={styles.addressDetails} numberOfLines={1}>{details}</Text>
                  ) : null}
                  {isSelected && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Основной</Text>
                    </View>
                  )}
                </View>

                {/* Кнопка редактирования */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/manage-address?id=${item.id}`);
                  }}
                  style={styles.editBtn}
                  testID={`address-edit-btn-${item.id}`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.icon} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="location-outline" size={40} color={Colors.light.primary} />
            </View>
            <Text style={styles.emptyTitle}>Нет адресов доставки</Text>
            <Text style={styles.emptySubtitle}>Добавьте адрес, чтобы получать заказы</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          testID="address-add-button"
          style={styles.addButton}
          onPress={() => router.push('/manage-address')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={Colors.light.white} style={styles.addIcon} />
          <Text style={styles.addButtonText}>Добавить новый адрес</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listGrow: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  cityHint: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.s,
    paddingLeft: Spacing.xs,
  },

  // Карточка адреса
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: Spacing.m,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.m,
    borderWidth: 1.5,
    borderColor: Colors.light.card,
    ...Shadows.md,
  },
  selectedCard: {
    borderColor: Colors.light.primaryBorder,
    backgroundColor: Colors.light.primaryLight,
  },

  // Иконка-маркер
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
    flexShrink: 0,
  },
  iconCircleSelected: {
    backgroundColor: Colors.light.primaryLight,
  },

  // Текст
  addressInfo: {
    flex: 1,
  },
  addressStreet: {
    fontSize: FontSize.m,
    color: Colors.light.text,
    fontWeight: '600',
    lineHeight: 22,
  },
  addressStreetSelected: {
    color: Colors.light.primaryDark,
    fontWeight: '700',
  },
  addressDetails: {
    fontSize: FontSize.s,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  // Бейдж "Основной"
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.s,
    paddingVertical: 2,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.primaryBorder,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  // Кнопка редактирования
  editBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.s,
  },

  // Пустое состояние
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.s,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.m,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Футер
  footer: {
    padding: Spacing.l,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.l,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.cta,
    borderRadius: Radius.pill,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  addIcon: { marginRight: Spacing.s },
  addButtonText: {
    color: Colors.light.white,
    fontSize: FontSize.l,
    fontWeight: '700',
  },
});
