import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';
import { labelFor } from '../data/process.js';

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Records() {
  const { superlatives, minPaidToll, maxToll } = useData();
  const s = superlatives;

  const cards = [
    { icon: '💸', big: `$${s.mostExpensiveDay.spend.toFixed(2)}`, label: 'Priciest day', note: fmtDate(s.mostExpensiveDay.date), accent: '#f56565' },
    { icon: '🚦', big: `${s.busiestDay.count}`, label: 'Most tolls in a day', note: fmtDate(s.busiestDay.date), accent: '#f2b544' },
    { icon: '🔥', big: `${s.longestStreak}`, label: 'Longest driving streak', note: `consecutive day${s.longestStreak === 1 ? '' : 's'}`, accent: '#4fd1c5' },
    { icon: '🅿️', big: `${s.longestGap}`, label: 'Longest break', note: `day${s.longestGap === 1 ? '' : 's'} off the road`, accent: '#63b3ed' },
    { icon: '📅', big: `${s.drivingDays}`, label: 'Days driven', note: 'with at least one toll', accent: '#9f7aea' },
    { icon: '⬆️', big: `$${maxToll.amount.toFixed(2)}`, label: 'Priciest single toll', note: labelFor(maxToll.exitPlaza || maxToll.entryPlaza), accent: '#f56565' },
    minPaidToll && { icon: '⬇️', big: `$${minPaidToll.amount.toFixed(2)}`, label: 'Cheapest toll', note: labelFor(minPaidToll.exitPlaza || minPaidToll.entryPlaza), accent: '#68d391' },
    s.longestTrip && s.longestTrip.miles > 1 && {
      icon: '🛣️', big: `${s.longestTrip.miles.toFixed(0)} mi`, label: 'Longest single trip', note: `${s.longestTrip.startLabel} → ${s.longestTrip.endLabel}`, accent: '#63b3ed',
    },
  ].filter(Boolean);

  return (
    <Section
      id="records"
      eyebrow="By the numbers"
      title="Records & superlatives"
      sub="The extremes hiding in your toll history — your biggest days, longest streaks, and the priciest and cheapest ways you paid."
    >
      <div className="grid cols-4 reveal records-grid" data-stagger-parent>
        {cards.map((c, i) => (
          <div className="rec-card" key={i} data-stagger>
            <div className="rec-icon" style={{ background: `${c.accent}22`, color: c.accent }}>
              {c.icon}
            </div>
            <div className="rec-big" style={{ color: c.accent }}>{c.big}</div>
            <div className="rec-label">{c.label}</div>
            <div className="rec-note">{c.note}</div>
          </div>
        ))}
      </div>

      <style>{`
        .records-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 900px) { .records-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .records-grid { grid-template-columns: 1fr; } }
        .rec-card {
          background: var(--panel); border: 1px solid var(--panel-border);
          border-radius: 16px; padding: 22px;
        }
        .rec-icon {
          width: 40px; height: 40px; border-radius: 11px; display: flex;
          align-items: center; justify-content: center; font-size: 19px; margin-bottom: 14px;
        }
        .rec-big { font-size: 30px; font-weight: 850; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
        .rec-label { font-size: 13.5px; font-weight: 600; margin-top: 4px; }
        .rec-note { font-size: 12px; color: var(--text-faint); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>
    </Section>
  );
}
