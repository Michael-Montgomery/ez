import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';
import { AGENCY_INFO } from '../data/process.js';

const fmtDay = (d) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const dur = (h) => (h < 1 ? `${Math.round(h * 60)} min` : `${h.toFixed(1)} h`);

export default function Trips() {
  const { trips } = useData();
  const journeys = trips.filter((t) => t.count > 1);

  return (
    <Section
      id="trips"
      eyebrow="Journeys"
      title="Reconstructed trips"
      sub={`Your tolls grouped into ${journeys.length} multi-stop journeys by clustering charges that happened close together in time. Single isolated tolls are omitted here.`}
    >
      <div className="reveal trips" data-stagger-parent>
        {journeys.map((t) => (
          <div className="trip" key={t.id} data-stagger>
            <div className="trip-date">
              <span className="td-day">{fmtDay(t.start)}</span>
              <span className="td-time">
                {fmtTime(t.start)} – {fmtTime(t.end)}
              </span>
            </div>
            <div className="trip-route">
              <div className="tr-endpoints">
                <span className="tr-from">{t.startLabel}</span>
                <span className="tr-arrow">→</span>
                <span className="tr-to">{t.endLabel}</span>
              </div>
              <div className="tr-agencies">
                {t.agencies.map((a) => (
                  <span key={a} className="pill">
                    <span className="dot" style={{ background: AGENCY_INFO[a]?.color || '#7f8bb0' }} />
                    {AGENCY_INFO[a]?.short || a}
                  </span>
                ))}
              </div>
            </div>
            <div className="trip-stats">
              <Stat value={`$${t.cost.toFixed(2)}`} label={`${t.count} tolls`} accent />
              {t.miles > 1 && <Stat value={`${t.miles.toFixed(0)} mi`} label={dur(t.durationH)} />}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .trips { display: flex; flex-direction: column; gap: 12px; }
        .trip {
          display: grid;
          grid-template-columns: 160px 1fr auto;
          gap: 20px;
          align-items: center;
          padding: 18px 22px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 14px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .trip:hover { border-color: rgba(255,255,255,0.16); transform: translateX(3px); }
        .trip-date { display: flex; flex-direction: column; gap: 3px; }
        .td-day { font-weight: 700; font-size: 14px; }
        .td-time { color: var(--text-faint); font-size: 12px; font-variant-numeric: tabular-nums; }
        .tr-endpoints { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 14.5px; font-weight: 600; margin-bottom: 8px; }
        .tr-arrow { color: var(--accent); }
        .tr-to { color: var(--text); }
        .tr-agencies { display: flex; gap: 6px; flex-wrap: wrap; }
        .trip-stats { display: flex; gap: 22px; }
        @media (max-width: 720px) {
          .trip { grid-template-columns: 1fr; gap: 12px; }
          .trip-stats { gap: 28px; }
        }
      `}</style>
    </Section>
  );
}

function Stat({ value, label, accent }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: accent ? 'var(--accent)' : 'var(--text)',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{label}</div>
    </div>
  );
}
