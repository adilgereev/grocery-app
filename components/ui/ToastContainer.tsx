import React from 'react';
import { ErrorToast } from './ErrorToast';
import { useToastStore } from '@/store/toastStore';

export function ToastContainer() {
  const visible = useToastStore((s) => s.visible);
  const type = useToastStore((s) => s.type);
  const message = useToastStore((s) => s.message);
  const _key = useToastStore((s) => s._key);
  const hideToast = useToastStore((s) => s.hideToast);

  if (!visible) return null;

  return <ErrorToast key={_key} type={type} message={message} onDismiss={hideToast} />;
}
