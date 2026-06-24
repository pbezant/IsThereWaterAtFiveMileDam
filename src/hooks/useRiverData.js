import { useState, useCallback, useEffect } from 'react';
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
};

export function useRiverData() {
  const [data, setData] = useState(INITIAL);

  const load = useCallback(async () => {
    // Keep showing previous data while refreshing (don't flash loading)
    setData(prev => ({ ...prev, loading: prev.lastFetched === null }));

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

    const kyle = kyleResult.status === 'fulfilled' ? kyleResult.value : null;
    const wimberley = wimberleyResult.status === 'fulfilled' ? wimberleyResult.value : null;
    const sanMarcos = sanMarcosResult.status === 'fulfilled' ? sanMarcosResult.value : null;
    const forecast = forecastResult.status === 'fulfilled' ? forecastResult.value : null;
    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
    const waterQuality = wqResult.status === 'fulfilled' ? wqResult.value : null;

    const status = classifyByCfs(kyle?.discharge?.value ?? null);

    // Persist lightweight snapshot to sessionStorage (skip history arrays — Date objects don't survive JSON roundtrip)
    if (kyle) {
      try {
        sessionStorage.setItem('fmd_last_kyle', JSON.stringify({
          discharge: kyle.discharge,
          gageHeight: kyle.gageHeight,
          precip: kyle.precip,
          trend: kyle.trend,
          dischargeHistory: [],
          gageHistory: [],
        }));
      } catch {}
    }

    setData({
      kyle,
      wimberley,
      sanMarcos,
      forecast,
      weather,
      waterQuality,
      status,
      loading: false,
      error: kyleResult.status === 'rejected' ? kyleResult.reason?.message : null,
      lastFetched: new Date().toISOString(),
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
          status: classifyByCfs(kyle?.discharge?.value ?? null),
        }));
      }
    } catch {}
    load();
  }, [load]);

  useRefresh(load);

  return data;
}
