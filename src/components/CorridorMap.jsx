import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AGENCY_INFO } from '../data/process.js';
import { useData } from '../data/DataContext.jsx';

gsap.registerPlugin(ScrollTrigger);

const W = 1000;
const PAD = 70;

export default function CorridorMap() {
  const { mapPoints, segments, explicitSegments } = useData();
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);

  // Build an equirectangular projection over all visited points.
  const { project, H } = useMemo(() => {
    if (!mapPoints.length) return { project: ([]) => [0, 0], H: 400 };
    const lats = mapPoints.map((p) => p.coord[0]);
    const lngs = mapPoints.map((p) => p.coord[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const midLat = (minLat + maxLat) / 2;
    const kx = Math.cos((midLat * Math.PI) / 180);
    const spanX = Math.max((maxLng - minLng) * kx, 0.05);
    const spanY = Math.max(maxLat - minLat, 0.05);
    const innerW = W - PAD * 2;
    const scale = innerW / spanX;
    const innerH = spanY * scale;
    const height = innerH + PAD * 2;
    const proj = ([lat, lng]) => [
      PAD + (lng - minLng) * kx * scale,
      PAD + (maxLat - lat) * scale,
    ];
    return { project: proj, H: height };
  }, [mapPoints]);

  const tripSegs = useMemo(() => segments.filter((s) => s.sameTrip), [segments]);

  useEffect(() => {
    if (!svgRef.current) return undefined;
    const ctx = gsap.context(() => {
      // Draw route lines.
      gsap.utils.toArray('.route-line').forEach((path, i) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: 'power2.inOut',
          delay: i * 0.06,
          scrollTrigger: { trigger: svgRef.current, start: 'top 70%' },
        });
      });
      // Pop plaza nodes in.
      gsap.from('.plaza-node', {
        scale: 0,
        opacity: 0,
        transformOrigin: 'center',
        duration: 0.6,
        ease: 'back.out(2)',
        stagger: 0.05,
        scrollTrigger: { trigger: svgRef.current, start: 'top 70%' },
      });
    }, svgRef);

    // RAF-independent safety net: if the draw animation never renders (stalled
    // ticker), reveal the routes and nodes directly once the map is in view.
    const svg = svgRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          setTimeout(() => {
            const firstNode = svg.querySelector('.plaza-node');
            const hidden = firstNode && Number(getComputedStyle(firstNode).opacity) < 0.99;
            if (!hidden) return;
            svg.querySelectorAll('.route-line').forEach((p) => (p.style.strokeDashoffset = '0'));
            svg.querySelectorAll('.plaza-node').forEach((n) => {
              n.style.setProperty('opacity', '1', 'important');
              n.style.transform = 'none';
            });
          }, 1600);
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(svg);

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, [project]);

  const maxCount = Math.max(...mapPoints.map((p) => p.count));

  if (!mapPoints.length) {
    return (
      <div className="map-wrap panel" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)' }}>
          None of the toll locations in this file could be placed on the map. The map currently
          knows the Northeast / Mid-Atlantic corridor (Maryland, PA Turnpike, Delaware, NJ, NYC).
          Your charts below still work in full.
        </p>
      </div>
    );
  }

  return (
    <div className="map-wrap panel">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="corridor-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4fd1c5" />
            <stop offset="100%" stopColor="#63b3ed" />
          </linearGradient>
        </defs>

        {/* faint corridor connective tissue */}
        {tripSegs.map((s, i) => {
          const [x1, y1] = project(s.fromCoord);
          const [x2, y2] = project(s.toCoord);
          return (
            <line
              key={`base-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* animated same-trip route lines */}
        {tripSegs.map((s, i) => {
          const [x1, y1] = project(s.fromCoord);
          const [x2, y2] = project(s.toCoord);
          return (
            <line
              key={`route-${i}`}
              className="route-line"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#routeGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.85"
            />
          );
        })}

        {/* explicit ticketed segments drawn as arcs */}
        {explicitSegments.map((s, i) => {
          const [x1, y1] = project(s.fromCoord);
          const [x2, y2] = project(s.toCoord);
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.18 - 20;
          return (
            <path
              key={`arc-${i}`}
              className="route-line"
              d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
              fill="none"
              stroke="rgba(159,122,234,0.55)"
              strokeWidth="1.8"
              strokeDasharray="1 6"
              strokeLinecap="round"
            />
          );
        })}

        {/* plaza nodes */}
        {mapPoints.map((p) => {
          const [x, y] = project(p.coord);
          const r = 4 + (p.count / maxCount) * 10;
          const color = AGENCY_INFO[p.agency]?.color || '#fff';
          return (
            <g
              key={p.plaza}
              className="plaza-node"
              onMouseEnter={() => setHover({ ...p, x, y })}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r={r + 6} fill={color} opacity="0.12" />
              <circle cx={x} cy={y} r={r} fill={color} filter="url(#glow)" />
              <circle cx={x} cy={y} r={r} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1" />
            </g>
          );
        })}

        {hover && (
          <g pointerEvents="none">
            <line
              x1={hover.x}
              y1={hover.y}
              x2={hover.x}
              y2={hover.y - 40}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
          </g>
        )}
      </svg>

      {hover && (
        <div
          className="map-tooltip"
          style={{
            left: `${(hover.x / W) * 100}%`,
            top: `${(hover.y / H) * 100}%`,
          }}
        >
          <div className="mt-title">{hover.label}</div>
          <div className="mt-row">
            <span
              className="dot"
              style={{ background: AGENCY_INFO[hover.agency]?.color }}
            />
            {AGENCY_INFO[hover.agency]?.short || hover.agency}
          </div>
          <div className="mt-stats">
            <span>{hover.count} passes</span>
            <span>${hover.spend.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="map-legend">
        {Object.entries(AGENCY_INFO).map(([k, v]) => (
          <span className="pill" key={k}>
            <span className="dot" style={{ background: v.color }} /> {v.short}
          </span>
        ))}
      </div>

      <style>{`
        .map-wrap { position: relative; padding: 18px; overflow: hidden; }
        .corridor-svg { width: 100%; height: auto; display: block; }
        .map-tooltip {
          position: absolute;
          transform: translate(-50%, calc(-100% - 18px));
          background: rgba(12, 16, 30, 0.96);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 10px 13px;
          pointer-events: none;
          min-width: 150px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.5);
        }
        .mt-title { font-weight: 700; font-size: 13.5px; margin-bottom: 6px; }
        .mt-row { display: flex; align-items: center; gap: 7px; color: var(--text-dim); font-size: 12px; }
        .mt-stats { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12.5px; font-weight: 600; color: var(--accent); }
        .map-legend { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px 6px 4px; }
      `}</style>
    </div>
  );
}
