import { useMemo, useState } from 'react';
import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';

const W = 1000;
const PAD = 26;
const GAP = 12;
const LEFT_X = 250;
const RIGHT_X = 750;
const PALETTE = ['#4fd1c5', '#63b3ed', '#9f7aea', '#f2b544', '#f56565', '#68d391', '#ed8fb8', '#f6ad55'];

export default function FlowDiagram() {
  const { odFlows } = useData();
  const [hover, setHover] = useState(null);

  const layout = useMemo(() => {
    if (!odFlows.length) return null;
    const total = odFlows.reduce((s, f) => s + f.count, 0);
    const originTotals = {};
    const destTotals = {};
    odFlows.forEach((f) => {
      originTotals[f.from] = (originTotals[f.from] || 0) + f.count;
      destTotals[f.to] = (destTotals[f.to] || 0) + f.count;
    });
    const origins = Object.entries(originTotals).sort((a, b) => b[1] - a[1]);
    const dests = Object.entries(destTotals).sort((a, b) => b[1] - a[1]);

    const colBudget = 560 - PAD * 2;
    const place = (arr) => {
      const gaps = GAP * Math.max(0, arr.length - 1);
      const avail = colBudget - gaps;
      const pos = {};
      let y = PAD;
      arr.forEach(([name, cnt]) => {
        const h = Math.max(22, (cnt / total) * avail);
        pos[name] = { y, h, cnt, used: 0 };
        y += h + GAP;
      });
      return { pos, height: y - GAP };
    };
    const o = place(origins);
    const d = place(dests);
    const colorFor = {};
    origins.forEach(([name], i) => (colorFor[name] = PALETTE[i % PALETTE.length]));

    const ribbons = odFlows.map((f, i) => {
      const src = o.pos[f.from];
      const dst = d.pos[f.to];
      const thickness = (f.count / total) * (colBudget - GAP * Math.max(0, origins.length - 1));
      const sy = src.y + src.used + thickness / 2;
      const dy = dst.y + dst.used + thickness / 2;
      src.used += thickness;
      dst.used += thickness;
      const midX = (LEFT_X + RIGHT_X) / 2;
      return {
        id: i,
        flow: f,
        color: colorFor[f.from],
        thickness: Math.max(2, thickness),
        d: `M ${LEFT_X} ${sy} C ${midX} ${sy}, ${midX} ${dy}, ${RIGHT_X} ${dy}`,
      };
    });

    return {
      origins: origins.map(([name]) => ({ name, ...o.pos[name], color: colorFor[name] })),
      dests: dests.map(([name]) => ({ name, ...d.pos[name] })),
      ribbons,
      height: Math.max(o.height, d.height) + PAD,
    };
  }, [odFlows]);

  if (!layout) {
    return (
      <Section id="flow" eyebrow="Travel patterns" title="Where your trips flow">
        <div className="panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
          Not enough multi-stop trips in this file to draw origin → destination flows.
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="flow"
      eyebrow="Travel patterns"
      title="Where your trips flow"
      sub="Each ribbon links where a journey began to where it ended; thicker ribbons are routes you drove more often. Left = origins, right = destinations."
    >
      <div className="panel reveal flow-wrap">
        <svg viewBox={`0 0 ${W} ${layout.height}`} className="flow-svg">
          {layout.ribbons.map((r) => (
            <path
              key={r.id}
              d={r.d}
              fill="none"
              stroke={r.color}
              strokeWidth={r.thickness}
              strokeOpacity={hover == null || hover === r.id ? 0.5 : 0.12}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer', transition: 'stroke-opacity 0.15s' }}
            />
          ))}
          {layout.origins.map((n) => (
            <g key={`o-${n.name}`}>
              <rect x={LEFT_X - 10} y={n.y} width={10} height={n.h} rx={3} fill={n.color} />
              <text x={LEFT_X - 18} y={n.y + n.h / 2} textAnchor="end" dominantBaseline="middle" className="flow-label">
                {n.name}
              </text>
            </g>
          ))}
          {layout.dests.map((n) => (
            <g key={`d-${n.name}`}>
              <rect x={RIGHT_X} y={n.y} width={10} height={n.h} rx={3} fill="#8b96bd" />
              <text x={RIGHT_X + 18} y={n.y + n.h / 2} textAnchor="start" dominantBaseline="middle" className="flow-label">
                {n.name}
              </text>
            </g>
          ))}
        </svg>

        {hover != null && (
          <div className="flow-tip">
            {(() => {
              const f = layout.ribbons[hover].flow;
              return (
                <>
                  <strong>{f.from} → {f.to}</strong>
                  <span>
                    {f.count}× · ${f.spend.toFixed(2)} total
                    {f.miles > 1 ? ` · ~${(f.miles / f.count).toFixed(0)} mi each` : ''}
                  </span>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <style>{`
        .flow-wrap { position: relative; padding: 20px 12px; }
        .flow-svg { width: 100%; height: auto; display: block; }
        .flow-label { fill: var(--text-dim); font-size: 12.5px; font-weight: 600; }
        .flow-tip {
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; gap: 2px; text-align: center;
          background: rgba(12,16,30,0.95); border: 1px solid var(--panel-border);
          border-radius: 10px; padding: 8px 14px; pointer-events: none;
        }
        .flow-tip strong { font-size: 13px; }
        .flow-tip span { font-size: 12px; color: var(--accent); }
      `}</style>
    </Section>
  );
}
