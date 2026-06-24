// USGS gauge stations
export const STATIONS = {
  KYLE: '08171300',       // Primary — Blanco Rv nr Kyle, TX (closest to Five Mile Dam)
  WIMBERLEY: '08171000',  // Upstream — Blanco Rv at Wimberley, TX (leading indicator + flood stages)
  SAN_MARCOS: '08171350', // Downstream — Blanco Rv at San Marcos, TX
};

// Discharge thresholds (cfs) at KYLE station — tune these based on local knowledge
export const CFS_THRESHOLDS = {
  DRY: 0,    // 0 cfs → DRY
  LOW: 1,    // 1–50 cfs → LOW
  GOOD: 51,  // 51–400 cfs → GOOD swimming
  HIGH: 401, // 401–800 cfs → HIGH / strong current
  FLOOD: 801, // 800+ cfs → FLOODING
};

// Flood stage thresholds at Wimberley (ft) — NWS AHPS confirmed values
export const WIMBERLEY_STAGES = {
  ACTION: 10,
  MINOR: 13,
  MODERATE: 17,
  MAJOR: 26,
};

// Five Mile Dam GPS
export const DAM_COORDS = { lat: 29.94333, lng: -97.90139 };

// Data refresh interval (ms) — USGS updates every ~15 min; 5 min keeps us fresh
export const REFRESH_MS = 5 * 60 * 1000;

// Stale data threshold — if USGS dateTime is older than this, show a warning
export const STALE_MS = 2 * 60 * 60 * 1000;

// API endpoints
export const APIS = {
  USGS_IV: 'https://waterservices.usgs.gov/nwis/iv/',
  NWPS: 'https://api.water.noaa.gov/nwps/v1/gauges',
  OPEN_METEO: 'https://api.open-meteo.com/v1/forecast',
  WQP: 'https://www.waterqualitydata.us/data/Result/search',
};

// USGS parameter codes
export const PARAMS = {
  DISCHARGE: '00060',
  GAGE_HEIGHT: '00065',
  PRECIP: '00045',
};
