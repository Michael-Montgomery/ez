import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell as BarCell,
} from 'recharts';
import { ChartTooltip } from './tooltip.jsx';
import Section from './Section.jsx';
import { labelFor, AGENCY_INFO } from '../data/process.js';
import { useData } from '../data/DataContext.jsx';

const money = (v) => `$${Number(v).toFixed(2)}`;

export default function CostAnalysis() {
  const { byAgency, byPlaza, totalTollSpend, avgToll, maxToll } = useData();
  const topPlazas = byPlaza.slice(0, 8).map((p) => ({ ...p, name: p.label }));

  return (
    <Section
      id="cost"
      eyebrow="Where the money goes"
      title="Cost analysis"
      sub="Toll spending broken down by the authority collecting it and the individual plazas you pass through most."
    >
      <div className="grid cols-2 reveal" data-stagger-parent>
        <div className="chart-card panel" data-stagger>
          <h3>Spend by agency</h3>
          <div className="caption">Share of ${totalTollSpend.toFixed(2)} in total tolls</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ width: 220, height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={byAgency}
                    dataKey="spend"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={100}
                    paddingAngle={2}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {byAgency.map((a) => (
                      <Cell key={a.agency} fill={a.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip formatter={money} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              {byAgency.map((a) => (
                <div key={a.agency} className="legend-row">
                  <span className="dot" style={{ background: a.color }} />
                  <span className="lr-name">{a.name}</span>
                  <span className="lr-val">{money(a.spend)}</span>
                  <span className="lr-pct">{((a.spend / totalTollSpend) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card panel" data-stagger>
          <h3>Most-used toll points</h3>
          <div className="caption">Number of passes through each plaza</div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={topPlazas} layout="vertical" margin={{ left: 8, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fill: '#9aa4c4', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltip formatter={(v) => `${v} passes`} />}
                />
                <Bar dataKey="count" name="Passes" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={false}>
                  {topPlazas.map((p) => (
                    <BarCell key={p.plaza} fill={AGENCY_INFO[p.agency]?.color || '#4fd1c5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid cols-3 reveal" style={{ marginTop: 20 }} data-stagger-parent>
        <MiniStat data-stagger label="Average toll" value={money(avgToll)} note="per transaction" />
        <MiniStat
          data-stagger
          label="Priciest single toll"
          value={money(maxToll.amount)}
          note={labelFor(maxToll.exitPlaza || maxToll.entryPlaza)}
          color={AGENCY_INFO[maxToll.agency]?.color}
        />
        <MiniStat
          data-stagger
          label="Agencies billed"
          value={byAgency.length}
          note={byAgency.map((a) => a.name).join(' · ')}
        />
      </div>

      <style>{`
        .legend-row {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          align-items: center;
          gap: 10px;
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 13px;
        }
        .lr-name { color: var(--text-dim); }
        .lr-val { font-weight: 700; font-variant-numeric: tabular-nums; }
        .lr-pct { color: var(--text-faint); width: 34px; text-align: right; }
      `}</style>
    </Section>
  );
}

function MiniStat({ label, value, note, color }) {
  return (
    <div className="chart-card panel" data-stagger style={{ padding: 22 }}>
      <div style={{ color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          margin: '8px 0 4px',
          color: color || 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{note}</div>
    </div>
  );
}
