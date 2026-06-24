import { useEffect, useCallback } from 'react';
import { REFRESH_MS } from '../config.js';

export function useRefresh(callback) {
  const stableCallback = useCallback(callback, [callback]);

  useEffect(() => {
    let interval = setInterval(stableCallback, REFRESH_MS);

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        stableCallback();
        clearInterval(interval);
        interval = setInterval(stableCallback, REFRESH_MS);
      } else {
        clearInterval(interval);
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [stableCallback]);
}
