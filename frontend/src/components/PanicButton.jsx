import React, { useState } from "react";
import "./PanicButton.css";

export default function PanicButton() {
  const ALERT_API = "/api/alert";          // <-- replace with your server endpoint
  const EMERGENCY_NUM = "112";             // <-- replace with your regional number

  const [status, setStatus] = useState("");
  const [ask, setAsk] = useState(false);   // controls the custom permission modal

  // Primary click handler
  const onPanicClick = () => setAsk(true);

  // When user confirms location sharing
  const confirmShare = () => {
    setAsk(false);

    if (!("geolocation" in navigator)) {
      setStatus("Geolocation unsupported on this device.");
      return;
    }

    setStatus("Getting your GPS position…");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // 1. POST the coordinates to backend / SMS gateway
        fetch(ALERT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lng: longitude })
        }).catch(() =>
          setStatus("⚠️ Location sent failed — please tell operator your position.")
        );

        // 2. Open phone dialer (user still has to hit “Call” for security reasons)
        window.location.href = `tel:${EMERGENCY_NUM}`;

        setStatus("Location sent. Dialler opened — press call if needed.");
      },
      (err) => {
        setStatus(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — call emergency services manually."
            : "Unable to get location — ensure GPS is enabled."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <>
      {/* Main fixed panic button */}
      <button className="panic-btn" onClick={onPanicClick} aria-label="Panic Button">
        🚨 Ambulance
      </button>

      {/* Permission modal */}
      {ask && (
        <div className="panic-overlay" role="dialog" aria-modal="true">
          <div className="panic-modal">
            <h2>Share Your Location?</h2>
            <p>
              We need your GPS location to dispatch emergency responders. It will be
              sent securely to our hotline.
            </p>
            <div className="modal-actions">
              <button onClick={confirmShare}>Yes, share &amp; call</button>
              <button onClick={() => setAsk(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Status feedback */}
      {status && <div className="panic-status">{status}</div>}
    </>
  );
}
