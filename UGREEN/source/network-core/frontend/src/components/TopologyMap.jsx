import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const icon = (svg) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${svg}</svg>`
  )}`;

const ICONS = {
  server: icon(`
    <rect x="3" y="6"  width="34" height="8" rx="2" fill="white" opacity="0.92"/>
    <rect x="3" y="16" width="34" height="8" rx="2" fill="white" opacity="0.76"/>
    <rect x="3" y="26" width="34" height="8" rx="2" fill="white" opacity="0.60"/>
    <circle cx="32" cy="10"  r="2.5" fill="#2ecc71"/>
    <circle cx="32" cy="20"  r="2.5" fill="#f1c40f"/>
    <circle cx="32" cy="30"  r="2.5" fill="#2ecc71"/>
    <rect x="7" y="8"  width="16" height="4" rx="1" fill="rgba(60,200,80,0.3)"/>
    <rect x="7" y="18" width="12" height="4" rx="1" fill="rgba(60,200,80,0.3)"/>
  `),
  router: icon(`
    <rect x="2" y="21" width="36" height="13" rx="3" fill="white" opacity="0.92"/>
    <line x1="10" y1="4"  x2="10" y2="21" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="20" y1="4"  x2="20" y2="21" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="30" y1="4"  x2="30" y2="21" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="12" cy="29" r="3" fill="rgba(230,126,34,0.7)"/>
    <circle cx="20" cy="29" r="3" fill="rgba(230,126,34,0.7)"/>
    <circle cx="28" cy="29" r="3" fill="rgba(230,126,34,0.7)"/>
    <circle cx="36" cy="29" r="2" fill="#2ecc71"/>
  `),
  nas: icon(`
    <rect x="4" y="4"  width="32" height="9" rx="2" fill="white" opacity="0.92"/>
    <rect x="4" y="15" width="32" height="9" rx="2" fill="white" opacity="0.78"/>
    <rect x="4" y="26" width="32" height="9" rx="2" fill="white" opacity="0.64"/>
    <ellipse cx="15" cy="8.5"  rx="4" ry="2.5" fill="rgba(142,68,173,0.45)" stroke="rgba(200,120,230,0.9)" stroke-width="1"/>
    <ellipse cx="15" cy="19.5" rx="4" ry="2.5" fill="rgba(142,68,173,0.45)" stroke="rgba(200,120,230,0.9)" stroke-width="1"/>
    <ellipse cx="15" cy="30.5" rx="4" ry="2.5" fill="rgba(142,68,173,0.45)" stroke="rgba(200,120,230,0.9)" stroke-width="1"/>
    <circle cx="32" cy="8.5"  r="2" fill="#2ecc71"/>
    <circle cx="32" cy="19.5" r="2" fill="#2ecc71"/>
    <circle cx="32" cy="30.5" r="2" fill="#e74c3c"/>
  `),
  iot: icon(`
    <rect x="12" y="12" width="16" height="16" rx="2" fill="white" opacity="0.92"/>
    <line x1="16" y1="4"  x2="16" y2="12" stroke="white" stroke-width="2"   stroke-linecap="round"/>
    <line x1="24" y1="4"  x2="24" y2="12" stroke="white" stroke-width="2"   stroke-linecap="round"/>
    <line x1="16" y1="28" x2="16" y2="36" stroke="white" stroke-width="2"   stroke-linecap="round"/>
    <line x1="24" y1="28" x2="24" y2="36" stroke="white" stroke-width="2"   stroke-linecap="round"/>
    <line x1="4"  y1="16" x2="12" y2="16" stroke="white" stroke-width="2"   stroke-linecap="round"/>
    <line x1="4"  y1="24" x2="12" y2="24" stroke="white" stroke-width="2"   stroke-linecap="round"/>
    <line x1="28" y1="16" x2="36" y2="16" stroke="white" stroke-width="2"   stroke-linecap="round"/>
    <line x1="28" y1="24" x2="36" y2="24" stroke="white" stroke-width="2"   stroke-linecap="round"/>
    <rect x="16" y="16" width="8" height="8" rx="1" fill="rgba(26,188,156,0.65)"/>
  `),
  network: icon(`
    <rect x="3" y="14" width="34" height="15" rx="3" fill="white" opacity="0.92"/>
    <line x1="11" y1="7"  x2="11" y2="14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="20" y1="7"  x2="20" y2="14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="29" y1="7"  x2="29" y2="14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="11" y1="29" x2="11" y2="36" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="20" y1="29" x2="20" y2="36" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="11" cy="22" r="3.5" fill="rgba(52,152,219,0.8)"/>
    <circle cx="20" cy="22" r="3.5" fill="rgba(52,152,219,0.8)"/>
    <circle cx="29" cy="22" r="3.5" fill="rgba(46,204,113,0.9)"/>
  `),
  unknown: icon(`
    <rect x="6" y="10" width="28" height="22" rx="3" fill="white" opacity="0.25"/>
    <rect x="10" y="6"  width="20" height="4"  rx="2" fill="white" opacity="0.5"/>
    <rect x="14" y="32" width="12" height="3"  rx="1" fill="white" opacity="0.4"/>
    <line x1="11" y1="15" x2="29" y2="15" stroke="white" stroke-width="1.5" opacity="0.5"/>
    <line x1="11" y1="20" x2="29" y2="20" stroke="white" stroke-width="1.5" opacity="0.4"/>
    <line x1="11" y1="25" x2="22" y2="25" stroke="white" stroke-width="1.5" opacity="0.3"/>
  `),
};

const TYPE_COLORS = {
  server:  '#27ae60',
  router:  '#e67e22',
  nas:     '#8e44ad',
  iot:     '#1abc9c',
  network: '#2980b9',
  unknown: '#546e7a',
};

const TYPE_SIZES = {
  server:  52,
  router:  60,
  nas:     52,
  iot:     40,
  network: 48,
  unknown: 36,
};

function makeNodeStyle(type) {
  const color = TYPE_COLORS[type] || TYPE_COLORS.unknown;
  const size  = TYPE_SIZES[type]  || TYPE_SIZES.unknown;
  return {
    'background-color':  color,
    'background-image':  ICONS[type] || ICONS.unknown,
    'background-fit':    'cover',
    'background-clip':   'none',
    'border-width':      2,
    'border-color':      color,
    'border-opacity':    0.6,
    width:  size,
    height: size,
  };
}

export default function TopologyMap({ devices, links }) {
  const containerRef = useRef(null);
  const cyRef        = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = devices.map(d => ({
      data: {
        id:      d.id,
        label:   d.label || d.hostname || d.ip_address,
        type:    d.device_type || 'unknown',
        ip:      d.ip_address,
        vendor:  d.vendor || '',
        status:  d.status || 'unknown',
      },
    }));

    const edges = links.map(l => ({
      data: { id: l.id, source: l.source_id, target: l.target_id, type: l.link_type || 'ethernet' },
    }));

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: 'node',
          style: {
            ...makeNodeStyle('unknown'),
            label:          'data(label)',
            color:          '#e8eaf6',
            'font-size':    '10px',
            'font-weight':  '500',
            'text-valign':  'bottom',
            'text-margin-y': 6,
            'text-outline-color':  '#0d0d1a',
            'text-outline-width':  2,
            'text-max-width':      '90px',
            'text-wrap':           'ellipsis',
          },
        },
        ...Object.keys(TYPE_COLORS).map(type => ({
          selector: `node[type="${type}"]`,
          style: makeNodeStyle(type),
        })),
        {
          selector: 'node[status="down"]',
          style: {
            'border-color':   '#e74c3c',
            'border-width':    3,
            'border-opacity':  1,
            'background-blacken': 0.3,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color':   '#f1c40f',
            'border-width':    3,
            'border-opacity':  1,
          },
        },
        {
          selector: 'edge',
          style: {
            'line-color':     '#546e7a',
            'line-opacity':   0.6,
            width:            1.5,
            'curve-style':    'bezier',
          },
        },
        {
          selector: 'edge[type="wifi"]',
          style: { 'line-style': 'dashed', 'line-dash-pattern': [6, 3] },
        },
        {
          selector: 'edge:selected',
          style: { 'line-color': '#f1c40f', 'line-opacity': 1, width: 2.5 },
        },
      ],
      layout: {
        name:            'cose',
        animate:         false,
        nodeRepulsion:   6000,
        idealEdgeLength: 120,
        edgeElasticity:  200,
        gravity:         0.25,
      },
    });

    // Tooltip on hover
    cyRef.current.on('mouseover', 'node', (evt) => {
      const d = evt.target.data();
      evt.target.style('label', `${d.label}\n${d.ip}\n${d.vendor}`);
    });
    cyRef.current.on('mouseout', 'node', (evt) => {
      evt.target.style('label', evt.target.data('label'));
    });

    return () => cyRef.current?.destroy();
  }, [devices, links]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '700px', background: '#0d0d1a', borderRadius: '8px' }} />
  );
}
