import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

const SECOND = 1000;

const breakdown = (remainingMs) => {
  const total = Math.max(remainingMs, 0);
  const totalSeconds = Math.floor(total / SECOND);
  return {
    totalMs: total,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isExpired: total <= 0,
  };
};

/**
 * Ticks down to an absolute target time.
 *
 * Remaining time is recomputed from the target on every tick rather than decremented,
 * so the display self-corrects after the JS thread stalls or the app is backgrounded.
 * `onExpire` fires once so the caller can refetch and let the server decide the new state.
 */
export const useCountdown = (targetIso, onExpire) => {
  const [remaining, setRemaining] = useState(() =>
    breakdown(targetIso ? new Date(targetIso).getTime() - Date.now() : 0)
  );
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    firedRef.current = false;
    if (!targetIso) return undefined;

    const target = new Date(targetIso).getTime();

    const tick = () => {
      const next = breakdown(target - Date.now());
      setRemaining(next);
      if (next.isExpired && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current?.();
      }
    };

    tick();
    const interval = setInterval(tick, SECOND);

    // Returning from the background can skip many ticks; resync immediately.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [targetIso]);

  return remaining;
};
