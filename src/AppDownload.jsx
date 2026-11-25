import React, { useRef } from 'react';
import { Download, Smartphone, Wifi, X } from 'lucide-react';
import logoUrl from './assets/aero-mist-logo.svg';

const APK_URL = 'https://github.com/domodesu/AERO-MIST/releases/download/android-test/AERO-MIST-test.apk';

export default function AppDownload() {
  const dialog = useRef(null);
  const trigger = useRef(null);

  return <>
    <button type="button" ref={trigger} className="download-app" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog" aria-controls="app-download-dialog" aria-label="Open Android app download area" title="Get the Android app"><Download size={17}/><span>Get app</span></button>
    <dialog ref={dialog} id="app-download-dialog" className="download-dialog" aria-labelledby="download-title" aria-describedby="download-description" onClose={() => trigger.current?.focus()} onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="download-dialog-top"><span className="download-eyebrow">AERO-MIST FOR ANDROID</span><button type="button" className="download-close" aria-label="Close download area" onClick={() => dialog.current.close()}><X size={19}/></button></div>
      <div className="download-heading"><img src={logoUrl} alt=""/><div><h2 id="download-title">Take AERO-MIST with you<span>.</span></h2><p id="download-description">Get the Android test app and view your dashboard on your phone.</p></div></div>
      <div className="download-details"><div><Smartphone size={17}/><span><strong>Android test APK</strong><small>Not available on the Play Store yet</small></span></div><div><Wifi size={17}/><span><strong>Internet connection required</strong><small>Dashboard updates appear automatically</small></span></div></div>
      <a className="download-primary" href={APK_URL}><Download size={17}/> Download Android APK</a>
      <p className="download-note">After downloading, open the APK to install it. Your phone may ask you to allow installs from your browser. Android feature updates may require a new APK.</p>
    </dialog>
  </>;
}
