import { useState, useEffect } from 'react';
import TopologyMap from './components/TopologyMap';
import { fetchDevices, fetchLinks, createDevice, createLink, deleteDevice } from './api/devices';

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
  const [linkMode, setLinkMode] = useState(false);
  const [linkFirst, setLinkFirst] = useState(null);

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

  useEffect(() => { refreshData(); }, []);

  const handleAddSwitch = async () => {
    const label = prompt("Nazwa switcha:", "Switch-Manual");
    if (!label) return;
    try {
      await createDevice({ label, device_type: 'switch', status: 'up' });
      refreshData();
    } catch (err) { alert("Błąd: " + err.message); }
  };

  const handleNodeTap = async (id) => {
    if (!linkFirst) {
      setLinkFirst(id);
    } else if (linkFirst === id) {
      // klik na to samo urządzenie — odznacz
      setLinkFirst(null);
    } else {
      try {
        await createLink({ source_id: String(linkFirst), target_id: String(id), link_type: 'ethernet' });
        refreshData();
      } catch (err) {
        alert("Błąd połączenia: " + err.message);
      } finally {
        setLinkMode(false);
        setLinkFirst(null);
      }
    }
  };

  const handleLinkButton = () => {
    if (linkMode) {
      setLinkMode(false);
      setLinkFirst(null);
    } else {
      setLinkMode(true);
      setLinkFirst(null);
    }
  };

  const handleDeleteDevice = async (id) => {
    const device = devices.find(d => String(d.id) === String(id));
    const name = device?.label || device?.hostname || id;
    if (!window.confirm(`Usuń urządzenie "${name}"?`)) return;
    try {
      await deleteDevice(id);
      refreshData();
    } catch (err) {
      alert('Błąd usuwania: ' + err.message);
    }
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
          <button onClick={handleLinkButton} style={{ padding: '8px 16px', background: linkMode ? '#e53935' : '#03a9f4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            {linkMode ? '✕ Anuluj' : '+ Połącz'}
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
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: l.color,
                flexShrink: 0,
              }} />
              {l.label} <b style={{ color: '#263238' }}>{l.count}</b>
            </div>
          ))}
        </div>
        <span style={{ fontSize: '12px', color: '#90a4ae' }}>
          {devices.length} urządzeń · {links.length} połączeń
        </span>
      </div>

      {error && <p style={{ color: '#e74c3c', margin: 0, fontSize: '13px', flexShrink: 0 }}>Błąd: {error}</p>}

      {linkMode && (
        <div style={{
          padding: '10px 16px',
          background: linkFirst ? '#e8f5e9' : '#e3f2fd',
          border: `1px solid ${linkFirst ? '#81c784' : '#64b5f6'}`,
          borderRadius: '6px',
          fontSize: '13px',
          color: '#263238',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '18px' }}>{linkFirst ? '✅' : '🔗'}</span>
          {linkFirst
            ? `Wybrano: ${devices.find(d => String(d.id) === String(linkFirst))?.label || linkFirst} — kliknij drugie urządzenie`
            : 'Tryb łączenia: kliknij pierwsze urządzenie na mapie'}
        </div>
      )}

      {/* ── map fills remaining height ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <TopologyMap devices={devices} links={links} onNodeTap={linkMode ? handleNodeTap : null} onNodeDelete={handleDeleteDevice} />
      </div>
    </div>
  );
}
