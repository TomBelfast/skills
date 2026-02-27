import { useState, useEffect } from 'react';
import TopologyMap from './components/TopologyMap';
import { fetchDevices, fetchLinks } from './api/devices';

export default function App() {
  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchDevices(), fetchLinks()])
      .then(([devs, lnks]) => {
        setDevices(devs);
        setLinks(lnks);
      })
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem', background: '#0d0d1a', minHeight: '100vh', color: '#eee' }}>
      <h1 style={{ margin: '0 0 1rem' }}>Network Topology</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>
        Devices: {devices.length} | Links: {links.length}
      </p>
      <TopologyMap devices={devices} links={links} />
    </div>
  );
}
