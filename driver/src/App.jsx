import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:3001", {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

// Garde la connexion active
socket.on('connect', () => console.log('Connecté'));
socket.on('disconnect', () => {
  console.log('Déconnecté - reconnexion...');
  socket.connect();
});

const DRIVER_PASSWORD = "cau-driver-2026";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState(false);
  const [busName, setBusName] = useState("Bus Girne");
  const [status, setStatus] = useState("En attente...");
  const [position, setPosition] = useState(null);

  const handleLogin = () => {
    if (password === DRIVER_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("❌ Mot de passe incorrect !");
    }
  };

  const handleStop = () => {
    setTracking(false);
    socket.emit("driver:stop", {
      busId: busName.replace(" ", "-").toLowerCase()
    });
    setStatus("En attente...");
    setPosition(null);
  };

  useEffect(() => {
    let interval;
    let pingInterval;

    if (tracking) {
      const sendPosition = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const data = {
              busId: busName.replace(" ", "-").toLowerCase(),
              busName: busName,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            socket.emit("driver:position", data);
            setPosition(data);
            setStatus("✅ En ligne");
          },
          () => setStatus("❌ GPS non disponible"),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      };

      // Envoie immédiatement au démarrage
      sendPosition();
      interval = setInterval(sendPosition, 2000);

      // Ping toutes les 5s pour garder la connexion active
      pingInterval = setInterval(() => {
        socket.emit("ping");
      }, 3000);

      // Reprend quand l'écran redevient actif
      const handleVisibility = () => {
        if (document.visibilityState === "visible") {
          sendPosition();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);

      return () => {
        clearInterval(interval);
        clearInterval(pingInterval);
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }
    return () => {
      clearInterval(interval);
      clearInterval(pingInterval);
    };
  }, [tracking, busName]);

  // --- PAGE LOGIN ---
  if (!authenticated) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #f97316, #ea580c)",
        fontFamily: "Arial"
      }}>
        <div style={{
          background: "white", padding: "40px",
          borderRadius: "20px", width: "320px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "60px" }}>🚌</div>
          <h2 style={{ color: "#f97316", margin: "10px 0 5px" }}>
            CAU Driver
          </h2>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "25px" }}>
            Application réservée aux chauffeurs
          </p>

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "13px",
              borderRadius: "10px", border: "2px solid #e0e0e0",
              fontSize: "15px", marginBottom: "15px",
              boxSizing: "border-box", outline: "none"
            }}
          />

          {error && (
            <p style={{
              color: "#e53e3e", fontSize: "13px",
              marginBottom: "12px", fontWeight: "bold"
            }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            style={{
              width: "100%", padding: "13px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "white", border: "none",
              borderRadius: "10px", fontSize: "16px",
              cursor: "pointer", fontWeight: "bold"
            }}
          >
            Se connecter 🔐
          </button>
        </div>
      </div>
    );
  }

  // --- APP CHAUFFEUR ---
  return (
    <div style={{
      minHeight: "100vh", fontFamily: "Arial",
      background: "#f0f4f8", display: "flex",
      flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "20px",
        padding: "30px", width: "320px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "50px" }}>🚌</div>
        <h2 style={{ color: "#f97316", margin: "10px 0" }}>CAU Driver</h2>

        {/* Sélection du bus */}
        <select
          value={busName}
          onChange={(e) => setBusName(e.target.value)}
          style={{
            width: "100%", padding: "12px",
            fontSize: "15px", borderRadius: "10px",
            border: "2px solid #e0e0e0", marginBottom: "20px",
            boxSizing: "border-box", cursor: "pointer"
          }}
        >
          <option>Bus Girne</option>
          <option>Bus Lefkoşa</option>
          <option>Bus Campus</option>
          <option>Bus Gönyeli</option>
          <option>Bus Dikmen</option>
        </select>

        {/* Statut */}
        <div style={{
          background: tracking ? "#f0fff4" : "#fff8f0",
          border: `2px solid ${tracking ? "#38a169" : "#f97316"}`,
          borderRadius: "10px", padding: "12px",
          marginBottom: "20px", fontSize: "14px",
          color: tracking ? "#38a169" : "#f97316",
          fontWeight: "bold"
        }}>
          {tracking ? "🟢 " : "🟡 "}{status}
        </div>

        {/* Position */}
        {position && (
          <div style={{
            background: "#f0f4f8", borderRadius: "10px",
            padding: "10px", marginBottom: "20px",
            fontSize: "13px", color: "#555"
          }}>
            📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </div>
        )}

        {/* Bouton tracking */}
        <button
          onClick={tracking ? handleStop : () => setTracking(true)}
          style={{
            width: "100%", padding: "15px",
            fontSize: "17px", fontWeight: "bold",
            background: tracking
              ? "linear-gradient(135deg, #e53e3e, #c53030)"
              : "linear-gradient(135deg, #38a169, #276749)",
            color: "white", border: "none",
            borderRadius: "12px", cursor: "pointer",
            marginBottom: "15px"
          }}
        >
          {tracking ? "⏹ Arrêter le tracking" : "▶ Démarrer le tracking"}
        </button>

        {/* Déconnexion */}
        <button
          onClick={() => {
            handleStop();
            setAuthenticated(false);
            setPassword("");
          }}
          style={{
            width: "100%", padding: "10px",
            background: "transparent", color: "#e53e3e",
            border: "2px solid #e53e3e", borderRadius: "10px",
            cursor: "pointer", fontSize: "14px", fontWeight: "bold"
          }}
        >
          🔓 Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default App;