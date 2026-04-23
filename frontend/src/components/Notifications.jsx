import { useEffect, useState, useRef } from "react";

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const stops = [
  { name: "Campus CAU", lat: 35.3264, lng: 33.3182 },
  { name: "Girne Centre", lat: 35.3411, lng: 33.3194 },
  { name: "Lefkoşa", lat: 35.1856, lng: 33.3823 },
];

function Notifications({ buses }) {
  const [alerts, setAlerts] = useState([]);
  const shownAlerts = useRef(new Set());

  useEffect(() => {
    const newAlerts = [];

    Object.values(buses).forEach((bus) => {
      stops.forEach((stop) => {
        const dist = getDistance(bus.lat, bus.lng, stop.lat, stop.lng);

        const arriveKey = `${bus.busId}-${stop.name}-arrive`;
        const procheKey = `${bus.busId}-${stop.name}-proche`;

        if (dist < 500 && !shownAlerts.current.has(arriveKey)) {
          shownAlerts.current.add(arriveKey);
          shownAlerts.current.delete(procheKey);
          newAlerts.push({
            id: arriveKey,
            message: `${bus.busName} arrive à ${stop.name} !`,
            type: "arrive"
          });
        } else if (dist < 1500 && dist >= 500 && !shownAlerts.current.has(procheKey)) {
          shownAlerts.current.add(procheKey);
          newAlerts.push({
            id: procheKey,
            message: `${bus.busName} approche de ${stop.name}`,
            type: "proche"
          });
        }

        if (dist > 2000) {
          shownAlerts.current.delete(arriveKey);
          shownAlerts.current.delete(procheKey);
        }
      });
    });

    if (newAlerts.length > 0) {
      setAlerts(newAlerts);
      setTimeout(() => setAlerts([]), 5000);
    }
  }, [buses]);

  if (alerts.length === 0) return null;

  return (
    <div style={{
      position: "absolute", zIndex: 1000,
      bottom: 25, left: "50%",
      transform: "translateX(-50%)",
      display: "flex", flexDirection: "column",
      gap: "8px", alignItems: "center"
    }}>
      {alerts.map((alert) => (
        <div key={alert.id} style={{
          background: alert.type === "arrive"
            ? "linear-gradient(135deg, #38a169, #276749)"
            : "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "white",
          padding: "10px 22px",
          borderRadius: "25px",
          fontWeight: "bold",
          fontSize: "13px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{ fontSize: "18px" }}>
            {alert.type === "arrive" ? "🚌" : "⏱"}
          </span>
          {alert.message}
        </div>
      ))}
    </div>
  );
}

export default Notifications;