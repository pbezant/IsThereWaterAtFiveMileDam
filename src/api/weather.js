import { APIS, DAM_COORDS } from '../config.js';

export async function fetchWeather() {
  const url = `${APIS.OPEN_METEO}?latitude=${DAM_COORDS.lat}&longitude=${DAM_COORDS.lng}&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const json = await res.json();
  const c = json.current;
  if (!c) return null;
  return {
    tempF: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    weatherCode: c.weather_code,
    time: c.time,
  };
}
