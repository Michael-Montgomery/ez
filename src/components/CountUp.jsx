import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Animates a number from 0 to `value` when scrolled into view.
function format(n, decimals, prefix, suffix) {
  return (
    prefix +
    n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix
  );
}

export default function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 1.6 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const obj = { n: 0 };
    const tween = gsap.to(obj, {
      n: value,
      duration,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate() {
        el.textContent = format(obj.n, decimals, prefix, suffix);
      },
    });
    // Degradation path: snap to the final value if animations are forced to end.
    const setFinal = () => {
      tween.kill();
      el.textContent = format(value, decimals, prefix, suffix);
    };
    document.addEventListener('force-final', setFinal);
    return () => {
      document.removeEventListener('force-final', setFinal);
      tween.scrollTrigger?.kill();
    };
  }, [value, decimals, prefix, suffix, duration]);

  // Render the final value as the base text so it's correct even if the
  // count-up animation never runs (JS disabled, reduced motion, background tab).
  return <span ref={ref}>{format(value, decimals, prefix, suffix)}</span>;
}
