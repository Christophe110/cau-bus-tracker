import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Map from "./components/Map";
import BusPanel from "./components/BusPanel";
import Notifications from "./components/Notifications";

const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:3001");

function App() {
  const [buses, setBuses] = useState({});

  useEffect(() => {
    socket.on("buses:update", (data) => setBuses(data));
    fetch(`${import.meta.env.VITE_SERVER_URL || "http://localhost:3001"}/api/buses`)
      .then((res) => res.json())
      .then((data) => setBuses(data));
    return () => socket.off("buses:update");
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", fontFamily: "Arial", position: "relative" }}>

      {/* Barre de titre */}
      <div style={{
        position: "absolute", zIndex: 1000,
        top: 0, left: 0, right: 0,
        height: "52px",
        background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
      }}>
        <span style={{ fontSize: "24px" }}>🚌</span>
        <div>
          <div style={{ color: "white", fontWeight: "bold", fontSize: "15px", lineHeight: 1.2 }}>
            CAU Bus Tracker
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
            Cyprus Aydin University
          </div>
        </div>

        {/* Indicateur en ligne */}
        <div style={{
          marginLeft: "auto",
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(255,255,255,0.15)",
          padding: "4px 10px", borderRadius: "20px"
        }}>
          <div style={{
            width: "8px", height: "8px",
            borderRadius: "50%", background: "#4ade80"
          }} />
          <span style={{ color: "white", fontSize: "12px" }}>
            {Object.keys(buses).length} bus actif{Object.keys(buses).length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Carte — décalée sous la barre */}
      <div style={{ paddingTop: "52px", height: "100%" }}>
        <Map buses={buses} />
      </div>

      <BusPanel buses={buses} />
      <Notifications buses={buses} />
    </div>
  );
}

export default App;