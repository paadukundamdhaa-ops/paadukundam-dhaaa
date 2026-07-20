import { useEffect, useRef, useCallback } from 'react';

/**
 * useIdleTimeout
 * Automatically calls `onIdle` after `timeoutMs` milliseconds of user inactivity.
 * Inactivity means no: mousemove, mousedown, keydown, touchstart, or scroll.
 *
 * @param {Function} onIdle  - Callback to run when the user has been idle too long
 * @param {number}   timeoutMs - Idle duration in milliseconds (default: 10 minutes)
 */
export function useIdleTimeout(onIdle, timeoutMs = 10 * 60 * 1000) {
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  // Keep the callback ref up-to-date without restarting listeners
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdleRef.current();
    }, timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    // Attach listeners to detect any user activity
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));

    // Start the initial timer
    resetTimer();

    return () => {
      // Cleanup on unmount
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);
}
