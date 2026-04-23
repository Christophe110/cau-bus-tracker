import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function DriverApp() {
  const [tracking, setTracking] = useState(false);
  const [busName, setBusName] = useState("Bus Girne");
  const [status, setStatus] = useState("En attente...");

  useEffect(() => {
    let interval;
    if (tracking) {
      interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
          const data = {
            busId: "bus-1",
            busName: busName,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          socket.emit("driver:position", data);
          setStatus(`✅ Position envoyée : ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`);
        });
      }, 5000); // Envoie toutes les 5 secondes
    }
    return () => clearInterval(interval);
  }, [tracking, busName]);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100vh", fontFamily: "Arial",
      background: "#f0f4f8"
    }}>
      <h1>🚌 App Chauffeur CAU</h1>

      <select
        value={busName}
        onChange={(e) => setBusName(e.target.value)}
        style={{ padding: "10px", fontSize: "16px", marginBottom: "20px", borderRadius: "8px" }}
      >
        <option>Bus Girne</option>
        <option>Bus Lefkoşa</option>
        <option>Bus Campus</option>
      </select>

      <button
        onClick={() => setTracking(!tracking)}
        style={{
          padding: "15px 40px", fontSize: "18px",
          background: tracking ? "#e53e3e" : "#38a169",
          color: "white", border: "none",
          borderRadius: "12px", cursor: "pointer"
        }}
      >
        {tracking ? "⏹ Arrêter" : "▶ Démarrer le tracking"}
      </button>

      <p style={{ marginTop: "20px", color: "#555" }}>{status}</p>
    </div>
  );
}

export default DriverApp;