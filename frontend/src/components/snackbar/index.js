import { toast as reactToast } from 'react-hot-toast';

export const toast = {
  success: (message) => reactToast.success(message),
  error: (message) => reactToast.error(message),
  promise: (promise, messages) => reactToast.promise(promise, messages),
}; 