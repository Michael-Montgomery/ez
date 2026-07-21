import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartTooltip } from './tooltip.jsx';
import Section from './Section.jsx';
import { useData } from '../data/DataContext.jsx';

gsap.registerPlugin(ScrollTrigger);

const GAUGE_MAX = 80;

export default function SpeedSection() {
  const { speedSamples, avgSpeed, totalMiles, explicitSegments } = useData();
  const gaugeRef = useRef(null);
  const needleRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const frac = Math.min(avgSpeed / GAUGE_MAX, 1);
    // Fallback: snap the gauge to its final reading using direct DOM writes,
    // which don't depend on the GSAP ticker (gsap.set is lazily rendered).
    const setFinal = () => {
      const arc = gaugeRef.current;
      if (!arc) return;
      const len = arc.getTotalLength();
      arc.style.strokeDasharray = String(len);
      arc.style.strokeDashoffset = String(len * (1 - frac));
      if (needleRef.current) {
        needleRef.current.style.transformOrigin = '100px 100px';
        needleRef.current.style.transform = `rotate(${-90 + frac * 180}deg)`;
      }
      if (labelRef.current) labelRef.current.textContent = avgSpeed.toFixed(0);
    };
    document.addEventListener('force-final', setFinal);

    // RAF-independent safety net: if the gauge never animates in, snap it.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          setTimeout(() => {
            if (labelRef.current && labelRef.current.textContent === '0' && avgSpeed >= 1) {
              setFinal();
            }
          }, 1800);
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    if (gaugeRef.current) observer.observe(gaugeRef.current);

    const ctx = gsap.context(() => {
      const arc = gaugeRef.current;
      const len = arc.getTotalLength();
      gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(arc, {
        strokeDashoffset: len * (1 - frac),
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: arc, start: 'top 85%' },
      });
      // needle sweeps from -90deg to angle
      const angle = -90 + frac * 180;
      gsap.fromTo(
        needleRef.current,
        { rotate: -90, transformOrigin: '100px 100px' },
        {
          rotate: angle,
          transformOrigin: '100px 100px',
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: arc, start: 'top 85%' },
        }
      );
      const obj = { n: 0 };
      gsap.to(obj, {
        n: avgSpeed,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: arc, start: 'top 85%' },
        onUpdate() {
          if (labelRef.current) labelRef.current.textContent = obj.n.toFixed(0);
        },
      });
    }, gaugeRef);
    return () => {
      document.removeEventListener('force-final', setFinal);
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  const topSpeeds = speedSamples.slice(0, 6);

  return (
    <Section
      id="speed"
      eyebrow="On the move"
      title="Speed & distance"
      sub="Average driving speed estimated from the time and straight-line distance between consecutive toll points on the same trip. Real roads curve, so treat these as lower-bound estimates."
    >
      <div className="grid cols-2 reveal" data-stagger-parent>
        <div className="chart-card panel" data-stagger style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ alignSelf: 'flex-start' }}>Average pace</h3>
          <div className="caption" style={{ alignSelf: 'flex-start' }}>
            Across {speedSamples.length} measurable segments
          </div>
          <svg viewBox="0 0 200 130" style={{ width: '100%', maxWidth: 340 }}>
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              ref={gaugeRef}
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#speedGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="speedGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#63b3ed" />
                <stop offset="50%" stopColor="#4fd1c5" />
                <stop offset="100%" stopColor="#f2b544" />
              </linearGradient>
            </defs>
            <g ref={needleRef}>
              <line x1="100" y1="100" x2="100" y2="34" stroke="#eef2ff" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="100" cy="100" r="6" fill="#eef2ff" />
          </svg>
          <div style={{ textAlign: 'center', marginTop: -6 }}>
            <span ref={labelRef} style={{ fontSize: 46, fontWeight: 850, fontVariantNumeric: 'tabular-nums' }}>
              0
            </span>
            <span style={{ fontSize: 18, color: 'var(--text-dim)', marginLeft: 6 }}>mph avg</span>
          </div>
        </div>

        <div className="chart-card panel" data-stagger>
          <h3>Fastest measured legs</h3>
          <div className="caption">Straight-line mph between toll points</div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={topSpeeds} layout="vertical" margin={{ left: 8, right: 24 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={168}
                  tick={{ fill: '#9aa4c4', fontSize: 10.5 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltip formatter={(v) => `${v.toFixed(0)} mph`} />}
                />
                <Bar dataKey="mph" name="Speed" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={false}>
                  {topSpeeds.map((s, i) => (
                    <Cell key={i} fill={`hsl(${175 - (s.mph / 80) * 140}, 70%, 58%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid cols-3 reveal" style={{ marginTop: 20 }} data-stagger-parent>
        <Fact data-stagger big={`${totalMiles.toFixed(0)} mi`} label="Estimated tolled distance" note="Sum of same-trip corridor legs" />
        <Fact
          data-stagger
          big={`${explicitSegments.length}`}
          label="Point-to-point trips"
          note="Legs with both entry & exit recorded"
        />
        <Fact
          data-stagger
          big={speedSamples[0] ? `${speedSamples[0].mph.toFixed(0)} mph` : '—'}
          label="Top corridor pace"
          note={speedSamples[0]?.label || ''}
        />
      </div>
    </Section>
  );
}

function Fact({ big, label, note }) {
  return (
    <div className="chart-card panel" data-stagger style={{ padding: 22 }}>
      <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
        {big}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--text-faint)', fontSize: 12.5 }}>{note}</div>
    </div>
  );
}
