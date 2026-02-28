import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { patchDevice } from '../api/devices';

// ── SVG node icons ────────────────────────────────────────────────────────────
const icon = (svg) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#eceff1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#90a4ae;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="gradServer" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#546e7a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#263238;stop-opacity:1" />
        </linearGradient>
      </defs>
      ${svg}
    </svg>`
  )}`;

export const ICONS = {
  server: icon(`
    <g transform="translate(14, 4) scale(1.35)">
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" fill="#ffffff" stroke="#1685fc" stroke-width="2"/>
      <path d="M4 12h16" stroke="#1685fc" stroke-width="2"/>
      <path d="M8 9h.01M12 9h.01M8 15h.01M12 15h.01" stroke="#1685fc" stroke-width="2" stroke-linecap="round"/>
    </g>
  `),
  router: icon(`
    <g transform="translate(14, 14) scale(1.35)">
      <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="#1685fc" stroke-width="2"/>
      <path d="M12 2a10 10 0 0 1 10 10M12 22a10 10 0 0 1-10-10" fill="none" stroke="#1685fc" stroke-width="2"/>
      <path d="M12 8v8M8 12h8" fill="none" stroke="#1685fc" stroke-width="2"/>
    </g>
  `),
  nas: icon(`
    <g transform="translate(14, 14) scale(1.35)">
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" fill="#ffffff" stroke="#1685fc" stroke-width="2"/>
      <path d="M4 10h16M4 14h16" stroke="#1685fc" stroke-width="2"/>
      <path d="M8 10v4M12 10v4" stroke="#1685fc" stroke-width="2"/>
    </g>
  `),
  iot: icon(`
    <g transform="translate(14, 14) scale(1.35)">
      <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10A10 10 0 0 1 12 2z" fill="#ffffff" stroke="#1685fc" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="#1685fc"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#1685fc" stroke-width="2"/>
    </g>
  `),
  network: icon(`
    <g transform="translate(14, 14) scale(1.35)">
      <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.485-2.015-4.5-4.5-4.5-1.554 0-2.923.782-3.71 1.986A4.471 4.471 0 0 0 12 10.5c-2.485 0-4.5 2.015-4.5 4.5 0 .285.026.563.076.83A4.498 4.498 0 0 0 4.5 20c2.485 0 4.5-2.015 4.5-4.5C9 14.28 8.164 13.245 7 12.83" fill="none" stroke="#1685fc" stroke-width="2"/>
    </g>
  `),
  switch: icon(`
    <g transform="translate(14, 14) scale(1.35)">
      <rect x="2" y="6" width="20" height="12" rx="2" fill="#ffffff" stroke="#1685fc" stroke-width="2"/>
      <path d="M6 10h2M10 10h2M14 10h2M18 10h2M6 14h2M10 14h2M14 14h2M18 14h2" stroke="#1685fc" stroke-width="2" stroke-linecap="round"/>
    </g>
  `),
  unknown: icon(`
    <g transform="translate(14, 14) scale(1.35)">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#ffffff" stroke="#1685fc" stroke-width="2"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" fill="none" stroke="#1685fc" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 17h.01" stroke="#1685fc" stroke-width="2" stroke-linecap="round"/>
    </g>
  `),
};

const TYPE_COLORS = {
  server: '#27ae60',
  router: '#e67e22',
  nas: '#8e44ad',
  iot: '#1abc9c',
  network: '#2980b9',
  switch: '#34495e',
  unknown: '#546e7a',
};

const TYPE_SIZES = {
  server: 50,
  router: 62,
  nas: 52,
  iot: 40,
  network: 46,
  switch: 48,
  unknown: 36,
};

const KNOWN_IPS = {
  '192.168.0.1': 'Prox-GW',
  '192.168.0.2': 'Pi.hole',
  '192.168.0.3': 'NAS-UGREEN1',
  '192.168.0.4': 'NAS-UGREEN2',
  '192.168.0.10': 'prox10',
  '192.168.0.15': 'PegaProx',
  '192.168.0.18': 'MinIO-S3',
  '192.168.0.50': 'prox50',
  '192.168.0.71': 'MikroTik',
  '192.168.0.100': 'prox100',
  '192.168.0.129': 'TP-Link-1',
  '192.168.0.22': 'TP-Link-2',
  '192.168.0.30': 'TP-Link-3',
  '192.168.0.253': 'TP-Link-4',
  '192.168.0.254': 'ASUS-Router',
};

const VENDOR_PREFIX = [
  ['proxmox', 'Prox'],
  ['hewlett', 'Prox'],
  [' hp ', 'Prox'],
  ['ugreen', 'NAS'],
  ['routerboard', 'MikroTik'],
  ['mikrotik', 'MikroTik'],
  ['asustek', 'ASUS'],
  ['asus', 'ASUS'],
  ['tp-link', 'TP-Link'],
  ['espressif', 'ESP'],
  ['tuya', 'Tuya'],
  ['broadlink', 'BLink'],
  ['nvidia', 'Nvidia'],
  ['google', 'Google'],
  ['amazon', 'Amazon'],
  ['sony', 'Sony'],
  ['raspberry', 'RasPi'],
  ['d&m holdings', 'Denon'],
  ['hisense', 'Hisense'],
  ['micro-star', 'MSI'],
  ['shenzhen', 'IoT'],
  ['hui zhou', 'IoT'],
  ['hangzhou', 'IoT'],
];

function smartLabel(d) {
  if (d.label) return d.label;
  if (KNOWN_IPS[d.ip_address]) return KNOWN_IPS[d.ip_address];
  if (d.hostname) return d.hostname.split('.')[0];

  const last = d.ip_address.split('.').pop();
  const vendor = (' ' + (d.vendor || '') + ' ').toLowerCase();
  for (const [key, prefix] of VENDOR_PREFIX) {
    if (vendor.includes(key)) return `${prefix}-${last}`;
  }
  return `.${last}`;
}

const GROUP_LABELS = {
  server: 'SERWERY',
  router: 'ROUTERY',
  nas: 'NAS',
  iot: 'IoT',
  network: 'SIEĆ / MEDIA',
  switch: 'PRZEŁĄCZNIKI',
  unknown: 'INNE',
};

const STORAGE_KEY = 'network-topology-positions';

function savePositionsLocal(cy) {
  const positions = {};
  cy.nodes(':childless').forEach(n => {
    positions[n.id()] = n.position();
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

function loadPositionsLocal() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
}

function makeNodeStyle(type) {
  const size = TYPE_SIZES[type] || 40;
  return {
    'background-opacity': 0,
    'background-image': ICONS[type] || ICONS.unknown,
    'background-fit': 'contain',
    'background-clip': 'node',
    'shape': 'rectangle',
    'border-width': 0,
    width: size,
    height: size,
  };
}

function applyFixedSizes(cy) {
  const z = cy.zoom();
  cy.batch(() => {
    cy.nodes(':childless').forEach(node => {
      const base = TYPE_SIZES[node.data('type')] || 40;
      node.style({ width: base / z, height: base / z });
    });
  });
}

export default function TopologyMap({ devices = [], links = [] }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !devices.length) return;

    const localPositions = loadPositionsLocal();

    const nodes = devices.map(d => {
      // DB positions take priority, localStorage as fallback
      const pos = (d.x_pos != null && d.y_pos != null)
        ? { x: d.x_pos, y: d.y_pos }
        : localPositions[d.id] || undefined;
      return {
        data: {
          id: d.id,
          label: smartLabel(d),
          type: d.device_type || 'unknown',
          ip: d.ip_address,
          vendor: d.vendor || '',
          status: d.status || 'unknown',
        },
        position: pos,
      };
    });

    const edges = links.map(l => ({
      data: { id: l.id, source: l.source_id, target: l.target_id, type: l.link_type || 'ethernet' },
    }));

    const hasSavedPositions = devices.some(d => d.x_pos != null) || Object.keys(localPositions).length > 0;

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: 'node:childless',
          style: {
            ...makeNodeStyle('unknown'),
            label: 'data(label)',
            color: '#263238',
            'font-size': 11,
            'font-weight': '600',
            'text-valign': 'bottom',
            'text-margin-y': 10,
            'text-background-color': '#fff',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'text-max-width': '100px',
            'text-wrap': 'wrap',
          },
        },
        ...Object.keys(TYPE_COLORS).map(type => ({
          selector: `node[type="${type}"]:childless`,
          style: makeNodeStyle(type),
        })),
        {
          selector: 'node[status="down"]',
          style: {
            'border-color': '#e74c3c',
            'border-width': 3,
            'border-opacity': 1,
            'opacity': 0.55,
          },
        },
        {
          selector: 'node:childless:selected',
          style: { 'border-color': '#f1c40f', 'border-width': 3, 'border-opacity': 1 },
        },
        {
          selector: 'edge',
          style: {
            'line-color': '#263238',
            'line-opacity': 1,
            width: 1.5,
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#263238',
            'arrow-scale': 1.2,
          },
        },
        {
          selector: 'edge:selected',
          style: { 'line-color': '#f1c40f', 'line-opacity': 1, width: 2.5 },
        },
      ],
      layout: hasSavedPositions ? { name: 'preset' } : {
        name: 'breadthfirst',
        directed: true,
        padding: 50,
        spacingFactor: 1.5,
      },
    });

    // Save dragged node position to DB + localStorage cache
    cyRef.current.on('dragfree', 'node:childless', evt => {
      const node = evt.target;
      const { x, y } = node.position();
      patchDevice(node.id(), { x_pos: x, y_pos: y }).catch(() => { });
      savePositionsLocal(cyRef.current);
    });
    // Fixed icon sizes — compensate for zoom level
    cyRef.current.on('layoutstop', () => {
      applyFixedSizes(cyRef.current);
      savePositionsLocal(cyRef.current);
    });
    cyRef.current.on('zoom', () => applyFixedSizes(cyRef.current));

    cyRef.current.on('mouseover', 'node:childless', evt => {
      const d = evt.target.data();
      evt.target.style('label', `${d.label}\n${d.ip}${d.vendor ? '\n' + d.vendor : ''}`);
    });
    cyRef.current.on('mouseout', 'node:childless', evt => {
      evt.target.style('label', evt.target.data('label'));
    });

    return () => cyRef.current?.destroy();
  }, [devices, links]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#f5f7fa', borderRadius: '8px' }}
    />
  );
}
