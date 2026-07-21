import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartTooltip } from './tooltip.jsx';
import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';

export default function BillingLag() {
  const { billingLag } = useData();
  const { buckets, avgAway, avgInNetwork, maxLag, awayCount, inNetworkCount } = billingLag;
  const maxBucket = Math.max(...buckets.map((b) => b.count));

  return (
    <Section
      id="lag"
      eyebrow="Behind the balance"
      title="How long tolls take to bill"
      sub="The gap between when you actually drove and when the charge posted to your account. Out-of-network “E-ZPass Away” tolls from other states settle far slower than tolls from your home agency."
    >
      <div className="grid cols-2 reveal" data-stagger-parent>
        <div className="chart-card panel" data-stagger>
          <h3>Posting delay distribution</h3>
          <div className="caption">Number of tolls by how long they took to appear</div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={buckets} margin={{ left: -18, right: 8 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#5c6688', fontSize: 10.5 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#5c6688', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltip formatter={(v) => `${v} tolls`} />}
                />
                <Bar dataKey="count" name="Tolls" radius={[4, 4, 0, 0]}>
                  {buckets.map((b, i) => (
                    <Cell key={i} fill={b.count === maxBucket ? '#f2b544' : 'rgba(99,179,237,0.75)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card panel" data-stagger>
          <h3>In-network vs. away</h3>
          <div className="caption">Average days from driving to billing</div>
          <div className="lag-compare">
            <LagBar
              label="Home agency"
              sub={`${inNetworkCount} tolls`}
              days={avgInNetwork}
              max={Math.max(avgAway, avgInNetwork)}
              color="#4fd1c5"
            />
            <LagBar
              label="E-ZPass Away"
              sub={`${awayCount} tolls`}
              days={avgAway}
              max={Math.max(avgAway, avgInNetwork)}
              color="#f2b544"
            />
          </div>
          <div className="lag-note">
            Slowest single toll took <strong>{maxLag.toFixed(0)} days</strong> to post — nearly three
            weeks after the drive.
          </div>
        </div>
      </div>

      <style>{`
        .lag-compare { display: flex; flex-direction: column; gap: 20px; margin: 20px 0 8px; }
        .lag-row-label { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .lag-row-label .l { font-weight: 600; font-size: 14px; }
        .lag-row-label .l small { color: var(--text-faint); font-weight: 400; margin-left: 8px; }
        .lag-row-label .v { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }
        .lag-track { height: 12px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .lag-fill { height: 100%; border-radius: 999px; transition: width 0.4s; }
        .lag-note { color: var(--text-faint); font-size: 13px; margin-top: 18px; }
        .lag-note strong { color: var(--gold); }
      `}</style>
    </Section>
  );
}

function LagBar({ label, sub, days, max, color }) {
  const pct = max > 0 ? (days / max) * 100 : 0;
  return (
    <div>
      <div className="lag-row-label">
        <span className="l">
          {label} <small>{sub}</small>
        </span>
        <span className="v" style={{ color }}>
          {days.toFixed(1)}d
        </span>
      </div>
      <div className="lag-track">
        <div className="lag-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
