import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { guardIntro } from '../hooks/introGuard.js';

export default function UploadScreen({ onLoadText, onUseSample }) {
  const root = useRef(null);
  const fileInput = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cleanupGuard = () => {};
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.up-eyebrow', { opacity: 0, y: 16, duration: 0.6 })
        .from('.up-title', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
        .from('.up-sub', { opacity: 0, y: 20, duration: 0.7 }, '-=0.45')
        .from('.up-drop', { opacity: 0, y: 26, scale: 0.98, duration: 0.7 }, '-=0.35')
        .from('.up-foot > *', { opacity: 0, y: 14, duration: 0.5, stagger: 0.08 }, '-=0.3');
      cleanupGuard = guardIntro(tl);
    }, root);

    return () => {
      cleanupGuard();
      ctx.revert();
    };
  }, []);

  const readFile = (file) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type && !file.type.includes('csv') && file.type !== 'text/plain') {
      setError('Please choose a .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onLoadText(String(reader.result), file.name);
      } catch (err) {
        setError(err.message || 'Could not read that file.');
      }
    };
    reader.onerror = () => setError('Could not read that file.');
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setError('');
    readFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div ref={root} className="up-wrap">
      <div className="bg-orbs">
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
      </div>

      <div className="up-inner">
        <div className="up-eyebrow">E-Z Insights</div>
        <h1 className="up-title">
          Turn your <span className="grad">toll history</span> into a story.
        </h1>
        <p className="up-sub">
          Upload your E-ZPass transaction CSV and get an interactive breakdown of where you drove,
          how fast, and what it cost. Everything runs locally in your browser — your data never
          leaves your device.
        </p>

        <div
          className={`up-drop ${dragging ? 'drag' : ''}`}
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput.current?.click()}
        >
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              setError('');
              readFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <div className="up-icon">↑</div>
          <div className="up-drop-title">Drop your CSV here or click to browse</div>
          <div className="up-drop-hint">Exported from your E-ZPass account dashboard</div>
        </div>

        {error && <div className="up-error">{error}</div>}

        <div className="up-foot">
          <button className="up-sample" onClick={onUseSample}>
            Explore with sample data →
          </button>
          <span className="up-note">No account, no upload, no tracking.</span>
        </div>
      </div>

      <style>{`
        .up-wrap {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        .up-inner { position: relative; z-index: 1; max-width: 620px; width: 100%; text-align: center; }
        .up-eyebrow {
          color: var(--accent); font-size: 13px; letter-spacing: 0.24em;
          text-transform: uppercase; font-weight: 700; margin-bottom: 22px;
        }
        .up-title {
          font-size: clamp(34px, 6vw, 58px); font-weight: 850;
          line-height: 1.02; letter-spacing: -0.03em;
        }
        .grad {
          background: linear-gradient(100deg, var(--accent), var(--accent-2) 55%, var(--accent-3));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .up-sub {
          color: var(--text-dim); font-size: 16.5px; margin: 22px auto 34px; max-width: 520px;
        }
        .up-drop {
          border: 1.5px dashed rgba(255,255,255,0.18);
          border-radius: 20px; padding: 48px 32px; cursor: pointer;
          background: rgba(255,255,255,0.03); transition: all 0.2s;
        }
        .up-drop:hover, .up-drop.drag {
          border-color: var(--accent); background: rgba(79,209,197,0.07);
          transform: translateY(-2px);
        }
        .up-icon {
          width: 54px; height: 54px; margin: 0 auto 16px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-size: 24px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #04201d; font-weight: 800;
        }
        .up-drop-title { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
        .up-drop-hint { color: var(--text-faint); font-size: 13px; }
        .up-error {
          margin-top: 18px; color: #ffb4b4; font-size: 14px;
          background: rgba(245,101,101,0.12); border: 1px solid rgba(245,101,101,0.35);
          padding: 12px 16px; border-radius: 12px;
        }
        .up-foot {
          margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .up-sample {
          background: none; border: none; color: var(--accent-2); cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 600; padding: 6px 10px;
          border-radius: 8px; transition: all 0.18s;
        }
        .up-sample:hover { color: var(--accent); }
        .up-note { color: var(--text-faint); font-size: 12.5px; }
      `}</style>
    </div>
  );
}
