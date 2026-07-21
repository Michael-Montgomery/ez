import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Fades + lifts any element with the `.reveal` class into view on scroll.
// Children with `data-stagger` inside a `.reveal` container animate in sequence.
//
// Robustness: the GSAP reveal needs a running requestAnimationFrame. An
// IntersectionObserver (which does not depend on the ticker) watches each
// element and, shortly after it scrolls into view, force-reveals it via the
// DOM if GSAP hasn't — so content can never stay stuck at opacity 0.
export function useReveal(ref) {
  useEffect(() => {
    const root = ref?.current || document;

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach((el) => {
        const staggerKids = el.querySelectorAll('[data-stagger]');
        if (staggerKids.length) {
          gsap.set(el, { opacity: 1 });
          gsap.from(staggerKids, {
            opacity: 0,
            y: 28,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 82%' },
          });
        } else {
          gsap.fromTo(
            el,
            { opacity: 0, y: 34 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%' },
            }
          );
        }
      });
      ScrollTrigger.refresh();
    }, root);

    // RAF-independent safety net.
    const forceReveal = (el) => {
      const kids = el.querySelectorAll('[data-stagger]');
      const targets = kids.length ? kids : [el];
      targets.forEach((t) => {
        t.style.setProperty('opacity', '1', 'important');
        t.style.setProperty('transform', 'none', 'important');
      });
    };
    const rootEl = ref?.current || document.body;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          observer.unobserve(el);
          // Give GSAP time to play on a healthy browser; only step in if it
          // never actually rendered the reveal.
          setTimeout(() => {
            const probe = el.querySelector('[data-stagger]') || el;
            if (Number(getComputedStyle(probe).opacity) < 0.99) forceReveal(el);
          }, 900);
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px' }
    );
    rootEl.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, [ref]);
}
