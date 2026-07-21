import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import { ChartTooltip } from './tooltip.jsx';
import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';

const money = (v) => `$${Number(v).toFixed(2)}`;
const shortDate = (iso) => {
  const [y, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}`;
};

export default function Timeline() {
  const { dailySpend, balanceSeries, totalTollSpend, hasBalance } = useData();
  return (
    <Section
      id="timeline"
      eyebrow="Over time"
      title="Spending & balance"
      sub="How toll charges accumulated across your driving days, and how your prepaid balance rose and fell with each top-up."
    >
      <div className="chart-card panel reveal">
        <h3>Cumulative toll spend</h3>
        <div className="caption">Running total by travel date — reached {money(totalTollSpend)}</div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={dailySpend} margin={{ left: -8, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4fd1c5" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#4fd1c5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tick={{ fill: '#5c6688', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fill: '#5c6688', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip
                content={<ChartTooltip formatter={money} labelFormatter={shortDate} />}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                name="Cumulative"
                stroke="#4fd1c5"
                strokeWidth={2.5}
                fill="url(#fillSpend)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="spend"
                name="That day"
                stroke="#63b3ed"
                strokeWidth={1.5}
                fillOpacity={0}
                strokeDasharray="4 3"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {hasBalance && (
      <div className="chart-card panel reveal" style={{ marginTop: 20 }}>
        <h3>Prepaid account balance</h3>
        <div className="caption">By posting date — dots mark credit-card top-ups</div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={balanceSeries} margin={{ left: -8, right: 12, top: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tick={{ fill: '#5c6688', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fill: '#5c6688', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip content={<ChartTooltip formatter={money} labelFormatter={shortDate} />} />
              <Line
                type="stepAfter"
                dataKey="balance"
                name="Balance"
                stroke="#9f7aea"
                strokeWidth={2.5}
                isAnimationActive={false}
                dot={(props) => {
                  const { cx, cy, payload, index } = props;
                  if (!payload.isPayment) return <g key={index} />;
                  return <circle key={index} cx={cx} cy={cy} r={5} fill="#f2b544" stroke="#0a0e1a" strokeWidth={2} />;
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}
    </Section>
  );
}
