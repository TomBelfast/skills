import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

// ── SVG icons ─────────────────────────────────────────────────────────────────
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
    <rect x="7" y="8"  width="14" height="4" rx="1" fill="rgba(60,200,80,0.3)"/>
    <rect x="7" y="18" width="10" height="4" rx="1" fill="rgba(60,200,80,0.3)"/>
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
    <line x1="16" y1="4"  x2="16" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="24" y1="4"  x2="24" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="16" y1="28" x2="16" y2="36" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="24" y1="28" x2="24" y2="36" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="4"  y1="16" x2="12" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="4"  y1="24" x2="12" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="28" y1="16" x2="36" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="28" y1="24" x2="36" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>
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
  server:  50,
  router:  64,
  nas:     52,
  iot:     40,
  network: 46,
  unknown: 36,
};

// Concentric rings: higher number = closer to center
const CONCENTRIC_LEVEL = {
  router:  6,
  server:  4,
  nas:     3,
  network: 3,
  iot:     2,
  unknown: 1,
};

// ── Smart labels ──────────────────────────────────────────────────────────────
const KNOWN_IPS = {
  '192.168.0.1':   'Prox-GW',
  '192.168.0.2':   'Pi.hole',
  '192.168.0.3':   'NAS-UGREEN1',
  '192.168.0.4':   'NAS-UGREEN2',
  '192.168.0.10':  'prox10',
  '192.168.0.15':  'PegaProx',
  '192.168.0.18':  'MinIO-S3',
  '192.168.0.50':  'prox50',
  '192.168.0.71':  'MikroTik',
  '192.168.0.100': 'prox100',
  '192.168.0.129': 'TP-Link-AP1',
  '192.168.0.22':  'TP-Link-AP2',
  '192.168.0.30':  'TP-Link-AP3',
  '192.168.0.253': 'TP-Link-AP4',
  '192.168.0.254': 'ASUS-GW',
};

const VENDOR_PREFIX = [
  ['proxmox',     'Prox'],
  ['hewlett',     'Prox'],
  [' hp ',        'Prox'],
  ['ugreen',      'NAS'],
  ['routerboard', 'MikroTik'],
  ['mikrotik',    'MikroTik'],
  ['asustek',     'ASUS'],
  ['asus',        'ASUS'],
  ['tp-link',     'TP-Link'],
  ['espressif',   'ESP'],
  ['tuya',        'Tuya'],
  ['broadlink',   'BLink'],
  ['nvidia',      'Nvidia'],
  ['google',      'Google'],
  ['amazon',      'Amazon'],
  ['sony',        'Sony'],
  ['raspberry',   'RasPi'],
  ['d&m',         'Denon'],
  ['hisense',     'TV'],
  ['micro-star',  'MSI'],
  ['shenzhen',    'IoT'],
  ['hui zhou',    'IoT'],
  ['hangzhou',    'IoT'],
];

function smartLabel(d) {
  if (d.label)                 return d.label;
  if (KNOWN_IPS[d.ip_address]) return KNOWN_IPS[d.ip_address];
  if (d.hostname)              return d.hostname.split('.')[0];

  const last   = d.ip_address.split('.').pop();
  const vendor = (' ' + (d.vendor || '') + ' ').toLowerCase();
  for (const [key, prefix] of VENDOR_PREFIX) {
    if (vendor.includes(key)) return `${prefix}-${last}`;
  }
  return `.${last}`;
}

function nodeStyle(type) {
  return {
    'background-color': TYPE_COLORS[type] || TYPE_COLORS.unknown,
    'background-image': ICONS[type]       || ICONS.unknown,
    'background-fit':   'cover',
    'background-clip':  'none',
    'border-width':     2,
    'border-color':     TYPE_COLORS[type] || TYPE_COLORS.unknown,
    'border-opacity':   0.5,
    width:  TYPE_SIZES[type] || TYPE_SIZES.unknown,
    height: TYPE_SIZES[type] || TYPE_SIZES.unknown,
  };
}

export default function TopologyMap({ devices = [], links = [] }) {
  const containerRef = useRef(null);
  const cyRef        = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !devices.length) return;

    const nodes = devices.map(d => ({
      data: {
        id:     d.id,
        label:  smartLabel(d),
        type:   d.device_type || 'unknown',
        ip:     d.ip_address,
        vendor: d.vendor || '',
        status: d.status || 'unknown',
        level:  CONCENTRIC_LEVEL[d.device_type] || 1,
      },
    }));

    const edges = links.map(l => ({
      data: { id: l.id, source: l.source_id, target: l.target_id },
    }));

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements:  [...nodes, ...edges],
      style: [
        {
          selector: 'node',
          style: {
            ...nodeStyle('unknown'),
            label:                'data(label)',
            color:                '#dde3f0',
            'font-size':          '10px',
            'font-weight':        '500',
            'text-valign':        'bottom',
            'text-margin-y':       6,
            'text-outline-color': '#0a0a14',
            'text-outline-width':  2.5,
            'text-max-width':      '90px',
            'text-wrap':          'ellipsis',
          },
        },
        ...Object.keys(TYPE_COLORS).map(type => ({
          selector: `node[type="${type}"]`,
          style: nodeStyle(type),
        })),
        {
          selector: 'node[status="down"]',
          style: {
            'border-color':       '#e74c3c',
            'border-width':        3,
            'border-opacity':      1,
            'background-blacken':  0.35,
          },
        },
        {
          selector: 'node:selected',
          style: { 'border-color': '#f1c40f', 'border-width': 3, 'border-opacity': 1 },
        },
        {
          selector: 'edge',
          style: {
            'line-color':   '#37474f',
            'line-opacity':  0.45,
            width:           1,
            'curve-style':  'bezier',
          },
        },
        {
          selector: 'edge:selected',
          style: { 'line-color': '#f1c40f', 'line-opacity': 1, width: 2.5 },
        },
      ],
      layout: {
        name:           'concentric',
        animate:        false,
        padding:        50,
        startAngle:     (3 / 2) * Math.PI,  // start at top
        clockwise:      true,
        equidistant:    false,
        minNodeSpacing: 16,
        concentric:     node => node.data('level'),
        levelWidth:     ()   => 1,
      },
    });

    cyRef.current.on('mouseover', 'node', evt => {
      const d = evt.target.data();
      evt.target.style('label', `${d.label}\n${d.ip}${d.vendor ? '\n' + d.vendor : ''}`);
    });
    cyRef.current.on('mouseout', 'node', evt => {
      evt.target.style('label', evt.target.data('label'));
    });

    return () => cyRef.current?.destroy();
  }, [devices, links]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#0d0d1a', borderRadius: '8px' }}
    />
  );
}
