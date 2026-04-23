import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const busIcon = new L.DivIcon({
  html: "🚌",
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const studentIcon = new L.DivIcon({
  html: `<div style="
    background: #f97316;
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 2px #f97316;
  "></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Map({ buses }) {
  const [studentPos, setStudentPos] = useState(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setStudentPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => console.log("GPS non disponible"),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <MapContainer
      center={[35.3264, 33.3182]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
      />

      {/* Position étudiant */}
      {studentPos && (
        <Marker position={[studentPos.lat, studentPos.lng]} icon={studentIcon}>
          <Popup>📍 Vous êtes ici</Popup>
        </Marker>
      )}

      {/* Bus en temps réel */}
      {Object.values(buses).map((bus) => (
        <Marker key={bus.busId} position={[bus.lat, bus.lng]} icon={busIcon}>
          <Popup>
            🚌 {bus.busName} <br />
            {new Date(bus.timestamp).toLocaleTimeString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;