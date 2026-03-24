// src/lib/toast.ts

import { emitToast, ToastType } from '../components/ui/Toast';


function show(type: ToastType, title: string, options?: { description?: string }) {
  emitToast({ id: Math.random().toString(36).slice(2), type, title, description: options?.description });
}

export const toast = {
  success: (title: string, options?: { description?: string }) => show('success', title, options),
  error:   (title: string, options?: { description?: string }) => show('error',   title, options),
  warning: (title: string, options?: { description?: string }) => show('warning', title, options),
  info:    (title: string, options?: { description?: string }) => show('info',    title, options),
};