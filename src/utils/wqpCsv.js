// Minimal CSV parser for WQP results (mimeType=csv only — json returns 406)
export function parseWqpCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  return lines.slice(1).map(line => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] || '').replace(/"/g, '').trim()]));
  });
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { result.push(current); current = ''; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

// Extract most-recent sample values from parsed WQP rows
export function extractLatestWqSample(rows) {
  if (!rows.length) return null;

  // Group by sample date and find the most recent
  const byDate = {};
  for (const row of rows) {
    const date = row['ActivityStartDate'];
    if (!date) continue;
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(row);
  }

  const dates = Object.keys(byDate).sort().reverse();
  if (!dates.length) return null;

  const latestDate = dates[0];
  const sample = byDate[latestDate];

  const find = (...keywords) => {
    const row = sample.find(r => {
      const name = (r['CharacteristicName'] ?? '').toLowerCase();
      return keywords.some(k => name.includes(k.toLowerCase()));
    });
    if (!row) return null;
    // Try multiple value columns WQP may use
    const raw = row['ResultMeasureValue'] ?? row['Result Value'] ?? row['MeasureValue'] ?? '';
    const v = parseFloat(raw);
    return isNaN(v) ? null : v;
  };

  return {
    date: latestDate,
    waterTempC: find('temperature, water', 'water temperature', 'temp'),
    pH: find('ph'),
    dissolvedOxygen: find('dissolved oxygen', 'do '),
    conductivity: find('specific conductance', 'conductivity', 'conductance'),
  };
}
