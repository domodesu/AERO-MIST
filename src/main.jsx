import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowDownRight, ArrowRight, BatteryMedium, Check, ChevronDown, CircleHelp, Clock3, Cloud, Droplets, Gauge, LayoutDashboard, Leaf, Menu, Radio, RefreshCw, Settings2, Sparkles, Thermometer, Timer, Wind, X, Zap } from 'lucide-react';
import './styles.css';

const initialReadings = { temperature: 28.4, humidity: 64, heatIndex: 31.2, battery: 78 };
const ranges = ['24 hours', '7 days', '30 days'];
const formatTime = date => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const formatTimer = seconds => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0')}:${String(Math.max(0, seconds) % 60).padStart(2, '0')}`;

function Brand() {
  return <div className="brand"><div className="brand-icon"><Wind size={23} strokeWidth={2.3} /></div><div><div className="brand-name">AERO<span>-</span>MIST</div><div className="brand-caption">SMART COOLING SYSTEM</div></div></div>;
}
function Sidebar({ open, onClose, unit, setUnit }) {
  return <><div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose} /> <aside className={`sidebar ${open ? 'open' : ''}`}>
    <div className="sidebar-top"><Brand /><button className="close-menu icon-button" onClick={onClose} aria-label="Close menu"><X size={19}/></button></div>
    <div className="nav-label">WORKSPACE</div>
    <a className="nav-item active" href="#overview" onClick={onClose}><LayoutDashboard size={18}/><span>Overview</span><span className="active-dot" /></a>
    <a className="nav-item" href="#trends" onClick={onClose}><Activity size={18}/><span>Environment</span></a>
    <a className="nav-item" href="#system" onClick={onClose}><Timer size={18}/><span>System status</span></a>
    <div className="sidebar-bottom">
      <div className="sidebar-note"><div className="note-icon"><Leaf size={17}/></div><strong>A little cooler, naturally.</strong><p>A better environment starts with a little mist.</p><div className="note-decoration"><Wind size={70}/></div></div>
      <div className="sidebar-foot"><div className="foot-avatar">A</div><div><strong>AERO-MIST</strong><span>Environment monitor</span></div><Settings2 size={16}/></div>
    </div>
  </aside></>;
}
function MetricCard({ icon: Icon, label, value, unit, foot, tone, badge }) {
  return <article className="metric-card"><div className="metric-top"><div className={`metric-icon ${tone}`}><Icon size={20}/></div><span className="metric-label">{label}</span><span className="metric-more">···</span></div><div className="metric-value">{value}<span>{unit}</span></div><div className="metric-foot"><span className={`metric-badge ${tone}`}>{badge}</span><span>{foot}</span></div></article>;
}
function TrendChart({ range, unit }) {
  const data = range === '24 hours' ? [29.7,29.4,29.6,29.1,29.3,28.8,29.0,28.7,28.8,28.4,28.6,28.1,28.4] : range === '7 days' ? [30.2,29.5,29.8,29.1,29.4,28.9,29.3,28.7,29.1,28.5,28.8,28.2,28.4] : [30.6,30.1,30.3,29.8,30.0,29.5,29.7,29.2,29.5,28.9,29.1,28.5,28.4];
  const labels = range === '24 hours' ? ['12 AM','4 AM','8 AM','12 PM','4 PM','8 PM','NOW'] : range === '7 days' ? ['6 DAYS AGO','5 DAYS','4 DAYS','3 DAYS','2 DAYS','1 DAY','NOW'] : ['30 DAYS AGO','25 DAYS','20 DAYS','15 DAYS','10 DAYS','5 DAYS','NOW'];
  const points = data.map((v,i) => [i * 50, 115 - (v - 27) * 23]);
  const line = points.map(([x,y],i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const area = `${line} L 600 145 L 0 145 Z`;
  const convert = n => unit === 'C' ? `${n}°` : `${Math.round(n * 9 / 5 + 32)}°`;
  return <div className="chart-wrap"><div className="chart-y"><span>{convert(32)}</span><span>{convert(30)}</span><span>{convert(28)}</span><span>{convert(26)}</span></div><div className="chart-main"><svg className="chart" viewBox="0 0 600 145" preserveAspectRatio="none" role="img" aria-label={`Sample temperature trend over ${range}`}><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#68c8ae" stopOpacity=".3"/><stop offset="100%" stopColor="#68c8ae" stopOpacity=".015"/></linearGradient></defs>{[0,48,96,144].map(y=><line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#edf1ee" strokeDasharray="4 5"/>)}<path d={area} fill="url(#fill)"/><path d={line} fill="none" stroke="#27a786" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/><circle cx="600" cy={points[12][1]} r="5" fill="#27a786" stroke="white" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg><div className="chart-labels">{labels.map(l=><span key={l}>{l}</span>)}</div></div></div>;
}
function App() {
  const [unit, setUnit] = useState('C');
  const [range, setRange] = useState('24 hours');
  const [readings, setReadings] = useState(initialReadings);
  const [updated, setUpdated] = useState(new Date());
  const [cycle, setCycle] = useState({ phase: 'misting', seconds: 8 * 60 + 24 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => { const id = setInterval(() => setCycle(current => current.seconds > 0 ? { ...current, seconds: current.seconds - 1 } : current.phase === 'misting' ? { phase: 'cooldown', seconds: 5 * 60 } : { phase: 'misting', seconds: 10 * 60 }), 1000); return () => clearInterval(id); }, []);
  const temperature = n => unit === 'C' ? n.toFixed(1) : (n * 9 / 5 + 32).toFixed(1);
  const date = useMemo(() => new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }), []);
  function refresh() { setRefreshing(true); setReadings(initialReadings); setUpdated(new Date()); setTimeout(() => setRefreshing(false), 500); }
  return <div className="app-shell"><Sidebar open={menuOpen} onClose={()=>setMenuOpen(false)} unit={unit} setUnit={setUnit}/><main className="main" id="overview">
    <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={()=>setMenuOpen(true)} aria-label="Open menu"><Menu size={21}/></button><span className="breadcrumb-muted">Workspace</span><span className="breadcrumb-slash">/</span><strong>Overview</strong></div><div className="topbar-right"><span className="demo-pill"><span/> Demo mode</span><button className="help-button" title="This dashboard uses sample data; no device is connected." aria-label="About demo mode"><CircleHelp size={19}/></button><div className="top-avatar">A</div></div></header>
    <div className="content"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> YOUR ENVIRONMENT, AT A GLANCE</div><h1>Overview<span>.</span></h1><p>Here's what's happening around your AERO-MIST system.</p></div><div className="heading-actions"><div className="date"><Clock3 size={15}/>{date}</div><button className="refresh-button" onClick={refresh}><RefreshCw size={15} className={refreshing ? 'spinning' : ''}/> Refresh data</button></div></div>
    <div className="demo-banner"><Sparkles size={16}/><span><strong>You're viewing a demo.</strong> These are sample readings, not live device data.</span></div>
    <section className="hero" aria-label="System overview"><div className="hero-copy"><div className="hero-overline"><span className="live-dot"/> YOUR COOLING COMPANION</div><h2>A breath of fresh air<span>.</span></h2><p>A more comfortable space is just a mist away.<br/>Keep an eye on your environment in real time.</p><div className="hero-status"><span className="status-icon"><Radio size={15}/></span><div><strong>System preview</strong><small>Sample device · No device connected</small></div></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-1"/><div className="orbit orbit-2"/><div className="orbit orbit-3"/><div className="art-core"><Wind size={58} strokeWidth={1.1}/></div><span className="art-dot dot-one"/><span className="art-dot dot-two"/><span className="art-dot dot-three"/><div className="art-label"><Droplets size={14}/> MADE FOR COMFORT</div></div><div className="hero-index">01 / ENVIRONMENT</div></section>
    <div className="section-heading"><div><div className="section-kicker">THE LATEST READINGS</div><h2>Current conditions <span className="heading-dot">●</span></h2></div><div className="updated"><span/> Updated {formatTime(updated)} <span className="updated-divider">|</span> <button className="unit-toggle" onClick={()=>setUnit(unit === 'C' ? 'F' : 'C')} aria-label={`Change temperature unit; currently ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}`}>°{unit} <ChevronDown size={13}/></button></div></div>
    <div className="metrics-grid"><MetricCard icon={Thermometer} label="Temperature" value={temperature(readings.temperature)} unit={`°${unit}`} tone="mint" badge={<><ArrowDownRight size={13}/> Ambient</>} foot="Current air temperature"/><MetricCard icon={Droplets} label="Humidity" value={readings.humidity} unit="%" tone="blue" badge="Relative" foot="Moisture in the air"/><MetricCard icon={SunIcon} label="Heat index" value={temperature(readings.heatIndex)} unit={`°${unit}`} tone="peach" badge="Feels like" foot="Temperature + humidity"/><MetricCard icon={BatteryMedium} label="Battery" value={readings.battery} unit="%" tone="lime" badge={<><span className="tiny-dot"/> Good</>} foot="Sample battery level"/></div>
    <div className="dashboard-grid"><section className="panel trend-panel" id="trends"><div className="panel-header"><div><div className="section-kicker">A CLOSER LOOK</div><h2>Temperature trend</h2><p>See how your environment changes over time.</p></div><div className="range-select"><select value={range} onChange={e=>setRange(e.target.value)} aria-label="Temperature trend time range">{ranges.map(r=><option key={r}>{r}</option>)}</select><ChevronDown size={15}/></div></div><div className="chart-meta"><span><i/> Temperature</span><small>Sample data</small></div><TrendChart range={range} unit={unit}/></section>
    <section className="panel comfort-panel"><div className="panel-header"><div><div className="section-kicker">HOW IT FEELS</div><h2>Comfort meter</h2><p>A snapshot of your environment.</p></div><div className="panel-icon"><Gauge size={19}/></div></div><div className="gauge-wrap"><svg viewBox="0 0 220 125" className="gauge" role="img" aria-label="Sample comfort level: comfortable"><path d="M 22 110 A 88 88 0 0 1 198 110" fill="none" stroke="#eef2ef" strokeWidth="15" strokeLinecap="round"/><path d="M 22 110 A 88 88 0 0 1 198 110" fill="none" stroke="#35af8c" strokeWidth="15" strokeLinecap="round" strokeDasharray="193 277"/><circle cx="161" cy="38" r="6" fill="#fff" stroke="#2ba987" strokeWidth="3"/></svg><div className="gauge-center"><span>COMFORT LEVEL</span><strong>Comfortable</strong><small>Looking good <span>✦</span></small></div></div><div className="gauge-scale"><span>LESS COMFORTABLE</span><span>MORE COMFORTABLE</span></div><div className="comfort-note"><span><Check size={14}/></span> Your space is feeling pretty good.</div></section></div>
    <div className="section-heading lower-heading" id="system"><div><div className="section-kicker">KEEPING YOU IN THE LOOP</div><h2>System status <span className="heading-dot">●</span></h2></div><span className="sample-tag">DEMO CYCLE</span></div>
    <div className="system-grid"><article className="system-card"><div className="system-icon mist-icon"><Cloud size={21}/></div><div className="system-copy"><div className="system-title">Misting time remaining <span className="cycle-pill">SAMPLE</span></div><p>{cycle.phase === 'misting' ? 'Time left in the sample misting cycle' : 'Misting resumes after cooldown'}</p></div><div className="timer-value">{formatTimer(cycle.phase === 'misting' ? cycle.seconds : 0)}<small>MIN : SEC</small></div></article><article className="system-card"><div className="system-icon cooldown-icon"><Timer size={21}/></div><div className="system-copy"><div className="system-title">Cooldown time remaining</div><p>{cycle.phase === 'misting' ? 'Starts after the sample misting cycle' : 'Time left in the sample cooldown'}</p></div><div className="timer-value">{formatTimer(cycle.phase === 'cooldown' ? cycle.seconds : 300)}<small>MIN : SEC{cycle.phase === 'misting' ? ' · NEXT' : ''}</small></div></article></div>
    <footer><div><Brand/><span>Made for a more comfortable everyday.</span></div><p>Thoughtfully designed for a breath of fresh air <span>✳</span></p></footer>
    </div></main></div>;
}
function SunIcon({size}) { return <Thermometer size={size}/>; }

createRoot(document.getElementById('root')).render(<App/>);
