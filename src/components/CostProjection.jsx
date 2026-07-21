import Section from './Section.jsx';
import CountUp from './CountUp.jsx';
import { useData } from '../data/DataContext.jsx';

export default function CostProjection() {
  const { projection, daysCovered } = useData();
  const { perDay, perMonth, perYear, currentBalance, runwayDays } = projection;

  return (
    <Section
      id="projection"
      eyebrow="Looking ahead"
      title="Your toll run-rate"
      sub={`Based on ${daysCovered} days of history, here's what your driving costs if this pace holds — and how long your prepaid balance will last before the next top-up.`}
    >
      <div className="grid cols-3 reveal" data-stagger-parent>
        <Rate data-stagger label="Per day" value={perDay} />
        <Rate data-stagger label="Per month" value={perMonth} big />
        <Rate data-stagger label="Per year" value={perYear} />
      </div>

      {currentBalance != null && runwayDays != null && (
        <div className="chart-card panel reveal runway" style={{ marginTop: 20 }}>
          <div className="runway-head">
            <div>
              <h3>Balance runway</h3>
              <div className="caption">
                ${currentBalance.toFixed(2)} left, burning ${perDay.toFixed(2)}/day
              </div>
            </div>
            <div className="runway-days">
              <span className="rd-num">
                <CountUp value={Math.round(runwayDays)} />
              </span>
              <span className="rd-label">days left</span>
            </div>
          </div>
          <div className="runway-track">
            <div
              className="runway-fill"
              style={{ width: `${Math.min(100, (runwayDays / 90) * 100)}%` }}
            />
            {[30, 60, 90].map((d) => (
              <span key={d} className="runway-tick" style={{ left: `${(d / 90) * 100}%` }}>
                <span>{d}d</span>
              </span>
            ))}
          </div>
          <div className="caption" style={{ marginTop: 14 }}>
            At this rate you'd next need to reload around{' '}
            <strong style={{ color: 'var(--text)' }}>
              {new Date(Date.now() + runwayDays * 86400000).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
            </strong>
            . (Projection only — actual timing depends on where and how often you drive next.)
          </div>
        </div>
      )}

      <style>{`
        .runway-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .runway-days { text-align: right; }
        .rd-num { font-size: 40px; font-weight: 850; color: var(--accent); font-variant-numeric: tabular-nums; }
        .rd-label { display: block; font-size: 12px; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.08em; }
        .runway-track {
          position: relative; height: 14px; border-radius: 999px; margin-top: 22px;
          background: rgba(255,255,255,0.06);
        }
        .runway-fill {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
        }
        .runway-tick { position: absolute; top: 18px; transform: translateX(-50%); font-size: 10px; color: var(--text-faint); }
        .runway-tick::before {
          content: ''; position: absolute; top: -22px; left: 50%; width: 1px; height: 14px;
          background: rgba(255,255,255,0.15);
        }
      `}</style>
    </Section>
  );
}

function Rate({ label, value, big }) {
  return (
    <div className="chart-card panel" data-stagger style={{ padding: 24 }}>
      <div style={{ color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: big ? 46 : 34,
          fontWeight: 850,
          marginTop: 8,
          color: big ? 'var(--accent)' : 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <CountUp value={value} decimals={2} prefix="$" />
      </div>
    </div>
  );
}
