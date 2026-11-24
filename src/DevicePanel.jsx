import React from 'react';
import { BatteryMedium, Cloud, Droplets, Gauge, Radio, Thermometer, Timer } from 'lucide-react';

function UnavailableMetric({ icon: Icon, label, unit, tone }) {
  return <article className="metric-card"><div className="metric-top"><div className={`metric-icon ${tone}`}><Icon size={20}/></div><span className="metric-label">{label}</span></div><div className="metric-value" aria-label={`${label} unavailable`}>--<span>{unit}</span></div><div className="device-unavailable">Awaiting device data</div></article>;
}

export default function DevicePanel({ unit }) {
  return <>
    <div className="device-offline-banner"><Radio size={17}/><span><strong>Device not connected.</strong> Actual readings and timers are unavailable until AERO-MIST is connected.</span></div>
    <section className="device-status-card" aria-label="Device connection status"><div className="device-status-icon"><Radio size={21}/></div><div><strong>AERO-MIST device</strong><span>Not connected · No device data received</span></div><span className="device-status-label">OFFLINE</span></section>
    <div className="section-heading conditions-heading"><div><div className="section-kicker">ACTUAL SYSTEM READINGS</div><h2>Current conditions <span className="heading-dot device-dot">●</span></h2></div><span className="sample-tag">NO DATA RECEIVED</span></div>
    <div className="metrics-grid"><UnavailableMetric icon={Thermometer} label="Temperature" unit={`°${unit}`} tone="mint"/><UnavailableMetric icon={Droplets} label="Humidity" unit="%" tone="blue"/><UnavailableMetric icon={Thermometer} label="Heat index" unit={`°${unit}`} tone="peach"/><UnavailableMetric icon={BatteryMedium} label="Battery" unit="%" tone="lime"/></div>
    <div className="section-heading lower-heading"><div><div className="section-kicker">DEVICE CYCLE</div><h2>System status <span className="heading-dot device-dot">●</span></h2></div><span className="sample-tag">AWAITING DEVICE</span></div>
    <div className="system-grid"><article className="system-card"><div className="system-icon mist-icon"><Cloud size={21}/></div><div className="system-copy"><div className="system-title">Misting time remaining</div><p>Not available while disconnected</p></div><div className="timer-value" aria-label="Misting time unavailable">--:--<small>MIN : SEC</small></div></article><article className="system-card"><div className="system-icon cooldown-icon"><Timer size={21}/></div><div className="system-copy"><div className="system-title">Cooldown time remaining</div><p>Not available while disconnected</p></div><div className="timer-value" aria-label="Cooldown time unavailable">--:--<small>MIN : SEC</small></div></article></div>
    <div className="dashboard-grid"><section className="panel device-empty-panel"><div className="panel-header"><div><div className="section-kicker">A CLOSER LOOK</div><h2>Temperature trend</h2><p>Actual device readings will appear here when available.</p></div></div><div className="device-empty-message"><Thermometer size={20}/><span>No temperature data available</span></div></section><section className="panel device-empty-panel"><div className="panel-header"><div><div className="section-kicker">HOW IT FEELS</div><h2>Comfort meter</h2><p>Requires actual device data.</p></div><div className="panel-icon"><Gauge size={19}/></div></div><div className="device-empty-message"><Gauge size={20}/><span>Comfort level unavailable</span></div></section></div>
  </>;
}
