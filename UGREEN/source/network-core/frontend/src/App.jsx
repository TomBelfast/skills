import { useState, useEffect } from 'react';
import TopologyMap, { ICONS } from './components/TopologyMap';
import { fetchDevices, fetchLinks, createDevice, createLink } from './api/devices';

const LEGEND = [
  { type: 'server', color: '#27ae60', label: 'Serwer' },
  { type: 'router', color: '#e67e22', label: 'Router' },
  { type: 'nas', color: '#8e44ad', label: 'NAS' },
  { type: 'iot', color: '#1abc9c', label: 'IoT' },
  { type: 'network', color: '#2980b9', label: 'Sieć' },
  { type: 'switch', color: '#34495e', label: 'Switch' },
  { type: 'unknown', color: '#546e7a', label: 'Inne' },
];

export default function App() {
  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshData = () => {
    setLoading(true);
    Promise.all([fetchDevices(), fetchLinks()])
      .then(([devs, lnks]) => {
        setDevices(devs);
        setLinks(lnks);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddSwitch = async () => {
    const label = prompt("Nazwa switcha:", "Switch-Manual");
    if (!label) return;
    try {
      await createDevice({ label, device_type: 'switch', status: 'up' });
      refreshData();
    } catch (err) { alert("Błąd: " + err.message); }
  };

  const handleAddLink = async () => {
    const srcId = prompt("ID urządzenia źródłowego (skopiuj z mapy po najechaniu):");
    const tgtId = prompt("ID urządzenia docelowego:");
    if (!srcId || !tgtId) return;
    try {
      await createLink({ source_id: srcId, target_id: tgtId, link_type: 'ethernet' });
      refreshData();
    } catch (err) { alert("Błąd: " + err.message); }
  };

  const byType = LEGEND.map(l => ({
    ...l,
    count: devices.filter(d => (d.device_type || 'unknown') === l.type).length,
  }));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: '20px 24px',
      background: '#ffffff',
      color: '#37474f',
      boxSizing: 'border-box',
      gap: '16px',
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>

      {/* ── header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#263238' }}>
          Network Topology Architecture
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleAddSwitch} style={{ padding: '8px 16px', background: '#546e7a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            + Dodaj Switch
          </button>
          <button onClick={handleAddLink} style={{ padding: '8px 16px', background: '#03a9f4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            + Połącz
          </button>
          <button onClick={refreshData} style={{ padding: '8px 16px', background: '#fff', color: '#546e7a', border: '1px solid #cfd8dc', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            {loading ? 'Odświeżanie...' : 'Odśwież'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        {/* ── legend ── */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', flexShrink: 0 }}>
          {byType.map(l => (
            <div key={l.type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#546e7a' }}>
              <img
                src={ICONS[l.type] || ICONS.unknown}
                alt={l.label}
                style={{ width: '16px', height: '16px', objectFit: 'contain' }}
              />
              {l.label} <b style={{ color: '#263238' }}>{l.count}</b>
            </div>
          ))}
        </div>
        <span style={{ fontSize: '12px', color: '#90a4ae' }}>
          {devices.length} urządzeń · {links.length} połączeń
        </span>
      </div>

      {error && <p style={{ color: '#e74c3c', margin: 0, fontSize: '13px', flexShrink: 0 }}>Błąd: {error}</p>}

      {/* ── map fills remaining height ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <TopologyMap devices={devices} links={links} />
      </div>
    </div>
  );
}
