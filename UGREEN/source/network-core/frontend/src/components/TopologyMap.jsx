import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

export default function TopologyMap({ devices, links }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = devices.map(d => ({
      data: {
        id: d.id,
        label: d.label || d.hostname || d.ip_address,
        type: d.device_type || 'unknown',
      },
    }));

    const edges = links.map(l => ({
      data: {
        id: l.id,
        source: l.source_id,
        target: l.target_id,
      },
    }));

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': '#4f90d4',
            color: '#fff',
            'text-valign': 'bottom',
            'font-size': '11px',
          },
        },
        {
          selector: 'node[type="router"]',
          style: { 'background-color': '#e67e22' },
        },
        {
          selector: 'node[type="server"]',
          style: { 'background-color': '#27ae60' },
        },
        {
          selector: 'node[type="nas"]',
          style: { 'background-color': '#8e44ad' },
        },
        {
          selector: 'edge',
          style: {
            'line-color': '#aaa',
            width: 2,
            'curve-style': 'bezier',
          },
        },
      ],
      layout: { name: 'cose', animate: false },
    });

    return () => cyRef.current?.destroy();
  }, [devices, links]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px', background: '#1a1a2e' }} />;
}
