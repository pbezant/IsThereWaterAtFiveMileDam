import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchKyleData, fetchWimberleyData, fetchSanMarcosData } from '../api/usgs.js';
import { fetchForecast } from '../api/nwps.js';
import { fetchWeather } from '../api/weather.js';
import { fetchWaterQuality } from '../api/wqp.js';
import { classifyByCfs } from '../utils/status.js';
import { useRefresh } from './useRefresh.js';

const INITIAL = {
  kyle: null,
  wimberley: null,
  sanMarcos: null,
  forecast: null,
  weather: null,
  waterQuality: null,
  status: null,
  loading: true,
  error: null,
  lastFetched: null,
  refreshing: false,
  stale: false,   // showing earlier data because the latest request failed
  fromCache: false,
};

const MIN_GAP_MS = 60 * 1000; // don't refetch more than once a minute unless asked

export function useRiverData() {
  const [data, setData] = useState(INITIAL);
  const lastRun = useRef(0);

  const load = useCallback(async (manual = false) => {
    const forced = manual === true;
    if (!forced && Date.now() - lastRun.current < MIN_GAP_MS) return;
    lastRun.current = Date.now();
    // Keep showing previous data while refreshing (don't flash loading)
    setData(prev => ({ ...prev, loading: prev.lastFetched === null && !prev.kyle, refreshing: true }));

    // Fetch all sources independently — USGS is required; others degrade gracefully
    const [kyleResult, wimberleyResult, sanMarcosResult, forecastResult, weatherResult, wqResult] =
      await Promise.allSettled([
        fetchKyleData(),
        fetchWimberleyData(),
        fetchSanMarcosData(),
        fetchForecast(),
        fetchWeather(),
        fetchWaterQuality(),
      ]);

    const ok = r => r.status === 'fulfilled';
    const kyleFailed = !ok(kyleResult);
    const kyleNew = ok(kyleResult) ? kyleResult.value : null;

    // Persist lightweight snapshot to sessionStorage (skip history arrays — Date objects don't survive JSON roundtrip)
    if (kyleNew) {
      try {
        sessionStorage.setItem('fmd_last_kyle', JSON.stringify({
          discharge: kyleNew.discharge,
          gageHeight: kyleNew.gageHeight,
          precip: kyleNew.precip,
          trend: kyleNew.trend,
          dischargeHistory: [],
          gageHistory: [],
        }));
      } catch {}
    }

    // A failed request never wipes data we already have: keep the last good value and flag it stale.
    setData(prev => {
      const pick = (r, previous) => (ok(r) ? r.value : previous);
      const kyle = kyleNew ?? prev.kyle;
      return {
        kyle,
        wimberley: pick(wimberleyResult, prev.wimberley),
        sanMarcos: pick(sanMarcosResult, prev.sanMarcos),
        forecast: pick(forecastResult, prev.forecast),
        weather: pick(weatherResult, prev.weather),
        waterQuality: pick(wqResult, prev.waterQuality),
        status: classifyByCfs(kyle?.discharge?.value ?? null),
        loading: false,
        refreshing: false,
        error: kyleFailed ? (kyleResult.reason?.message ?? 'Request failed') : null,
        stale: kyleFailed && Boolean(prev.kyle),
        fromCache: false,
        lastFetched: new Date().toISOString(),
      };
    });
  }, []);

  // Load from sessionStorage immediately so there's no empty flash on return visit
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('fmd_last_kyle');
      if (cached) {
        const kyle = JSON.parse(cached);
        setData(prev => ({
          ...prev,
          kyle,
          fromCache: true,
          status: classifyByCfs(kyle?.discharge?.value ?? null),
        }));
      }
    } catch {}
    load(true);
  }, [load]);

  useRefresh(load);

  const refresh = useCallback(() => load(true), [load]);
  return { ...data, refresh };
}
