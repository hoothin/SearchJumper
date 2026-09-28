let highlightedTarget, highlightAnimation;

export default function locateResult(target) {
    highlightedTarget?.classList.remove('filter');
    highlightAnimation?.cancel();
    highlightedTarget = target;
    if (!target) return;
    target.classList.add('filter');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center', inline: 'nearest' });
    if (!reducedMotion) {
        highlightAnimation = target.animate([
            {boxShadow: '0 0 0 0 transparent'},
            {boxShadow: '0 0 18px 5px color-mix(in srgb, var(--sj-accent) 22%, transparent)'},
            {boxShadow: '0 0 0 0 transparent'}
        ], {duration: 900, iterations: 2, delay: 120, easing: 'ease-out'});
    }
}
