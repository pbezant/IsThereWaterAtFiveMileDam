import { APIS } from '../config.js';
import { parseWqpCsv, extractLatestWqSample } from '../utils/wqpCsv.js';

export async function fetchWaterQuality() {
  // mimeType=json returns 406; must use csv
  const url = `${APIS.WQP}?siteid=TXSTRMTM_WQX-15019&mimeType=csv&zip=no&dataProfile=resultPhysChem`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WQP HTTP ${res.status}`);
  const text = await res.text();
  const rows = parseWqpCsv(text);
  return extractLatestWqSample(rows);
}
