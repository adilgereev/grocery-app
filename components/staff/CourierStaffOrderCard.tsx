import React from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { STATUSES } from '@/constants/orderStatuses';
import { cleanAddress } from '@/lib/utils/addressUtils';
import { AdminOrderWithDetails } from '@/lib/api/adminApi';
import { s } from './StaffOrderCard.styles';

interface Props {
  order: AdminOrderWithDetails;
  myUserId: string;
  onCallCustomer: (phone: string | null) => void;
  onCourierStartDelivery: (orderId: string) => void;
  onCompleteDelivery: (orderId: string) => void;
}

export default function CourierStaffOrderCard({
  order, myUserId, onCallCustomer, onCourierStartDelivery, onCompleteDelivery,
}: Props) {
  const statusInfo = STATUSES[order.status] ?? STATUSES.pending;
  const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
  const date = new Date(order.created_at).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  const pickerAssignment = (order.assignments ?? []).find((a) => a.staff_type === 'picker' && a.status !== 'cancelled');
  const courierAssignment = (order.assignments ?? []).find((a) => a.staff_type === 'courier' && a.status !== 'cancelled');
  const isAssignedToMe = courierAssignment?.staff_id === myUserId;
  const isAssignedToOther = !!courierAssignment && !isAssignedToMe;
  const itemCount = order.items?.length ?? 0;
  const address = cleanAddress(order.delivery_address);

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.orderId}>Заказ #{order.id.split('-')[0]}</Text>
        <View style={[s.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Text style={[s.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
      </View>

      <View style={s.customerInfo}>
        <TouchableOpacity
          style={s.customerRow}
          onPress={() => onCallCustomer(profile?.phone ?? null)}
          testID={`courier-order-call-btn-${order.id}`}
        >
          <Ionicons name="person-circle" size={24} color={Colors.light.textSecondary} />
          <View style={s.customerInfoContainer}>
            <Text style={s.customerName}>{profile?.first_name ?? 'Клиент'}</Text>
            <Text style={s.customerPhone}>{profile?.phone ?? 'Телефон не указан'}</Text>
          </View>
          <Ionicons name="call" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={s.addressRow}
        onPress={() => Linking.openURL(`maps:?q=${encodeURIComponent(address)}`)}
        testID={`courier-order-maps-btn-${order.id}`}
      >
        <Ionicons name="location" size={16} color={Colors.light.textSecondary} />
        <Text style={[s.addressText, s.addressNoMarginLeft]} numberOfLines={2}>{address}</Text>
        <Ionicons name="open-outline" size={14} color={Colors.light.textSecondary} />
      </TouchableOpacity>

      {order.comment ? (
        <View style={s.commentBox}>
          <Ionicons name="chatbubble-ellipses-outline" size={15} color={Colors.light.textSecondary} />
          <Text style={s.commentText}>{order.comment}</Text>
        </View>
      ) : null}

      <View style={s.assignmentSection}>
        <View style={s.assignmentRow}>
          <Ionicons name="person-outline" size={14} color={Colors.light.textSecondary} />
          <Text style={s.assignmentLabel}>Сборщик:</Text>
          <Text style={s.assignmentName}>{pickerAssignment?.staff?.first_name ?? 'не назначен'}</Text>
        </View>
        <View style={s.assignmentRow}>
          <Ionicons name="bicycle-outline" size={14} color={Colors.light.textSecondary} />
          <Text style={s.assignmentLabel}>Курьер:</Text>
          {isAssignedToMe
            ? <Text style={[s.assignmentName, { color: Colors.light.success }]}>Вы назначены</Text>
            : isAssignedToOther
            ? <Text style={s.assignmentName}>Назначен: {courierAssignment?.staff?.first_name ?? 'другой'}</Text>
            : <Text style={s.assignmentName}>не назначен</Text>
          }
        </View>
      </View>

      <View style={s.summaryRow}>
        <Text style={s.summary}>{itemCount} {itemCount === 1 ? 'позиция' : itemCount < 5 ? 'позиции' : 'позиций'}</Text>
        <Text style={s.totalAmount}>{order.total_amount.toLocaleString('ru')} ₽</Text>
      </View>

      <Text style={[s.date, s.dateRight]}>{date}</Text>

      {order.status === 'assembled' && !isAssignedToOther && (
        <TouchableOpacity
          style={[s.actionButton, { backgroundColor: Colors.light.primary }]}
          onPress={() => Alert.alert(
            'Выехали на доставку?',
            'Заказ перейдёт в статус «В пути».',
            [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Выехал', onPress: () => onCourierStartDelivery(order.id) },
            ],
          )}
          testID={`courier-order-start-btn-${order.id}`}
        >
          <Text style={s.actionButtonText}>Выехал</Text>
        </TouchableOpacity>
      )}
      {order.status === 'shipped' && isAssignedToMe && (
        <TouchableOpacity
          style={[s.actionButton, { backgroundColor: Colors.light.success }]}
          onPress={() => Alert.alert(
            'Отметить как доставленный?',
            'Заказ будет закрыт. Отменить это может только администратор.',
            [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Доставлен', style: 'destructive', onPress: () => onCompleteDelivery(order.id) },
            ],
          )}
          testID={`courier-order-deliver-btn-${order.id}`}
        >
          <Text style={s.actionButtonText}>Доставлен</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
