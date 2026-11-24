import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Radio, Sparkles } from 'lucide-react';

export default function SystemProfileSelector({ profile, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  const choose = value => { onChange(value); setOpen(false); trigger.current?.focus(); };
  return <div className="profile-selector" ref={root}>
    <button type="button" ref={trigger} className="profile-trigger" onClick={() => setOpen(value => !value)} aria-label={`System profile: ${profile === 'device' ? 'AERO-MIST device' : 'Sample data'}`} aria-expanded={open} aria-controls="profile-options"><span className={`profile-status ${profile === 'device' ? 'offline' : ''}`}/><span>{profile === 'device' ? 'AERO-MIST' : 'Sample data'}</span><ChevronDown size={14}/></button>
    {open && <div id="profile-options" className="profile-menu" role="group" aria-label="Choose system profile"><div className="profile-menu-title">SYSTEM PROFILE</div><p>Choose which system to view.</p>
      <button type="button" className="profile-option" onClick={() => choose('device')} aria-pressed={profile === 'device'}><span className="profile-option-icon"><Radio size={16}/></span><span className="profile-option-text"><strong>AERO-MIST device</strong><small>Actual system · not connected</small></span>{profile === 'device' && <Check size={16}/>}</button>
      <button type="button" className="profile-option" onClick={() => choose('sample')} aria-pressed={profile === 'sample'}><span className="profile-option-icon"><Sparkles size={16}/></span><span className="profile-option-text"><strong>Sample data</strong><small>Illustrative readings and timers</small></span>{profile === 'sample' && <Check size={16}/>}</button>
    </div>}
  </div>;
}
