// Guarantees an intro GSAP timeline always ends in its final (visible) state,
// even if requestAnimationFrame stalls (background/unpainted tab) so the tween
// engine never actually paints the final values — otherwise `gsap.from`
// strands elements at opacity 0 ("flash then disappear"). Also honors
// reduced-motion.
//
// Notes learned the hard way:
//  - tl.progress() reports completion from elapsed wall-clock time, NOT from
//    what was rendered, so it can say "1" while the DOM is still frozen at the
//    hidden "from" state. We therefore inspect the real computed opacity.
//  - A stalled timeline re-applies its inline styles on any stray frame, and
//    gsap.set() is lazily rendered, so we reveal by writing !important inline
//    styles (which beat both) after killing the timeline.
//
// Returns a cleanup function to call from the effect's teardown.
export function guardIntro(tl) {
  const getTargets = () => {
    const set = new Set();
    tl.getChildren(true, true, false).forEach((child) => {
      if (typeof child.targets === 'function') child.targets().forEach((t) => set.add(t));
    });
    return [...set];
  };

  const forceReveal = (targets) => {
    tl.kill(); // stop the timeline from re-applying the hidden "from" state
    targets.forEach((el) => {
      if (!el || !el.style) return;
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'none', 'important');
      ['translate', 'rotate', 'scale'].forEach((p) => el.style.removeProperty(p));
    });
  };

  const stillHidden = (targets) =>
    targets.some((el) => el && Number(getComputedStyle(el).opacity) < 0.99);

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    forceReveal(getTargets());
    return () => {};
  }

  // Shortly after the timeline should have finished, check what was actually
  // painted. If anything is still hidden, the ticker never rendered it — force
  // the final visible state. On a healthy browser everything is already
  // visible, so this is a no-op.
  const ms = Math.max(tl.totalDuration() * 1000, 1400) + 500;
  const timer = setTimeout(() => {
    const targets = getTargets();
    if (stillHidden(targets)) forceReveal(targets);
  }, ms);

  return () => clearTimeout(timer);
}
