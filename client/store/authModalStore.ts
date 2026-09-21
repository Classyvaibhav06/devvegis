import { create } from 'zustand';

interface AuthModalState {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  redirectUrl?: string;
  onSuccessCallback?: () => void;
  openModal: (mode?: 'signin' | 'signup', redirectUrl?: string, onSuccess?: () => void) => void;
  closeModal: () => void;
  setMode: (mode: 'signin' | 'signup') => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: 'signin',
  redirectUrl: undefined,
  onSuccessCallback: undefined,
  openModal: (mode = 'signin', redirectUrl, onSuccess) =>
    set({
      isOpen: true,
      mode,
      redirectUrl,
      onSuccessCallback: onSuccess,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      redirectUrl: undefined,
      onSuccessCallback: undefined,
    }),
  setMode: (mode) => set({ mode }),
}));
