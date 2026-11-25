import React, { useRef } from 'react';
import { CircleHelp, X } from 'lucide-react';

export default function ContextHelp({ tab, profile }) {
  const dialog = useRef(null);
  const trigger = useRef(null);
  const title = tab === 'environment' ? 'About outdoor weather' : tab === 'history' ? 'About system history' : 'About system data';
  return <>
    <button type="button" ref={trigger} className="help-button" onClick={() => dialog.current?.showModal()} aria-label={title} aria-haspopup="dialog" aria-controls="context-help-dialog" title={title}><CircleHelp size={19}/></button>
    <dialog ref={dialog} id="context-help-dialog" className="download-dialog context-help-dialog" aria-labelledby="context-help-title" onClose={() => trigger.current?.focus()} onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="download-dialog-top"><span className="download-eyebrow">AERO-MIST HELP</span><button type="button" className="download-close" aria-label="Close help" onClick={() => dialog.current.close()}><X size={19}/></button></div>
      <h2 id="context-help-title">{title}</h2>
      {tab === 'environment' ? <>
        <p>Outdoor weather is a regional model estimate and may differ from conditions at the AERO-MIST device. Apparent temperature is not the heat index.</p>
        <p>If you enable your current location, your coordinates are sent to the weather provider to request local weather.</p>
        <p>Weather data: <a href="https://open-meteo.com/">Open-Meteo</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p>
      </> : tab === 'history' ? <p>{profile === 'sample' ? 'Sample snapshots expire after one hour and are illustrative. Actual device history is separate.' : 'System history requires a connected device and storage, which are not yet implemented.'}</p> : <p>{profile === 'device' ? 'The AERO-MIST device is not connected, so actual readings and timers are unavailable.' : 'The device readings and timers shown are sample data. No AERO-MIST device is connected.'}</p>}
    </dialog>
  </>;
}
