'use client';

import { useEffect } from 'react';
import { clsx } from 'clsx';
import { useToast, Toast as ToastType } from '@/hooks/use-toast';

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastType }) {
  const { dismissToast } = useToast();

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.id, toast.duration, dismissToast]);

  return (
    <div
      className={clsx(
        'pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
        {
          'border-green-200 bg-green-50': toast.type === 'success',
          'border-red-200 bg-red-50': toast.type === 'error',
          'border-yellow-200 bg-yellow-50': toast.type === 'warning',
          'border-blue-200 bg-blue-50': toast.type === 'info',
        }
      )}
    >
      <div className="flex-1">
        <p
          className={clsx('text-sm font-medium', {
            'text-green-900': toast.type === 'success',
            'text-red-900': toast.type === 'error',
            'text-yellow-900': toast.type === 'warning',
            'text-blue-900': toast.type === 'info',
          })}
        >
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => dismissToast(toast.id)}
        className={clsx(
          'rounded-md p-1 transition-colors hover:bg-black/5',
          {
            'text-green-700': toast.type === 'success',
            'text-red-700': toast.type === 'error',
            'text-yellow-700': toast.type === 'warning',
            'text-blue-700': toast.type === 'info',
          }
        )}
        aria-label="Dismiss"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
