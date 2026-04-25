import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { STATUSES } from '@/constants/orderStatuses';
import { cleanAddress } from '@/lib/utils/addressUtils';
import { AdminOrderItem, AdminOrderWithDetails } from '@/lib/api/adminApi';
import AdminOrderItems from '@/components/admin/AdminOrderItems';
import { s } from './StaffOrderCard.styles';

interface Props {
  order: AdminOrderWithDetails;
  isExpanded: boolean;
  myUserId: string;
  onToggleExpand: (id: string) => void;
  onCallCustomer: (phone: string | null) => void;
  onShowItemOptions: (item: AdminOrderItem, order: AdminOrderWithDetails) => void;
  onPickerTakeOrder: (orderId: string) => void;
  onCompleteAssembly: (orderId: string) => void;
}

export default function PickerStaffOrderCard({
  order, isExpanded, myUserId, onToggleExpand, onCallCustomer,
  onShowItemOptions, onPickerTakeOrder, onCompleteAssembly,
}: Props) {
  const statusInfo = STATUSES[order.status] ?? STATUSES.pending;
  const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
  const date = new Date(order.created_at).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  const pickerAssignment = (order.assignments ?? []).find((a) => a.staff_type === 'picker' && a.status !== 'cancelled');
  const courierAssignment = (order.assignments ?? []).find((a) => a.staff_type === 'courier' && a.status !== 'cancelled');
  const isAssignedToMe = pickerAssignment?.staff_id === myUserId;

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
          testID={`picker-order-call-btn-${order.id}`}
        >
          <Ionicons name="person-circle" size={24} color={Colors.light.textSecondary} />
          <View style={s.customerInfoContainer}>
            <Text style={s.customerName}>{profile?.first_name ?? 'Клиент'}</Text>
            <Text style={s.customerPhone}>{profile?.phone ?? 'Телефон не указан'}</Text>
          </View>
          <Ionicons name="call" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={s.addressBox}>
        <Ionicons name="location" size={16} color={Colors.light.textSecondary} />
        <Text style={s.addressText} numberOfLines={2}>{cleanAddress(order.delivery_address)}</Text>
      </View>

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
          {isAssignedToMe
            ? <Text style={[s.assignmentName, { color: Colors.light.success }]}>Вы назначены</Text>
            : <Text style={s.assignmentName}>{pickerAssignment?.staff?.first_name ?? 'не назначен'}</Text>
          }
        </View>
        <View style={s.assignmentRow}>
          <Ionicons name="bicycle-outline" size={14} color={Colors.light.textSecondary} />
          <Text style={s.assignmentLabel}>Курьер:</Text>
          <Text style={s.assignmentName}>{courierAssignment?.staff?.first_name ?? 'не назначен'}</Text>
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.price}>{order.total_amount.toLocaleString('ru')} ₽</Text>
        <Text style={s.date}>{date}</Text>
      </View>

      <TouchableOpacity style={s.expandButton} onPress={() => onToggleExpand(order.id)} testID={`picker-order-expand-btn-${order.id}`}>
        <Text style={s.expandButtonText}>
          {isExpanded ? 'Скрыть состав заказа' : `Показать товары (${order.items?.length ?? 0})`}
        </Text>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.light.primary} />
      </TouchableOpacity>

      {isExpanded && order.items && (
        <AdminOrderItems
          items={order.items}
          orderStatus={order.status}
          onItemOptions={(item) => onShowItemOptions(item, order)}
        />
      )}

      {order.status === 'pending' && (
        <TouchableOpacity
          style={[s.actionButton, { backgroundColor: Colors.light.primary }]}
          onPress={() => Alert.alert(
            'Начать сборку?',
            'Заказ перейдёт в работу. Вернуть в «Новый» может только администратор.',
            [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Начать', onPress: () => onPickerTakeOrder(order.id) },
            ],
          )}
          testID={`picker-order-take-btn-${order.id}`}
        >
          <Text style={s.actionButtonText}>Начать сборку</Text>
        </TouchableOpacity>
      )}
      {order.status === 'processing' && isAssignedToMe && (
        <TouchableOpacity
          style={[s.actionButton, { backgroundColor: Colors.light.success }]}
          onPress={() => Alert.alert(
            'Завершить сборку?',
            'Заказ будет отмечен как собранный и передан курьеру.',
            [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Подтвердить', onPress: () => onCompleteAssembly(order.id) },
            ],
          )}
          testID={`picker-order-assembled-btn-${order.id}`}
        >
          <Text style={s.actionButtonText}>Собрал(а)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
