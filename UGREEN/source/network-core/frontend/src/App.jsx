import { useState, useEffect } from 'react';
import TopologyMap from './components/TopologyMap';
import { fetchDevices, fetchLinks } from './api/devices';

const LEGEND = [
  { type: 'server',  color: '#27ae60', label: 'Serwer' },
  { type: 'router',  color: '#e67e22', label: 'Router' },
  { type: 'nas',     color: '#8e44ad', label: 'NAS'    },
  { type: 'iot',     color: '#1abc9c', label: 'IoT'    },
  { type: 'network', color: '#2980b9', label: 'Sieć'   },
  { type: 'unknown', color: '#546e7a', label: 'Inne'   },
];

export default function App() {
  const [devices, setDevices] = useState([]);
  const [links,   setLinks]   = useState([]);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    Promise.all([fetchDevices(), fetchLinks()])
      .then(([devs, lnks]) => { setDevices(devs); setLinks(lnks); })
      .catch(err => setError(err.message));
  }, []);

  const byType = LEGEND.map(l => ({
    ...l,
    count: devices.filter(d => (d.device_type || 'unknown') === l.type).length,
  }));

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      height:         '100vh',
      padding:        '12px 16px',
      background:     '#0d0d1a',
      color:          '#eee',
      boxSizing:      'border-box',
      gap:            '8px',
      fontFamily:     'system-ui, sans-serif',
    }}>

      {/* ── header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600', letterSpacing: '0.5px' }}>
          Network Topology
        </h1>
        <span style={{ fontSize: '12px', color: '#607d8b' }}>
          {devices.length} urządzeń · {links.length} połączeń
        </span>
      </div>

      {/* ── legend ── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
        {byType.map(l => (
          <div key={l.type} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#b0bec5' }}>
            <span style={{
              display:         'inline-block',
              width:           '10px',
              height:          '10px',
              borderRadius:    '50%',
              background:      l.color,
              flexShrink:      0,
            }}/>
            {l.label} <span style={{ color: l.color, fontWeight: 600 }}>({l.count})</span>
          </div>
        ))}
      </div>

      {error && <p style={{ color: '#e74c3c', margin: 0, fontSize: '13px', flexShrink: 0 }}>Błąd: {error}</p>}

      {/* ── map fills remaining height ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <TopologyMap devices={devices} links={links} />
      </div>
    </div>
  );
}
