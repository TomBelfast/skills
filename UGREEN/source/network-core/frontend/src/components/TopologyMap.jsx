import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { patchDevice } from '../api/devices';

// ── SVG node icons ────────────────────────────────────────────────────────────
const svgUri = (svgContent) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

const ICONS = {
  asus: '/assets/devices/asus-router.png',
  asus5: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="a5_bd" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#111"/>
        <stop offset="100%" stop-color="#2a2a2a"/>
      </linearGradient>
      <linearGradient id="a5_top" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#c0392b"/>
        <stop offset="100%" stop-color="#e74c3c"/>
      </linearGradient>
    </defs>
    <!-- Antennas -->
    <path d="M 28 65 L 12 18" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round"/>
    <path d="M 28 65 L 12 18" stroke="#444" stroke-width="2" stroke-linecap="round"/>
    <path d="M 46 65 L 34 12" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round"/>
    <path d="M 46 65 L 34 12" stroke="#444" stroke-width="2" stroke-linecap="round"/>
    <path d="M 64 65 L 64 8" stroke="#1a1a1a" stroke-width="8" stroke-linecap="round"/>
    <path d="M 64 65 L 64 8" stroke="#e74c3c" stroke-width="2" stroke-linecap="round"/>
    <path d="M 82 65 L 94 12" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round"/>
    <path d="M 82 65 L 94 12" stroke="#444" stroke-width="2" stroke-linecap="round"/>
    <path d="M 100 65 L 116 18" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round"/>
    <path d="M 100 65 L 116 18" stroke="#444" stroke-width="2" stroke-linecap="round"/>
    <!-- Router Body -->
    <polygon points="15,80 35,55 93,55 113,80 100,105 28,105" fill="url(#a5_bd)" stroke="#444" stroke-width="1.5"/>
    <polygon points="35,55 93,55 88,62 40,62" fill="url(#a5_top)"/>
    <!-- Center Logo -->
    <polygon points="64,70 54,90 74,90" fill="#e74c3c"/>
    <!-- LEDs -->
    <circle cx="50" cy="100" r="1.5" fill="#f1c40f"/>
    <circle cx="58" cy="100" r="1.5" fill="#00e676"/>
    <circle cx="66" cy="100" r="1.5" fill="#00e676"/>
    <circle cx="74" cy="100" r="1.5" fill="#00e676"/>
    <circle cx="82" cy="100" r="1.5" fill="#00e676"/>
  </svg>`),
  router: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="14" y="54" width="100" height="24" rx="4" fill="#2c3e50" stroke="#34495e" stroke-width="2"/>
    <rect x="20" y="62" width="6" height="2" rx="1" fill="#00c853"/>
    <rect x="30" y="62" width="6" height="2" rx="1" fill="#00c853"/>
    <rect x="40" y="62" width="6" height="2" rx="1" fill="#ff9800"/>
    <rect x="94" y="58" width="12" height="16" rx="2" fill="#1a1a1a"/>
    <path d="M44 54 L44 34 M84 54 L84 34" stroke="#2c3e50" stroke-width="4" stroke-linecap="round"/>
    <circle cx="44" cy="32" r="3" fill="#2c3e50"/>
    <circle cx="84" cy="32" r="3" fill="#2c3e50"/>
  </svg>`),

  server: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="srv_ch" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#5a5a5a"/>
        <stop offset="100%" stop-color="#1e1e1e"/>
      </linearGradient>
      <linearGradient id="srv_sh" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.14)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <rect x="4" y="22" width="12" height="84" rx="2" fill="#252525" stroke="#3a3a3a" stroke-width="1"/>
    <rect x="112" y="22" width="12" height="84" rx="2" fill="#252525" stroke="#3a3a3a" stroke-width="1"/>
    <rect x="5" y="30" width="8" height="4" rx="1" fill="#111"/>
    <rect x="5" y="44" width="8" height="4" rx="1" fill="#111"/>
    <rect x="5" y="58" width="8" height="4" rx="1" fill="#111"/>
    <rect x="115" y="30" width="8" height="4" rx="1" fill="#111"/>
    <rect x="115" y="44" width="8" height="4" rx="1" fill="#111"/>
    <rect x="115" y="58" width="8" height="4" rx="1" fill="#111"/>
    <rect x="16" y="26" width="96" height="76" rx="3" fill="url(#srv_ch)"/>
    <rect x="16" y="26" width="96" height="20" rx="3" fill="url(#srv_sh)"/>
    <rect x="20" y="30" width="88" height="68" rx="2" fill="#2a2a2a"/>
    <rect x="24" y="36" width="18" height="13" rx="2" fill="#1a1a1a" stroke="#3c3c3c" stroke-width="0.8"/>
    <rect x="44" y="36" width="18" height="13" rx="2" fill="#1a1a1a" stroke="#3c3c3c" stroke-width="0.8"/>
    <rect x="64" y="36" width="18" height="13" rx="2" fill="#1a1a1a" stroke="#3c3c3c" stroke-width="0.8"/>
    <rect x="84" y="36" width="18" height="13" rx="2" fill="#1a1a1a" stroke="#3c3c3c" stroke-width="0.8"/>
    <rect x="27" y="39" width="10" height="2" rx="1" fill="#555"/>
    <rect x="47" y="39" width="10" height="2" rx="1" fill="#555"/>
    <rect x="67" y="39" width="10" height="2" rx="1" fill="#555"/>
    <rect x="87" y="39" width="10" height="2" rx="1" fill="#555"/>
    <circle cx="27" cy="45" r="1.5" fill="#00c853"/>
    <circle cx="47" cy="45" r="1.5" fill="#00c853"/>
    <circle cx="67" cy="45" r="1.5" fill="#ff9800"/>
    <circle cx="87" cy="45" r="1.5" fill="#00c853"/>
    <rect x="24" y="56" width="68" height="14" rx="2" fill="#1e1e1e" stroke="#333" stroke-width="0.8"/>
    <rect x="28" y="60" width="7" height="6" rx="0.5" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="38" y="60" width="7" height="6" rx="0.5" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="50" y="59" width="11" height="8" rx="1" fill="#1a1a1a" stroke="#555" stroke-width="0.5"/>
    <rect x="51" y="62" width="9" height="4" rx="0.5" fill="#333"/>
    <circle cx="60" cy="60" r="1" fill="#00c853"/>
    <rect x="66" y="60" width="10" height="6" rx="0.5" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="96" y="36" width="14" height="36" rx="2" fill="#1a1a1a" stroke="#333" stroke-width="0.8"/>
    <circle cx="103" cy="44" r="3" fill="#00c853"/>
    <circle cx="103" cy="53" r="3" fill="#2196f3"/>
    <circle cx="103" cy="62" r="3" fill="#ff5722"/>
    <circle cx="103" cy="74" r="5" fill="#222" stroke="#555" stroke-width="1.5"/>
    <path d="M103 70 L103 74" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M100 71.5 A4 4 0 1 0 106 71.5" fill="none" stroke="#ccc" stroke-width="1.5"/>
    <rect x="24" y="76" width="68" height="1" rx="0.5" fill="#1a1a1a"/>
    <rect x="24" y="80" width="68" height="1" rx="0.5" fill="#1a1a1a"/>
    <rect x="24" y="84" width="68" height="1" rx="0.5" fill="#1a1a1a"/>
    <rect x="24" y="88" width="68" height="1" rx="0.5" fill="#1a1a1a"/>
    <rect x="24" y="92" width="68" height="1" rx="0.5" fill="#1a1a1a"/>
  </svg>`),
  deco: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="deco_body" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#eeeeee"/>
        <stop offset="30%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#fdfdfd"/>
        <stop offset="100%" stop-color="#dddddd"/>
      </linearGradient>
      <linearGradient id="deco_top" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8f8f8"/>
        <stop offset="100%" stop-color="#e0e0e0"/>
      </linearGradient>
    </defs>
    <!-- Main Cylinder Body (with curved bottom) -->
    <path d="M 24 36 L 24 100 Q 64 116 104 100 L 104 36 Z" fill="url(#deco_body)"/>
    <!-- Cylinder Top Outline -->
    <ellipse cx="64" cy="36" rx="40" ry="12" fill="url(#deco_top)" stroke="#cccccc" stroke-width="1"/>
    <!-- Inner Top Indentation -->
    <ellipse cx="64" cy="36" rx="34" ry="9" fill="#ffffff" stroke="#eeeeee" stroke-width="1"/>
    <ellipse cx="64" cy="36" rx="30" ry="7" fill="#fcfcfc" stroke="#f0f0f0" stroke-width="0.5"/>
    <!-- Ports/Back section at the bottom right -->
    <path d="M 86 66 L 86 102 C 92 100 98 97 100 93 L 100 62 C 96 64 92 65 86 66 Z" fill="#e0e0e0" stroke="#cccccc" stroke-width="1"/>
    <!-- Port 1 -->
    <rect x="88" y="70" width="8" height="6" rx="1" fill="#999999" stroke="#777777" stroke-width="0.5"/>
    <rect x="89.5" y="70" width="5" height="3" fill="#333333"/>
    <!-- Port 2 -->
    <rect x="88" y="80" width="8" height="6" rx="1" fill="#999999" stroke="#777777" stroke-width="0.5"/>
    <rect x="89.5" y="80" width="5" height="3" fill="#333333"/>
    <!-- Power Jack -->
    <circle cx="92" cy="94" r="2" fill="#333333"/>
    <circle cx="92" cy="94" r="0.8" fill="#111111"/>
    <circle cx="92" cy="94" r="0.4" fill="#ffffff"/>
    <!-- TP-Link Logo Text approx -->
    <text x="68" y="60" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#aaaaaa" transform="rotate(5 68 60)">tp-link</text>
  </svg>`),

  switch: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="sw_ch" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3c3c3c"/>
        <stop offset="100%" stop-color="#111"/>
      </linearGradient>
      <linearGradient id="sw_sh" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.14)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <rect x="4" y="32" width="120" height="64" rx="5" fill="url(#sw_ch)"/>
    <rect x="4" y="32" width="120" height="18" rx="5" fill="url(#sw_sh)"/>
    <rect x="8" y="36" width="112" height="56" rx="3" fill="#222"/>
    <rect x="10" y="40" width="22" height="20" rx="2" fill="#1a1a1a"/>
    <rect x="12" y="42" width="8" height="6" rx="1" fill="#2196f3" opacity="0.8"/>
    <rect x="22" y="44" width="8" height="2" rx="0.5" fill="#333"/>
    <rect x="22" y="48" width="6" height="2" rx="0.5" fill="#333"/>
    <rect x="34" y="40" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="46" y="40" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="58" y="40" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="70" y="40" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="82" y="40" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="94" y="40" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#555" stroke-width="0.6"/>
    <rect x="34" y="52" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="46" y="52" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="58" y="52" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="70" y="52" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="82" y="52" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#404040" stroke-width="0.6"/>
    <rect x="94" y="52" width="10" height="9" rx="1" fill="#1a1a1a" stroke="#555" stroke-width="0.6"/>
    <circle cx="39" cy="39" r="1.5" fill="#00c853"/>
    <circle cx="51" cy="39" r="1.5" fill="#00c853"/>
    <circle cx="63" cy="39" r="1.5" fill="#ff9800"/>
    <circle cx="75" cy="39" r="1.5" fill="#00c853"/>
    <circle cx="87" cy="39" r="1.5" fill="#00c853"/>
    <circle cx="99" cy="39" r="1.5" fill="#616161"/>
    <circle cx="39" cy="51" r="1.5" fill="#00c853"/>
    <circle cx="51" cy="51" r="1.5" fill="#616161"/>
    <circle cx="63" cy="51" r="1.5" fill="#00c853"/>
    <circle cx="75" cy="51" r="1.5" fill="#2196f3"/>
    <circle cx="87" cy="51" r="1.5" fill="#00c853"/>
    <circle cx="99" cy="51" r="1.5" fill="#616161"/>
    <rect x="106" y="40" width="12" height="21" rx="2" fill="#1a1a1a" stroke="#555" stroke-width="0.8"/>
    <circle cx="112" cy="47" r="2.5" fill="#00c853"/>
    <circle cx="112" cy="55" r="2.5" fill="#2196f3"/>
    <rect x="10" y="64" width="22" height="6" rx="1" fill="#1a1a1a"/>
    <circle cx="16" cy="67" r="2" fill="#00c853"/>
    <circle cx="24" cy="67" r="2" fill="#2196f3"/>
    <rect x="34" y="66" width="84" height="1" rx="0.5" fill="#1a1a1a"/>
    <rect x="34" y="70" width="84" height="1" rx="0.5" fill="#1a1a1a"/>
    <rect x="34" y="74" width="84" height="1" rx="0.5" fill="#1a1a1a"/>
    <rect x="34" y="78" width="84" height="1" rx="0.5" fill="#1a1a1a"/>
    <rect x="34" y="82" width="84" height="1" rx="0.5" fill="#1a1a1a"/>
  </svg>`),

  nas: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="nas_bd" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#e8e8e8"/>
        <stop offset="100%" stop-color="#b8b8b8"/>
      </linearGradient>
      <linearGradient id="nas_sh" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
      <linearGradient id="nas_bay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#d0d0d0"/>
        <stop offset="100%" stop-color="#a0a0a0"/>
      </linearGradient>
    </defs>
    <rect x="22" y="6" width="84" height="116" rx="7" fill="url(#nas_bd)" stroke="#aaa" stroke-width="1.2"/>
    <rect x="22" y="6" width="84" height="22" rx="7" fill="url(#nas_sh)"/>
    <rect x="22" y="6" width="8" height="116" rx="4" fill="#1c1c1c"/>
    <rect x="26" y="10" width="52" height="12" rx="2" fill="#1a1a1a"/>
    <rect x="28" y="12" width="22" height="8" rx="1" fill="#2196f3"/>
    <rect x="52" y="12" width="24" height="8" rx="1" fill="#0a0a0a"/>
    <circle cx="57" cy="16" r="2" fill="#00c853"/>
    <circle cx="64" cy="16" r="2" fill="#2196f3"/>
    <circle cx="71" cy="16" r="2" fill="#ff9800"/>
    <rect x="32" y="27" width="72" height="18" rx="3" fill="url(#nas_bay)" stroke="#999" stroke-width="0.8"/>
    <rect x="35" y="30" width="60" height="12" rx="2" fill="#bbb"/>
    <rect x="37" y="32" width="40" height="8" rx="1" fill="#c8c8c8"/>
    <circle cx="87" cy="36" r="3.5" fill="#888" stroke="#666" stroke-width="0.5"/>
    <circle cx="82" cy="36" r="1.8" fill="#00c853"/>
    <rect x="32" y="49" width="72" height="18" rx="3" fill="url(#nas_bay)" stroke="#999" stroke-width="0.8"/>
    <rect x="35" y="52" width="60" height="12" rx="2" fill="#bbb"/>
    <rect x="37" y="54" width="40" height="8" rx="1" fill="#c8c8c8"/>
    <circle cx="87" cy="58" r="3.5" fill="#888" stroke="#666" stroke-width="0.5"/>
    <circle cx="82" cy="58" r="1.8" fill="#00c853"/>
    <rect x="32" y="71" width="72" height="18" rx="3" fill="url(#nas_bay)" stroke="#999" stroke-width="0.8"/>
    <rect x="35" y="74" width="60" height="12" rx="2" fill="#bbb"/>
    <rect x="37" y="76" width="40" height="8" rx="1" fill="#c8c8c8"/>
    <circle cx="87" cy="80" r="3.5" fill="#888" stroke="#666" stroke-width="0.5"/>
    <circle cx="82" cy="80" r="1.8" fill="#ff9800"/>
    <rect x="32" y="93" width="72" height="18" rx="3" fill="url(#nas_bay)" stroke="#999" stroke-width="0.8"/>
    <rect x="35" y="96" width="60" height="12" rx="2" fill="#bbb"/>
    <rect x="37" y="98" width="40" height="8" rx="1" fill="#c8c8c8"/>
    <circle cx="87" cy="102" r="3.5" fill="#888" stroke="#666" stroke-width="0.5"/>
    <circle cx="82" cy="102" r="1.8" fill="#616161"/>
    <rect x="32" y="116" width="10" height="6" rx="1" fill="#333" stroke="#555" stroke-width="0.5"/>
    <circle cx="90" cy="119" r="6" fill="#1a1a1a" stroke="#555" stroke-width="1.5"/>
    <circle cx="90" cy="119" r="3" fill="#00c853"/>
  </svg>`),

  iot: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="iot_bd" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f0f0f0"/>
        <stop offset="100%" stop-color="#d0d0d0"/>
      </linearGradient>
      <linearGradient id="iot_top" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#00897b"/>
        <stop offset="100%" stop-color="#004d40"/>
      </linearGradient>
      <radialGradient id="iot_btn" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#43a047"/>
        <stop offset="100%" stop-color="#1b5e20"/>
      </radialGradient>
    </defs>
    <rect x="14" y="14" width="100" height="100" rx="18" fill="url(#iot_bd)" stroke="#bbb" stroke-width="1.5"/>
    <rect x="14" y="14" width="100" height="30" rx="14" fill="url(#iot_top)"/>
    <rect x="20" y="18" width="88" height="22" rx="10" fill="rgba(255,255,255,0.18)"/>
    <path d="M64 38 L64 38" stroke="white" stroke-width="2"/>
    <path d="M50 22 Q64 13 78 22" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M54 27 Q64 20 74 27" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M58 32 Q64 27 70 32" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="64" cy="36" r="2.5" fill="white"/>
    <circle cx="64" cy="72" r="26" fill="white" stroke="#e0e0e0" stroke-width="2"/>
    <circle cx="64" cy="72" r="20" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
    <circle cx="64" cy="72" r="14" fill="url(#iot_btn)"/>
    <path d="M64 64 L64 72" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M58.5 66.5 A8 8 0 1 0 69.5 66.5" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="38" y="104" width="52" height="4" rx="2" fill="#e0e0e0"/>
    <rect x="50" y="110" width="28" height="3" rx="1.5" fill="#ddd"/>
  </svg>`),

  network: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="net_dv" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1976d2"/>
        <stop offset="100%" stop-color="#0d47a1"/>
      </linearGradient>
      <linearGradient id="net_sh" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <line x1="64" y1="10" x2="64" y2="40" stroke="#42a5f5" stroke-width="2" stroke-dasharray="4,3" opacity="0.7"/>
    <line x1="30" y1="18" x2="40" y2="42" stroke="#42a5f5" stroke-width="2" stroke-dasharray="4,3" opacity="0.7"/>
    <line x1="98" y1="18" x2="88" y2="42" stroke="#42a5f5" stroke-width="2" stroke-dasharray="4,3" opacity="0.7"/>
    <circle cx="64" cy="10" r="6" fill="#1565c0" stroke="#42a5f5" stroke-width="1.5"/>
    <circle cx="30" cy="18" r="6" fill="#1565c0" stroke="#42a5f5" stroke-width="1.5"/>
    <circle cx="98" cy="18" r="6" fill="#1565c0" stroke="#42a5f5" stroke-width="1.5"/>
    <rect x="14" y="40" width="100" height="52" rx="8" fill="url(#net_dv)"/>
    <rect x="14" y="40" width="100" height="20" rx="8" fill="url(#net_sh)"/>
    <rect x="20" y="48" width="88" height="36" rx="4" fill="#0d47a1"/>
    <rect x="24" y="52" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <rect x="35" y="52" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <rect x="46" y="52" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <rect x="57" y="52" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <rect x="68" y="52" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <rect x="79" y="52" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <circle cx="28" cy="51" r="1.5" fill="#00e676"/>
    <circle cx="39" cy="51" r="1.5" fill="#00e676"/>
    <circle cx="50" cy="51" r="1.5" fill="#ff9100"/>
    <circle cx="61" cy="51" r="1.5" fill="#00e676"/>
    <circle cx="72" cy="51" r="1.5" fill="#00e676"/>
    <circle cx="83" cy="51" r="1.5" fill="#616161"/>
    <rect x="24" y="63" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <rect x="35" y="63" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <rect x="46" y="63" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <rect x="57" y="63" width="9" height="8" rx="1" fill="#0a2d6b" stroke="#1976d2" stroke-width="0.6"/>
    <circle cx="28" cy="62" r="1.5" fill="#00e676"/>
    <circle cx="39" cy="62" r="1.5" fill="#616161"/>
    <circle cx="50" cy="62" r="1.5" fill="#00e676"/>
    <circle cx="61" cy="62" r="1.5" fill="#2196f3"/>
    <rect x="90" y="52" width="14" height="20" rx="2" fill="#0a2d6b"/>
    <circle cx="97" cy="58" r="3" fill="#00e676"/>
    <circle cx="97" cy="66" r="3" fill="#2196f3"/>
    <line x1="40" y1="92" x2="48" y2="118" stroke="#42a5f5" stroke-width="2" stroke-dasharray="4,3" opacity="0.7"/>
    <line x1="88" y1="92" x2="80" y2="118" stroke="#42a5f5" stroke-width="2" stroke-dasharray="4,3" opacity="0.7"/>
    <circle cx="48" cy="118" r="6" fill="#1565c0" stroke="#42a5f5" stroke-width="1.5"/>
    <circle cx="80" cy="118" r="6" fill="#1565c0" stroke="#42a5f5" stroke-width="1.5"/>
  </svg>`),

  media: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="10" y="24" width="108" height="68" rx="6" fill="#1a1a1a" stroke="#444" stroke-width="2"/>
    <rect x="16" y="30" width="96" height="50" rx="2" fill="#000"/>
    <rect x="44" y="94" width="40" height="8" rx="2" fill="#222"/>
    <rect x="34" y="102" width="60" height="4" rx="2" fill="#333"/>
    <path d="M60 42 L74 55 L60 68 Z" fill="#2196f3"/>
  </svg>`),
  console: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M24 64 C24 44 44 34 64 34 C84 34 104 44 104 64 C104 84 94 94 84 94 L44 94 C34 94 24 84 24 64 Z" fill="#333" stroke="#444" stroke-width="2"/>
    <circle cx="44" cy="64" r="14" fill="#444"/>
    <rect x="38" y="62" width="12" height="4" rx="1" fill="#111"/>
    <rect x="42" y="58" width="4" height="12" rx="1" fill="#111"/>
    <circle cx="84" cy="54" r="3" fill="#ff5252"/>
    <circle cx="90" cy="60" r="3" fill="#4caf50"/>
    <circle cx="84" cy="66" r="3" fill="#2196f3"/>
    <circle cx="78" cy="60" r="3" fill="#ffeb3b"/>
    <rect x="58" y="80" width="12" height="4" rx="2" fill="#111"/>
  </svg>`),
  printer: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="20" y="44" width="88" height="48" rx="4" fill="#f5f5f5" stroke="#999" stroke-width="2"/>
    <rect x="34" y="24" width="60" height="30" rx="2" fill="#fff" stroke="#999" stroke-width="1.5"/>
    <rect x="34" y="84" width="60" height="20" rx="2" fill="#fff" stroke="#999" stroke-width="1.5"/>
    <rect x="90" y="58" width="10" height="4" rx="1" fill="#333"/>
    <circle cx="95" cy="52" r="2" fill="#00c853"/>
  </svg>`),
  ap: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="50" fill="#fff" stroke="#e0e0e0" stroke-width="2"/>
    <circle cx="64" cy="64" r="40" fill="#fafafa"/>
    <circle cx="64" cy="64" r="6" fill="#2196f3" opacity="0.8"/>
    <path d="M64 34 A30 30 0 0 1 94 64" fill="none" stroke="#2196f3" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
    <path d="M34 64 A30 30 0 0 1 64 34" fill="none" stroke="#2196f3" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
  </svg>`),
  unknown: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="14" y="14" width="100" height="80" rx="6" fill="#78909c" stroke="#455a64" stroke-width="2"/>
    <rect x="20" y="20" width="88" height="60" rx="2" fill="#263238"/>
    <text x="64" y="65" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="#546e7a" opacity="0.6">?</text>
    <rect x="48" y="100" width="32" height="10" rx="2" fill="#546e7a"/>
  </svg>`),
  vm: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="14" y="14" width="100" height="100" rx="12" fill="#2a2a2a" stroke="#444" stroke-width="4" stroke-dasharray="8 8"/>
    <rect x="34" y="34" width="60" height="60" rx="6" fill="#8e24aa"/>
    <text x="64" y="74" text-anchor="middle" font-family="Arial" font-size="32" font-weight="bold" fill="#fff">VM</text>
  </svg>`),
  ct: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="14" y="24" width="100" height="80" rx="6" fill="#1565c0" stroke="#0d47a1" stroke-width="3"/>
    <path d="M14 44 L114 44 M14 64 L114 64 M14 84 L114 84" stroke="#0d47a1" stroke-width="3"/>
    <path d="M34 24 L34 104 M64 24 L64 104 M94 24 L94 104" stroke="#0d47a1" stroke-width="3" stroke-dasharray="8 4"/>
    <rect x="44" y="48" width="40" height="32" rx="4" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="2"/>
    <text x="64" y="71" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="#2c3e50">LXC</text>
  </svg>`),
  phone: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="34" y="10" width="60" height="108" rx="8" fill="#34495e" stroke="#2c3e50" stroke-width="2"/>
    <rect x="38" y="20" width="52" height="80" rx="4" fill="#ecf0f1"/>
    <rect x="54" y="107" width="20" height="4" rx="2" fill="#7f8c8d"/>
    <circle cx="64" cy="15" r="2" fill="#7f8c8d"/>
    <rect x="42" y="24" width="44" height="72" rx="2" fill="#3498db" opacity="0.2"/>
  </svg>`),
  tv: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="10" y="24" width="108" height="68" rx="4" fill="#2c3e50" stroke="#1a252f" stroke-width="3"/>
    <rect x="14" y="28" width="100" height="60" rx="2" fill="#000"/>
    <rect x="44" y="100" width="40" height="6" rx="2" fill="#7f8c8d"/>
    <path d="M54 92 L74 92 L68 100 L60 100 Z" fill="#95a5a6"/>
    <circle cx="64" cy="58" r="15" fill="#e74c3c" opacity="0.8"/>
    <path d="M60 50 L74 58 L60 66 Z" fill="#fff"/>
  </svg>`),
};

const TYPE_COLORS = {
  server: '#27ae60',
  router: '#e67e22',
  nas: '#8e44ad',
  media: '#e91e63',
  console: '#2196f3',
  printer: '#95a5a6',
  iot: '#1abc9c',
  network: '#2980b9',
  switch: '#34495e',
  ap: '#00bcd4',
  vm: '#9b59b6',
  ct: '#3498db',
  phone: '#f39c12',
  tv: '#c0392b',
  unknown: '#546e7a',
};

const TYPE_SIZES = {
  server: 70,
  router: 72,
  nas: 68,
  media: 65,
  console: 60,
  printer: 60,
  iot: 60,
  network: 64,
  switch: 70,
  ap: 60,
  vm: 65,
  ct: 65,
  phone: 50,
  tv: 75,
  unknown: 60,
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
  '192.168.0.129': 'Deco-1',
  '192.168.0.22': 'Deco-2',
  '192.168.0.30': 'Deco-3',
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
  vm: 'MASZYNY WIRTUALNE',
  ct: 'KONTENERY',
  phone: 'URZĄDZENIA MOBILNE',
  tv: 'RTV',
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

function makeNodeStyle(nodeOrType) {
  let type, ip, imageUrl;

  if (typeof nodeOrType === 'string') {
    type = nodeOrType;
  } else if (nodeOrType && nodeOrType.data) {
    type = nodeOrType.data('type');
    ip = nodeOrType.data('ip');
    imageUrl = nodeOrType.data('image_url');
  } else {
    type = 'unknown';
  }

  const size = TYPE_SIZES[type] || 40;

  // 1. Priority: Direct image URL from DB/JSON
  if (imageUrl) {
    return {
      'background-opacity': 0,
      'background-image': imageUrl,
      'background-fit': 'contain',
      'background-clip': 'node',
      'shape': 'rectangle',
      'border-width': 0,
      width: size,
      height: size,
    };
  }

  // TP-Link Deco Mesh Nodes
  if (['192.168.0.30', '192.168.0.129', '192.168.0.22'].includes(ip)) {
    return {
      'background-opacity': 0,
      'background-image': ICONS.deco,
      'background-fit': 'contain',
      'background-clip': 'node',
      'shape': 'rectangle',
      'border-width': 0,
      width: size + 5,
      height: size + 5,
    };
  }


  // Gaming router with 5 antennas
  if (ip === '192.168.0.254') {
    return {
      'background-opacity': 0,
      'background-image': ICONS.asus5,
      'background-fit': 'contain',
      'background-clip': 'node',
      'shape': 'rectangle',
      'border-width': 0,
      width: size + 10,
      height: size + 10,
    };
  }

  // 3. Fallback: Icons map
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

export default function TopologyMap({ devices = [], links = [], onNodeTap = null, onNodeDelete = null }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const onNodeTapRef = useRef(onNodeTap);
  const onNodeDeleteRef = useRef(onNodeDelete);
  useEffect(() => { onNodeTapRef.current = onNodeTap; }, [onNodeTap]);
  useEffect(() => { onNodeDeleteRef.current = onNodeDelete; }, [onNodeDelete]);

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
          image_url: d.image_url,
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
          selector: '.group',
          style: {
            'background-opacity': 0,
            'border-width': 0,
            label: 'data(label)',
            color: '#546e7a',
            'font-size': '14px',
            'font-weight': 'bold',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -15,
          },
        },
        {
          selector: 'node:childless',
          style: {
            label: 'data(label)',
            color: '#263238',
            'font-size': 11,
            'font-weight': 'bold',
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
        ...Object.keys(TYPE_SIZES).map(type => ({
          selector: `node[type="${type}"]`,
          style: makeNodeStyle(type)
        })),
        {
          selector: 'node[status="down"]',
          style: {
            'border-color': '#e74c3c',
            'border-width': 3,
            'border-opacity': 1,
            'border-style': 'double',
          },
        },
        {
          selector: 'node:childless:selected',
          style: { 'border-color': '#f1c40f', 'border-width': 3, 'border-opacity': 1 },
        },
        {
          selector: 'edge',
          style: {
            width: 3,
            'line-color': '#b0bec5',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#b0bec5',
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

    // Group containers — non-interactive (can't grab or select)
    cyRef.current.nodes('.group').ungrabify().unselectify();

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

    cyRef.current.on('tap', 'node:childless', evt => {
      if (onNodeTapRef.current) {
        onNodeTapRef.current(evt.target.id());
      }
    });

    cyRef.current.on('mouseover', 'node:childless', evt => {
      const d = evt.target.data();
      evt.target.style('label', `${d.label}\n${d.ip}${d.vendor ? '\n' + d.vendor : ''}`);
    });
    cyRef.current.on('mouseout', 'node:childless', evt => {
      evt.target.style('label', evt.target.data('label'));
    });

    // Context menu on right-click: rename or delete
    cyRef.current.on('cxttap', 'node:childless', evt => {
      const node = evt.target;
      const currentLabel = node.data('label');
      const action = window.prompt(
        `"${currentLabel}"\n\nWpisz "usuń" żeby usunąć, lub nową nazwę żeby zmienić:`,
        ''
      );
      if (action === null) return;
      if (action.trim().toLowerCase() === 'usuń') {
        if (onNodeDeleteRef.current) onNodeDeleteRef.current(node.id());
      } else if (action.trim() && action.trim() !== currentLabel) {
        node.data('label', action.trim());
        patchDevice(node.id(), { label: action.trim() }).catch(() => {
          alert('Błąd zapisu nazwy.');
        });
      }
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
