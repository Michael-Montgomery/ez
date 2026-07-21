import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReveal } from '../hooks/useReveal.js';
import { useData } from '../data/DataContext.jsx';
import Hero from './Hero.jsx';
import MapSection from './MapSection.jsx';
import Trips from './Trips.jsx';
import FlowDiagram from './FlowDiagram.jsx';
import CostAnalysis from './CostAnalysis.jsx';
import Infrastructure from './Infrastructure.jsx';
import CostProjection from './CostProjection.jsx';
import Timeline from './Timeline.jsx';
import BillingLag from './BillingLag.jsx';
import SpeedSection from './SpeedSection.jsx';
import Patterns from './Patterns.jsx';
import ActivityHeatmap from './ActivityHeatmap.jsx';
import RepeatRoutes from './RepeatRoutes.jsx';
import Records from './Records.jsx';
import TransactionsTable from './TransactionsTable.jsx';

gsap.registerPlugin(ScrollTrigger);

const nav = [
  ['map', 'Map'],
  ['trips', 'Trips'],
  ['flow', 'Flow'],
  ['cost', 'Cost'],
  ['timeline', 'Timeline'],
  ['speed', 'Speed'],
  ['rhythm', 'Rhythm'],
  ['records', 'Records'],
  ['ledger', 'Ledger'],
];

export default function Dashboard({ fileName, isSample, onLoadFile }) {
  const { firstTrip, lastTrip } = useData();
  const root = useRef(null);
  const progressRef = useRef(null);
  const fileInput = useRef(null);
  const [uploadError, setUploadError] = useState('');
  useReveal(root);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    return () => st.kill();
  }, []);

  // Graceful degradation: GSAP tweens need a running requestAnimationFrame. If
  // frames aren't actually being produced (background/unpainted tab) or the
  // user prefers reduced motion, snap every animated element to its final
  // visible state so nothing stays hidden. We count several frames rather than
  // trust a single one — a lone frame can fire and then the ticker stalls.
  useEffect(() => {
    let frames = 0;
    let rafId = requestAnimationFrame(function tick() {
      frames += 1;
      if (frames < 6) rafId = requestAnimationFrame(tick);
    });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => {
      if (frames >= 4 && !reduce) return; // ticker is healthy — let it animate
      gsap.set(
        '.reveal, [data-stagger], .hero-eyebrow, .hero-line, .hero-sub, .hero-stat, .hero-scroll',
        { opacity: 1, clearProps: 'transform' }
      );
      gsap.set('.route-line', { strokeDashoffset: 0 });
      gsap.set('.plaza-node', { opacity: 1, scale: 1, clearProps: 'transform' });
      document.dispatchEvent(new Event('force-final'));
    }, 500);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onLoadFile(String(reader.result), file.name);
        setUploadError('');
      } catch (err) {
        setUploadError(err.message || 'Could not read that file.');
      }
    };
    reader.onerror = () => setUploadError('Could not read that file.');
    reader.readAsText(file);
  };

  return (
    <>
      <div className="bg-orbs">
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
      </div>

      <div className="progress-bar" ref={progressRef} />

      <input
        ref={fileInput}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      <nav className="topnav">
        <div className="topnav-inner">
          <span className="brand">
            <span className="brand-mark">E-Z</span>Insights
          </span>
          <div className="navlinks">
            {nav.map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="nav-right">
            <span className="file-chip" title={isSample ? 'Sample dataset' : fileName}>
              {isSample ? 'Sample data' : fileName}
            </span>
            <button className="upload-btn" onClick={() => fileInput.current?.click()}>
              ↑ New CSV
            </button>
          </div>
        </div>
      </nav>

      {uploadError && (
        <div className="upload-toast" role="alert">
          {uploadError}
          <button onClick={() => setUploadError('')}>✕</button>
        </div>
      )}

      <div className="app" ref={root}>
        <Hero />
        <MapSection />
        <Trips />
        <FlowDiagram />
        <CostAnalysis />
        <Infrastructure />
        <CostProjection />
        <Timeline />
        <BillingLag />
        <SpeedSection />
        <Patterns />
        <ActivityHeatmap />
        <RepeatRoutes />
        <Records />
        <TransactionsTable />

        <footer className="footer reveal">
          <div className="footer-line" />
          <p>
            {isSample ? 'Sample E-ZPass export' : 'Your E-ZPass export'} covering{' '}
            {firstTrip.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} –{' '}
            {lastTrip.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
            Distances and speeds are straight-line estimates between toll points and are
            illustrative, not exact odometer readings. All processing happens in your browser —
            nothing is uploaded to a server.
          </p>
        </footer>
      </div>

      <style>{`
        .progress-bar {
          position: fixed;
          top: 0; left: 0;
          height: 3px;
          width: 100%;
          background: linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3));
          transform: scaleX(0);
          transform-origin: left;
          z-index: 50;
        }
        .topnav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 40;
          backdrop-filter: blur(14px);
          background: rgba(10,14,26,0.55);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .topnav-inner {
          max-width: var(--maxw);
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .brand { font-weight: 800; letter-spacing: -0.01em; font-size: 16px; white-space: nowrap; }
        .brand-mark {
          background: linear-gradient(100deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .navlinks { display: flex; gap: 4px; }
        .navlinks button {
          background: none; border: none; color: var(--text-dim);
          font-family: inherit; font-size: 13.5px; cursor: pointer;
          padding: 6px 12px; border-radius: 8px; transition: all 0.18s;
        }
        .navlinks button:hover { color: var(--text); background: rgba(255,255,255,0.06); }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .file-chip {
          color: var(--text-faint); font-size: 12.5px; max-width: 160px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .upload-btn {
          background: rgba(79,209,197,0.12);
          border: 1px solid rgba(79,209,197,0.35);
          color: var(--accent);
          font-family: inherit; font-size: 13px; font-weight: 600;
          padding: 7px 14px; border-radius: 999px; cursor: pointer;
          white-space: nowrap; transition: all 0.18s;
        }
        .upload-btn:hover { background: rgba(79,209,197,0.22); }
        .upload-toast {
          position: fixed; top: 64px; left: 50%; transform: translateX(-50%);
          z-index: 60; background: rgba(245,101,101,0.14);
          border: 1px solid rgba(245,101,101,0.4); color: #ffb4b4;
          padding: 10px 16px; border-radius: 12px; font-size: 13.5px;
          display: flex; align-items: center; gap: 14px; max-width: 90vw;
          box-shadow: 0 18px 40px rgba(0,0,0,0.5);
        }
        .upload-toast button {
          background: none; border: none; color: #ffb4b4; cursor: pointer; font-size: 13px;
        }
        @media (max-width: 760px) { .navlinks { display: none; } }
        @media (max-width: 440px) { .file-chip { display: none; } }
        .footer { margin-top: 100px; }
        .footer-line { height: 1px; background: var(--panel-border); margin-bottom: 24px; }
        .footer p { color: var(--text-faint); font-size: 13px; max-width: 640px; }
      `}</style>
    </>
  );
}
