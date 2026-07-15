import { APIS, DAM_COORDS } from '../config.js';

export async function fetchWeather() {
  const url = `${APIS.OPEN_METEO}?latitude=${DAM_COORDS.lat}&longitude=${DAM_COORDS.lng}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=precipitation_probability&forecast_days=1&temperature_unit=fahrenheit&timezone=America%2FChicago`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const json = await res.json();
  const c = json.current;
  if (!c) return null;

  // Match the current reading to the nearest hourly forecast slot to get chance of rain
  let precipProbability = null;
  const hourly = json.hourly;
  if (hourly?.time?.length) {
    const nowMs = new Date(c.time).getTime();
    let bestIdx = 0;
    let bestDiff = Infinity;
    hourly.time.forEach((t, i) => {
      const diff = Math.abs(new Date(t).getTime() - nowMs);
      if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
    });
    precipProbability = hourly.precipitation_probability?.[bestIdx] ?? null;
  }

  return {
    tempF: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    weatherCode: c.weather_code,
    precipProbability,
    time: c.time,
  };
}
