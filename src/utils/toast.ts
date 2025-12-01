// Wrapper para react-hot-toast com configurações padrão
import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'rgba(76, 175, 80, 0.9)',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: 'rgba(244, 67, 54, 0.9)',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: 'rgba(102, 126, 234, 0.9)',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: 'rgba(26, 26, 46, 0.95)',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};

