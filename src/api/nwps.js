import { APIS } from '../config.js';

export async function fetchForecast(site = '08171300') {
  const url = `${APIS.NWPS}/${site}/stageflow`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NWPS HTTP ${res.status}`);
  const json = await res.json();

  const fc = json.forecast;
  if (!fc?.data?.length) return null;

  // primary = stage (ft), secondary = flow in kcfs (multiply ×1000, filter -999)
  const points = fc.data.map(d => ({
    t: new Date(d.validTime),
    stageFt: d.primary != null ? d.primary : null,
    flowCfs: d.secondary != null && d.secondary > -998 ? d.secondary * 1000 : null,
  })).filter(p => p.stageFt != null);

  if (!points.length) return null;

  const peak = points.reduce((m, p) => (p.stageFt > m.stageFt ? p : m), points[0]);

  return {
    issuedTime: fc.issuedTime ?? null,
    points,
    peakStageFt: peak.stageFt,
    peakTime: peak.t,
  };
}
