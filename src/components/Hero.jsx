import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import CountUp from './CountUp.jsx';
import { useData } from '../data/DataContext.jsx';
import { guardIntro } from '../hooks/introGuard.js';

const fmtDate = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Hero() {
  const { totalTollSpend, tollCount, byAgency, firstTrip, lastTrip, totalMiles } = useData();
  const root = useRef(null);

  useEffect(() => {
    let cleanupGuard = () => {};
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.7 })
        .from('.hero-line', { opacity: 0, y: 44, duration: 0.9, stagger: 0.12 }, '-=0.3')
        .from('.hero-sub', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
        .from('.hero-stat', { opacity: 0, y: 30, duration: 0.7, stagger: 0.1 }, '-=0.35')
        .from('.hero-scroll', { opacity: 0, duration: 0.6 }, '-=0.2');
      cleanupGuard = guardIntro(tl);

      gsap.to('.hero-scroll .arrow', {
        y: 8,
        repeat: -1,
        yoyo: true,
        duration: 0.9,
        ease: 'sine.inOut',
      });
    }, root);
    return () => {
      cleanupGuard();
      ctx.revert();
    };
  }, []);

  return (
    <header ref={root} className="hero">
      <div className="hero-eyebrow">
        E-ZPass Account Insights · {fmtDate(firstTrip)} – {fmtDate(lastTrip)}
      </div>
      <h1 className="hero-title">
        <span className="hero-line">Every toll,</span>{' '}
        <span className="hero-line grad">every mile,</span>{' '}
        <span className="hero-line">every road.</span>
      </h1>
      <p className="hero-sub">
        A visual tour through your toll history across {byAgency.length} agencies and the
        Northeast corridor — where you drove, how fast, and what it cost.
      </p>

      <div className="hero-stats">
        <div className="hero-stat">
          <span className="hs-value">
            <CountUp value={totalTollSpend} decimals={2} prefix="$" />
          </span>
          <span className="hs-label">spent on tolls</span>
        </div>
        <div className="hero-stat">
          <span className="hs-value">
            <CountUp value={tollCount} />
          </span>
          <span className="hs-label">toll transactions</span>
        </div>
        <div className="hero-stat">
          <span className="hs-value">
            <CountUp value={totalMiles} suffix=" mi" />
          </span>
          <span className="hs-label">est. tolled miles</span>
        </div>
        <div className="hero-stat">
          <span className="hs-value">
            <CountUp value={byAgency.length} />
          </span>
          <span className="hs-label">toll authorities</span>
        </div>
      </div>

      <div className="hero-scroll">
        <span>Scroll to explore</span>
        <span className="arrow">↓</span>
      </div>

      <style>{`
        .hero {
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 0 40px;
        }
        .hero-eyebrow {
          color: var(--accent);
          font-size: 13px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 22px;
        }
        .hero-title {
          font-size: clamp(44px, 8.5vw, 104px);
          font-weight: 850;
          line-height: 0.98;
          letter-spacing: -0.035em;
        }
        .hero-line { display: inline-block; }
        .grad {
          background: linear-gradient(100deg, var(--accent), var(--accent-2) 55%, var(--accent-3));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          margin-top: 28px;
          max-width: 560px;
          font-size: 19px;
          color: var(--text-dim);
        }
        .hero-stats {
          margin-top: 56px;
          display: flex;
          flex-wrap: wrap;
          gap: 46px;
        }
        .hero-stat { display: flex; flex-direction: column; gap: 6px; }
        .hs-value {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .hs-label {
          color: var(--text-faint);
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .hero-scroll {
          margin-top: 70px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-faint);
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .hero-scroll .arrow { font-size: 18px; }
      `}</style>
    </header>
  );
}
