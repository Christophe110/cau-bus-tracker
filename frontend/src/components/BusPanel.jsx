function BusPanel({ buses }) {
  const busList = Object.values(buses);

  const getTimeDiff = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return `${diff}s`;
    return `${Math.floor(diff / 60)}min`;
  };

  return (
    <div style={{
      position: "absolute", zIndex: 1000,
      top: 62, right: 10,
      background: "white",
      borderRadius: "12px",
      padding: "10px",
      width: "160px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
      fontFamily: "Arial",
      border: "1px solid #e8f0fe"
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: "6px", marginBottom: "8px",
        paddingBottom: "8px",
        borderBottom: "1px solid #f0f0f0"
      }}>
        <span style={{ fontSize: "14px" }}>🚌</span>
        <span style={{
          fontSize: "12px", fontWeight: "bold",
          color: "#1a73e8"
        }}>
          Bus en service
        </span>
      </div>

      {/* Liste des bus */}
      {busList.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "10px 0",
          color: "#999", fontSize: "11px"
        }}>
          <div style={{ fontSize: "20px", marginBottom: "4px" }}>🔍</div>
          Aucun bus actif
        </div>
      ) : (
        busList.map((bus) => (
          <div key={bus.busId} style={{
            background: "#f8fbff",
            borderRadius: "8px",
            padding: "7px 8px",
            marginBottom: "5px",
            borderLeft: "3px solid #1a73e8",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}>
            <div style={{
              fontWeight: "bold", fontSize: "12px",
              color: "#222"
            }}>
              {bus.busName}
            </div>
            <div style={{
              display: "flex", alignItems: "center",
              gap: "4px"
            }}>
              <div style={{
                width: "6px", height: "6px",
                borderRadius: "50%", background: "#38a169"
              }} />
              <span style={{ color: "#38a169", fontSize: "11px" }}>
                En route
              </span>
            </div>
            <div style={{ color: "#aaa", fontSize: "10px" }}>
              🕐 {getTimeDiff(bus.timestamp)}
            </div>
          </div>
        ))
      )}

      {/* Footer */}
      <div style={{
        marginTop: "6px",
        padding: "5px",
        background: "#f0f7ff",
        borderRadius: "6px",
        fontSize: "10px",
        color: "#1a73e8",
        textAlign: "center"
      }}>
        ⚡ Temps réel · 2s
      </div>
    </div>
  );
}

export default BusPanel;