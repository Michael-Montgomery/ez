import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartTooltip } from './tooltip.jsx';
import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';

const money = (v) => `$${Number(v).toFixed(2)}`;

export default function RepeatRoutes() {
  const { repeatRoutes, weekdayWeekend, byDaypart } = useData();
  const maxRoute = Math.max(1, ...repeatRoutes.map((r) => r.count));
  const wk = weekdayWeekend;
  const wkTotal = wk.weekday.count + wk.weekend.count || 1;
  const maxAvg = Math.max(...byDaypart.map((d) => d.avgAmount), 0.01);

  return (
    <Section
      id="routes"
      eyebrow="Habits"
      title="Your regular routes & timing"
      sub="The journeys you repeat most, whether you drive more on weekdays or weekends, and how the average toll shifts across the day."
    >
      <div className="grid cols-2 reveal" data-stagger-parent>
        <div className="chart-card panel" data-stagger>
          <h3>Most-driven routes</h3>
          <div className="caption">Origin → destination journeys, by frequency</div>
          {repeatRoutes.length === 0 ? (
            <div className="rr-empty">No repeated multi-stop routes in this file yet.</div>
          ) : (
            <div className="rr-list">
              {repeatRoutes.map((r, i) => (
                <div className="rr-row" key={i}>
                  <div className="rr-label">
                    {r.from} <span className="rr-arr">→</span> {r.to}
                  </div>
                  <div className="rr-barwrap">
                    <div className="rr-bar" style={{ width: `${(r.count / maxRoute) * 100}%` }} />
                    <span className="rr-count">
                      {r.count}× · {money(r.spend)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chart-card panel" data-stagger>
          <h3>Weekday vs weekend</h3>
          <div className="caption">Share of your toll activity</div>
          <div className="ww">
            <WWSide
              label="Weekdays"
              count={wk.weekday.count}
              spend={wk.weekday.spend}
              pct={(wk.weekday.count / wkTotal) * 100}
              color="#4fd1c5"
            />
            <WWSide
              label="Weekends"
              count={wk.weekend.count}
              spend={wk.weekend.spend}
              pct={(wk.weekend.count / wkTotal) * 100}
              color="#9f7aea"
            />
          </div>
          <div className="ww-split">
            <div className="ww-seg" style={{ width: `${(wk.weekday.count / wkTotal) * 100}%`, background: '#4fd1c5' }} />
            <div className="ww-seg" style={{ width: `${(wk.weekend.count / wkTotal) * 100}%`, background: '#9f7aea' }} />
          </div>
        </div>
      </div>

      <div className="chart-card panel reveal" style={{ marginTop: 20 }}>
        <h3>Average toll by time of day</h3>
        <div className="caption">Higher bars hint at congestion / peak-hour pricing</div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={byDaypart} margin={{ left: -14, right: 8 }}>
              <XAxis
                dataKey="part"
                tick={{ fill: '#9aa4c4', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v.toFixed(1)}`}
                tick={{ fill: '#5c6688', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<ChartTooltip formatter={(v, p) => `${money(v)} avg · ${p.payload.count} tolls`} />}
              />
              <Bar dataKey="avgAmount" name="Avg toll" radius={[5, 5, 0, 0]}>
                {byDaypart.map((d, i) => (
                  <Cell key={i} fill={`hsl(${180 - (d.avgAmount / maxAvg) * 150}, 68%, 58%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .rr-list { display: flex; flex-direction: column; gap: 14px; margin-top: 8px; }
        .rr-empty { color: var(--text-faint); font-size: 13px; padding: 30px 0; text-align: center; }
        .rr-label { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        .rr-arr { color: var(--accent); }
        .rr-barwrap { display: flex; align-items: center; gap: 10px; }
        .rr-bar { height: 10px; border-radius: 999px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); min-width: 4px; }
        .rr-count { font-size: 12px; color: var(--text-dim); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .ww { display: flex; gap: 20px; margin: 18px 0 16px; }
        .ww-side { flex: 1; }
        .ww-side .l { font-size: 13px; color: var(--text-dim); }
        .ww-side .v { font-size: 30px; font-weight: 850; font-variant-numeric: tabular-nums; }
        .ww-side .s { font-size: 12px; color: var(--text-faint); }
        .ww-split { display: flex; height: 12px; border-radius: 999px; overflow: hidden; gap: 2px; }
        .ww-seg { height: 100%; }
      `}</style>
    </Section>
  );
}

function WWSide({ label, count, spend, pct, color }) {
  return (
    <div className="ww-side">
      <div className="l">{label}</div>
      <div className="v" style={{ color }}>
        {pct.toFixed(0)}%
      </div>
      <div className="s">
        {count} tolls · ${spend.toFixed(2)}
      </div>
    </div>
  );
}
