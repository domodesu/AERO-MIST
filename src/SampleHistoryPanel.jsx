import React from 'react';
import { Clock3, Cloud, Droplets, History, Thermometer } from 'lucide-react';
import { compareHumidity, compareTemperatures, formatDifference } from './sampleHistory';

const timeFormatter = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const time = value => timeFormatter.format(new Date(value));
const temperature = (value, unit) => `${(unit === 'F' ? value * 9 / 5 + 32 : value).toFixed(1)}°${unit}`;
function outdoorFor(record) {
  const data = record?.outdoor;
  return data && Number.isFinite(data.temperature) && Number.isFinite(data.humidity) && data.humidity >= 0 && data.humidity <= 100 && Number.isFinite(data.time) && !Number.isNaN(new Date(data.time).getTime()) ? data : null;
}

export default function SampleHistoryPanel({ records, unit }) {
  return <section className="history-panel panel" aria-labelledby="history-panel-title">
    <div className="history-panel-header"><div><div className="section-kicker">ILLUSTRATIVE SYSTEM ACTIVITY</div><h2 id="history-panel-title">Sample history <span className="heading-dot">●</span></h2><p>Snapshots every 15 minutes while the app is open with sample data selected.</p></div><span className="sample-history-pill"><Clock3 size={13}/> Kept for 1 hour</span></div>
    <div className="sample-history-notice"><strong>Sample system data, real outdoor estimates.</strong> The comparison is illustrative and does not show the effect of a real misting system. <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> is a regional weather model, not a sensor at the device. Weather data: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.</div>
    {records.length ? <div className="sample-records">{records.map((record, index) => {
      const outdoor = outdoorFor(record);
      const previous = records[index + 1];
      const previousOutdoor = outdoorFor(previous);
      return <article className="sample-record" key={record.id}>
        <div className="sample-record-head"><div><span className="sample-record-icon"><History size={17}/></span><div><strong>Sample snapshot</strong><small>{time(record.recordedAt)} · Manila time</small></div></div><span className="sample-phase">{record.phase === 'misting' ? 'SAMPLE MISTING' : 'SAMPLE COOLDOWN'}</span></div>
        <div className="sample-compare"><div className="compare-reading"><div className="compare-heading"><Droplets size={15}/> AERO-MIST <span>SAMPLE</span></div><p><strong>{temperature(record.temperature, unit)}</strong><span>Temperature</span></p><p><strong>{record.humidity}%</strong><span>Relative humidity</span></p></div><div className="compare-reading"><div className="compare-heading"><Cloud size={15}/> OUTSIDE <span>MODEL</span></div>{outdoor ? <><p><strong>{temperature(outdoor.temperature, unit)}</strong><span>Temperature</span></p><p><strong>{outdoor.humidity}%</strong><span>Relative humidity</span></p><small>Model time: {time(outdoor.time)}</small></> : <p className="outdoor-unavailable">Outdoor weather unavailable for this snapshot.</p>}</div></div>
        <div className="sample-difference"><span>DIFFERENCE <small>sample minus outside</small></span><div><span><Thermometer size={15}/> {outdoor ? formatDifference(compareTemperatures(record.temperature, outdoor.temperature, unit), `°${unit}`) : 'Unavailable'}</span><span><Droplets size={15}/> {outdoor ? formatDifference(compareHumidity(record.humidity, outdoor.humidity), 'percentage points') : 'Unavailable'}</span></div></div>
        {previous && <div className="history-change"><strong>Change since previous snapshot</strong><span>Sample: {formatDifference(compareTemperatures(record.temperature, previous.temperature, unit), `°${unit}`)} · {formatDifference(compareHumidity(record.humidity, previous.humidity), 'pp')}</span><span>Outside: {outdoor && previousOutdoor && outdoor.time !== previousOutdoor.time ? `${formatDifference(compareTemperatures(outdoor.temperature, previousOutdoor.temperature, unit), `°${unit}`)} · ${formatDifference(compareHumidity(outdoor.humidity, previousOutdoor.humidity), 'pp')}` : 'Unavailable or same model time'}</span></div>}
      </article>;
    })}</div> : <div className="history-empty"><div className="history-empty-icon"><History size={28}/></div><h3>No sample snapshots yet</h3><p>A sample snapshot will appear while the app is open with sample data selected.</p></div>}
    <p className="history-storage-note"><Clock3 size={14}/> Sample snapshots are stored only in this browser and expire one hour after they are created. If the browser is closed, expired snapshots are removed when it returns. Actual system history is not affected.</p>
  </section>;
}
