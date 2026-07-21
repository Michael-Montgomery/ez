import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartTooltip } from './tooltip.jsx';
import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';

export default function Patterns() {
  const { hourHistogram, busiestHour, costPerMile } = useData();
  const maxCount = Math.max(...hourHistogram.map((h) => h.count));

  return (
    <Section
      id="patterns"
      eyebrow="Habits & efficiency"
      title="When you drive & what it costs per mile"
      sub="The clock shows when your tolls cluster through the day. The efficiency chart ranks point-to-point trips by dollars paid per straight-line mile."
    >
      <div className="grid cols-2 reveal" data-stagger-parent>
        <div className="chart-card panel" data-stagger>
          <h3>Toll activity by hour</h3>
          <div className="caption">
            Busiest around {busiestHour.label.replace('a', ' AM').replace('p', ' PM')} · {busiestHour.count} passes
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={hourHistogram} margin={{ left: -18, right: 8 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#5c6688', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={1}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#5c6688', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltip formatter={(v) => `${v} passes`} />}
                />
                <Bar dataKey="count" name="Passes" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {hourHistogram.map((h) => (
                    <Cell
                      key={h.hour}
                      fill={h.count === maxCount ? '#f2b544' : 'rgba(79,209,197,0.75)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card panel" data-stagger>
          <h3>Cost per mile</h3>
          <div className="caption">Dollars paid per mile on trips where both ends are recorded</div>
          {costPerMile.length === 0 ? (
            <div
              style={{
                height: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'var(--text-faint)',
                fontSize: 13,
                padding: '0 20px',
              }}
            >
              No point-to-point trips in this file — cost per mile needs both an entry and an exit
              plaza on the same charge.
            </div>
          ) : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={costPerMile} layout="vertical" margin={{ left: 8, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={150}
                  tick={{ fill: '#9aa4c4', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltip formatter={(v) => `$${v.toFixed(2)}/mi`} />}
                />
                <Bar dataKey="perMile" name="Per mile" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={false}>
                  {costPerMile.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      </div>
    </Section>
  );
}
