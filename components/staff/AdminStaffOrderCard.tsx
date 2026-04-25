import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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
  onToggleExpand: (id: string) => void;
  onCallCustomer: (phone: string | null) => void;
  onShowStatusOptions: (orderId: string, currentStatus: string) => void;
  onShowItemOptions: (item: AdminOrderItem, order: AdminOrderWithDetails) => void;
  onAssignStaff: (orderId: string, staffType: 'picker' | 'courier') => void;
}

export default function AdminStaffOrderCard({
  order, isExpanded, onToggleExpand, onCallCustomer,
  onShowStatusOptions, onShowItemOptions, onAssignStaff,
}: Props) {
  const statusInfo = STATUSES[order.status] ?? STATUSES.pending;
  const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
  const activeAssignments = (order.assignments ?? []).filter((a) => a.status !== 'cancelled');
  const pickerAssignment = activeAssignments.find((a) => a.staff_type === 'picker');
  const courierAssignment = activeAssignments.find((a) => a.staff_type === 'courier');
  const date = new Date(order.created_at).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

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
          testID={`staff-order-call-btn-${order.id}`}
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
          <Text style={s.assignmentName}>{pickerAssignment?.staff?.first_name ?? 'не назначен'}</Text>
          <TouchableOpacity onPress={() => onAssignStaff(order.id, 'picker')} testID={`staff-order-assign-picker-btn-${order.id}`}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
        <View style={s.assignmentRow}>
          <Ionicons name="bicycle-outline" size={14} color={Colors.light.textSecondary} />
          <Text style={s.assignmentLabel}>Курьер:</Text>
          <Text style={s.assignmentName}>{courierAssignment?.staff?.first_name ?? 'не назначен'}</Text>
          <TouchableOpacity onPress={() => onAssignStaff(order.id, 'courier')} testID={`staff-order-assign-courier-btn-${order.id}`}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.price}>{order.total_amount.toLocaleString('ru')} ₽</Text>
        <Text style={s.date}>{date}</Text>
      </View>

      <TouchableOpacity style={s.expandButton} onPress={() => onToggleExpand(order.id)} testID={`staff-order-expand-btn-${order.id}`}>
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

      <TouchableOpacity
        style={[s.actionButton, { backgroundColor: statusInfo.color }]}
        onPress={() => onShowStatusOptions(order.id, order.status)}
        testID={`staff-order-status-btn-${order.id}`}
      >
        <Text style={s.actionButtonText}>Изменить статус</Text>
      </TouchableOpacity>
    </View>
  );
}
