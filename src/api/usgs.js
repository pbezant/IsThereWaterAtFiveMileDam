import { APIS, PARAMS } from '../config.js';

export async function fetchInstantaneous(sites, parameterCd, period = 'P7D') {
  const params = Array.isArray(parameterCd) ? parameterCd.join(',') : parameterCd;
  const siteStr = Array.isArray(sites) ? sites.join(',') : sites;
  const url = `${APIS.USGS_IV}?sites=${siteStr}&parameterCd=${params}&period=${period}&format=json&siteStatus=all`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);
  const json = await res.json();
  return json.value?.timeSeries ?? [];
}

export function seriesFor(timeSeries, code) {
  return timeSeries.find(ts => ts.variable.variableCode[0].value === code) ?? null;
}

export function latestReading(series) {
  if (!series) return null;
  const points = series.values?.[0]?.value ?? [];
  if (!points.length) return null;
  const last = points[points.length - 1];
  const noData = Number(series.variable.noDataValue);
  const v = Number(last.value);
  return {
    value: v === noData || isNaN(v) ? null : v,
    dateTime: last.dateTime,
    provisional: (last.qualifiers ?? []).includes('P'),
    unit: series.variable.unit.unitCode,
    siteName: series.sourceInfo.siteName,
  };
}

export function timeSeriesPoints(series) {
  if (!series) return [];
  const noData = Number(series.variable.noDataValue);
  return (series.values?.[0]?.value ?? [])
    .map(p => ({ t: new Date(p.dateTime), y: Number(p.value) }))
    .filter(p => p.y !== noData && !isNaN(p.y));
}

export function computeTrend(points) {
  if (!points || points.length < 2) return { dir: 'steady', delta: 0 };
  const last = points[points.length - 1].y;
  const prior = points[Math.max(0, points.length - 5)].y;
  const delta = last - prior;
  const threshold = Math.max(0.5, Math.abs(prior) * 0.03);
  if (delta > threshold) return { dir: 'rising', delta };
  if (delta < -threshold) return { dir: 'falling', delta };
  return { dir: 'steady', delta };
}

// Fetch all Kyle station params (discharge, gage height, precip) + 7-day history in one call
export async function fetchKyleData() {
  const ts = await fetchInstantaneous(
    '08171300',
    [PARAMS.DISCHARGE, PARAMS.GAGE_HEIGHT, PARAMS.PRECIP],
    'P7D'
  );
  const dischargeSeries = seriesFor(ts, PARAMS.DISCHARGE);
  const gageSeries = seriesFor(ts, PARAMS.GAGE_HEIGHT);
  const precipSeries = seriesFor(ts, PARAMS.PRECIP);

  const discharge = latestReading(dischargeSeries);
  const gageHeight = latestReading(gageSeries);
  const precip = latestReading(precipSeries);
  const dischargeHistory = timeSeriesPoints(dischargeSeries);
  const gageHistory = timeSeriesPoints(gageSeries);
  const trend = computeTrend(dischargeHistory);

  return { discharge, gageHeight, precip, dischargeHistory, gageHistory, trend };
}

// Fetch upstream Wimberley gage height (latest only — 2-hour window)
export async function fetchWimberleyData() {
  const ts = await fetchInstantaneous('08171000', PARAMS.GAGE_HEIGHT, 'PT2H');
  const series = seriesFor(ts, PARAMS.GAGE_HEIGHT);
  return latestReading(series);
}

// Fetch downstream San Marcos discharge + gage height (latest — 2-hour window)
export async function fetchSanMarcosData() {
  const ts = await fetchInstantaneous(
    '08171350',
    [PARAMS.DISCHARGE, PARAMS.GAGE_HEIGHT],
    'PT2H'
  );
  return {
    discharge: latestReading(seriesFor(ts, PARAMS.DISCHARGE)),
    gageHeight: latestReading(seriesFor(ts, PARAMS.GAGE_HEIGHT)),
  };
}
