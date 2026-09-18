'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

export interface TurnstileWidgetRef {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error?: any) => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'auto' | 'light' | 'dark';
  size?: 'normal' | 'compact' | 'flexible' | 'invisible';
}

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onSuccess, onError, onExpire, className = '', theme = 'auto', size = 'flexible' }, ref) => {
    const turnstileRef = useRef<TurnstileInstance | null>(null);
    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAE8RCcp0lmXPPvSK';

    useImperativeHandle(ref, () => ({
      reset: () => {
        try {
          turnstileRef.current?.reset();
        } catch (e) {
          // ignore reset error if widget isn't fully mounted
        }
      },
    }));

    if (!siteKey) {
      return null;
    }

    return (
      <div className={`flex justify-center my-3 min-h-[65px] ${className}`}>
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={onSuccess}
          onError={(err) => {
            console.warn('[Turnstile] Challenge error:', err);
            onError?.(err);
          }}
          onExpire={() => {
            console.info('[Turnstile] Token expired');
            onExpire?.();
          }}
          options={{
            theme,
            size,
            retry: 'auto',
          }}
        />
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
