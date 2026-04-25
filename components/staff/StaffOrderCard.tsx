import { AdminOrderItem, AdminOrderWithDetails } from '@/lib/api/adminApi';
import AdminStaffOrderCard from './AdminStaffOrderCard';
import PickerStaffOrderCard from './PickerStaffOrderCard';
import CourierStaffOrderCard from './CourierStaffOrderCard';

type AdminProps = {
  role: 'admin';
  order: AdminOrderWithDetails;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onCallCustomer: (phone: string | null) => void;
  onShowStatusOptions: (orderId: string, currentStatus: string) => void;
  onShowItemOptions: (item: AdminOrderItem, order: AdminOrderWithDetails) => void;
  onAssignStaff: (orderId: string, staffType: 'picker' | 'courier') => void;
};

type PickerProps = {
  role: 'picker';
  order: AdminOrderWithDetails;
  isExpanded: boolean;
  myUserId: string;
  onToggleExpand: (id: string) => void;
  onCallCustomer: (phone: string | null) => void;
  onShowItemOptions: (item: AdminOrderItem, order: AdminOrderWithDetails) => void;
  onPickerTakeOrder: (orderId: string) => void;
  onCompleteAssembly: (orderId: string) => void;
};

type CourierProps = {
  role: 'courier';
  order: AdminOrderWithDetails;
  myUserId: string;
  onCallCustomer: (phone: string | null) => void;
  onCourierStartDelivery: (orderId: string) => void;
  onCompleteDelivery: (orderId: string) => void;
};

type Props = AdminProps | PickerProps | CourierProps;

export default function StaffOrderCard(props: Props) {
  if (props.role === 'admin') {
    return (
      <AdminStaffOrderCard
        order={props.order}
        isExpanded={props.isExpanded}
        onToggleExpand={props.onToggleExpand}
        onCallCustomer={props.onCallCustomer}
        onShowStatusOptions={props.onShowStatusOptions}
        onShowItemOptions={props.onShowItemOptions}
        onAssignStaff={props.onAssignStaff}
      />
    );
  }
  if (props.role === 'picker') {
    return (
      <PickerStaffOrderCard
        order={props.order}
        isExpanded={props.isExpanded}
        myUserId={props.myUserId}
        onToggleExpand={props.onToggleExpand}
        onCallCustomer={props.onCallCustomer}
        onShowItemOptions={props.onShowItemOptions}
        onPickerTakeOrder={props.onPickerTakeOrder}
        onCompleteAssembly={props.onCompleteAssembly}
      />
    );
  }
  return (
    <CourierStaffOrderCard
      order={props.order}
      myUserId={props.myUserId}
      onCallCustomer={props.onCallCustomer}
      onCourierStartDelivery={props.onCourierStartDelivery}
      onCompleteDelivery={props.onCompleteDelivery}
    />
  );
}
