import { useState } from 'react';
import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hourLabel = (h) => `${((h + 11) % 12) + 1}${h < 12 ? 'am' : 'pm'}`;

export default function ActivityHeatmap() {
  const { dowHour, dowHourMax, busiestHour } = useData();
  const [hover, setHover] = useState(null);

  const shade = (count) => {
    if (!count) return 'rgba(255,255,255,0.04)';
    const t = count / dowHourMax;
    // teal -> gold ramp
    const from = [79, 209, 197];
    const to = [242, 181, 68];
    const c = from.map((f, i) => Math.round(f + (to[i] - f) * t));
    return `rgba(${c[0]},${c[1]},${c[2]},${0.25 + t * 0.75})`;
  };

  return (
    <Section
      id="rhythm"
      eyebrow="Your rhythm"
      title="When you're on the road"
      sub="Every toll placed on a day-of-week × hour grid. Brighter cells are busier slots — the shape reveals your commute pattern at a glance."
    >
      <div className="chart-card panel reveal">
        <h3>Toll activity heatmap</h3>
        <div className="caption">
          Busiest slot peaks at {busiestHour.count} tolls · times shown in your export's local time
        </div>

        <div className="hm-scroll">
          <div className="hm">
            <div className="hm-corner" />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="hm-hcol">
                {h % 3 === 0 ? hourLabel(h) : ''}
              </div>
            ))}
            {DAYS.map((day, d) => (
              <div key={day} className="hm-row" style={{ display: 'contents' }}>
                <div className="hm-day">{day}</div>
                {Array.from({ length: 24 }, (_, h) => {
                  const count = dowHour[d][h];
                  return (
                    <div
                      key={h}
                      className="hm-cell"
                      style={{ background: shade(count) }}
                      onMouseEnter={() => setHover({ d, h, count })}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="hm-foot">
          <div className="hm-legend">
            Less
            <span className="hm-swatch" style={{ background: shade(0) }} />
            <span className="hm-swatch" style={{ background: shade(dowHourMax * 0.34) }} />
            <span className="hm-swatch" style={{ background: shade(dowHourMax * 0.67) }} />
            <span className="hm-swatch" style={{ background: shade(dowHourMax) }} />
            More
          </div>
          {hover && hover.count > 0 && (
            <div className="hm-hover">
              {DAYS[hover.d]} · {hourLabel(hover.h)} — <strong>{hover.count}</strong>{' '}
              {hover.count === 1 ? 'toll' : 'tolls'}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hm-scroll { overflow-x: auto; padding-bottom: 6px; }
        .hm {
          display: grid;
          grid-template-columns: 42px repeat(24, minmax(20px, 1fr));
          gap: 4px;
          min-width: 620px;
          margin-top: 8px;
        }
        .hm-corner { }
        .hm-hcol { font-size: 10px; color: var(--text-faint); text-align: left; height: 16px; }
        .hm-day { font-size: 11.5px; color: var(--text-dim); display: flex; align-items: center; height: 22px; }
        .hm-cell { height: 22px; border-radius: 5px; transition: transform 0.1s; cursor: default; }
        .hm-cell:hover { transform: scale(1.18); outline: 1px solid rgba(255,255,255,0.4); }
        .hm-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; flex-wrap: wrap; gap: 10px; }
        .hm-legend { display: flex; align-items: center; gap: 6px; color: var(--text-faint); font-size: 12px; }
        .hm-swatch { width: 16px; height: 16px; border-radius: 4px; }
        .hm-hover { font-size: 13px; color: var(--text-dim); }
        .hm-hover strong { color: var(--accent); }
      `}</style>
    </Section>
  );
}
