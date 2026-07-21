import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartTooltip } from './tooltip.jsx';
import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';

const money = (v) => `$${Number(v).toFixed(2)}`;

export default function Infrastructure() {
  const { byInfrastructure } = useData();
  const priciest = byInfrastructure.reduce((m, x) => (x.avg > m.avg ? x : m), byInfrastructure[0]);

  return (
    <Section
      id="infra"
      eyebrow="What you pay for"
      title="Bridges, tunnels & open road"
      sub="Grouping every toll point by the kind of infrastructure it guards shows where your money really goes — a few bridge and tunnel crossings can outweigh dozens of highway tolls."
    >
      <div className="grid cols-2 reveal" data-stagger-parent>
        <div className="chart-card panel" data-stagger>
          <h3>Total spend by type</h3>
          <div className="caption">How your tolls split across infrastructure</div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={byInfrastructure} layout="vertical" margin={{ left: 8, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="type"
                  width={92}
                  tick={{ fill: '#9aa4c4', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltip formatter={money} />}
                />
                <Bar dataKey="spend" name="Spend" radius={[0, 6, 6, 0]} barSize={26}>
                  {byInfrastructure.map((x) => (
                    <Cell key={x.type} fill={x.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card panel" data-stagger>
          <h3>Cost per crossing</h3>
          <div className="caption">Average toll each time you pass one</div>
          <div className="infra-list">
            {[...byInfrastructure]
              .sort((a, b) => b.avg - a.avg)
              .map((x) => (
                <div className="infra-row" key={x.type}>
                  <span className="dot" style={{ background: x.color }} />
                  <span className="ir-type">{x.type}</span>
                  <span className="ir-count">{x.count}×</span>
                  <span className="ir-avg" style={{ color: x.color }}>
                    {money(x.avg)}
                  </span>
                </div>
              ))}
          </div>
          <div className="infra-note">
            A single <strong>{priciest.type.toLowerCase()}</strong> crossing averages{' '}
            <strong>{money(priciest.avg)}</strong> — the priciest way you pay a toll.
          </div>
        </div>
      </div>

      <style>{`
        .infra-list { display: flex; flex-direction: column; gap: 2px; margin-top: 6px; }
        .infra-row {
          display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 12px;
          padding: 12px 4px; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ir-type { font-weight: 600; font-size: 14px; }
        .ir-count { color: var(--text-faint); font-size: 13px; font-variant-numeric: tabular-nums; }
        .ir-avg { font-weight: 800; font-size: 18px; font-variant-numeric: tabular-nums; width: 62px; text-align: right; }
        .infra-note { color: var(--text-faint); font-size: 13px; margin-top: 16px; }
        .infra-note strong { color: var(--text); }
      `}</style>
    </Section>
  );
}
