interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  }
  
  export const showToast = ({ message, type, duration = 3000 }: ToastProps): void => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
  
    document.body.appendChild(toast);
  
    setTimeout(() => {
      toast.remove();
    }, duration);
  };
  