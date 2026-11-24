import React from 'react';
import { ArrowRight, Clock3, Cloud, Database, History, Thermometer } from 'lucide-react';
import SampleHistoryPanel from './SampleHistoryPanel';

export default function HistoryPanel({ profile, records, unit }) {
  if (profile === 'sample') return <SampleHistoryPanel records={records} unit={unit}/>;
  return <section className="history-panel panel" aria-labelledby="history-panel-title">
    <div className="history-panel-header">
      <div><div className="section-kicker">YOUR SYSTEM OVER TIME</div><h2 id="history-panel-title">Past activity <span className="heading-dot">●</span></h2><p>Look back at your AERO-MIST system’s activity.</p></div>
      <span className="history-connection"><span/> Not connected</span>
    </div>
    <div className="history-empty">
      <div className="history-empty-icon"><History size={28} strokeWidth={1.6}/></div>
      <h3>No system history yet</h3>
      <p>Connect your AERO-MIST device and set up history storage to record past activity. Actual system history is separate from the browser’s sample snapshots.</p>
      <a href="#system" className="history-link">View system status <ArrowRight size={15}/></a>
    </div>
    <div className="history-future"><span className="history-future-heading">HISTORY CAN INCLUDE</span><div><span><Cloud size={15}/> Misting cycles</span><span><Clock3 size={15}/> Cooldowns</span><span><Thermometer size={15}/> Sensor readings</span></div></div>
    <p className="history-storage-note"><Database size={14}/> Device connection and shared storage are not set up yet.</p>
  </section>;
}
