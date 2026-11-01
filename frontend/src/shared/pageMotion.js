export function diagonalWaveFrames(width, height, origin) {
  const length = Math.hypot(width - origin.x, height - origin.y) || 1;
  const nx = (width - origin.x) / length;
  const ny = (height - origin.y) / length;
  const corners = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ].map(([x, y]) => ({
    u: (x - origin.x) * nx + (y - origin.y) * ny,
    v: -(x - origin.x) * ny + (y - origin.y) * nx,
  }));
  const margin = 80;
  const minU = Math.min(...corners.map((point) => point.u)) - margin;
  const maxU = Math.max(...corners.map((point) => point.u)) + margin;
  const minV = Math.min(...corners.map((point) => point.v)) - margin;
  const maxV = Math.max(...corners.map((point) => point.v)) + margin;
  const point = (u, v) =>
    `${(origin.x + u * nx - v * ny).toFixed(2)}px ${(origin.y + u * ny + v * nx).toFixed(2)}px`;
  return Array.from({ length: 17 }, (_, frame) => {
    const progress = frame / 16;
    const spread = Math.min(1, progress * 4);
    const amplitude =
      Math.min(36, Math.max(18, width * 0.025)) * Math.sin(Math.PI * progress);
    const points = Array.from({ length: 49 }, (_, index) => {
      const v = (minV + ((maxV - minV) * index) / 48) * spread;
      const wave =
        Math.sin(v / 85 + progress * Math.PI * 2) +
        0.18 * Math.sin(v / 43 - progress * Math.PI);
      return point(maxU * progress + amplitude * wave, v);
    });
    points.push(
      point(minU * spread, maxV * spread),
      point(minU * spread, minV * spread),
    );
    return { offset: progress, clipPath: `polygon(${points.join(', ')})` };
  });
}

export function revealTheme(update, trigger) {
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.hidden
  ) {
    update();
    return null;
  }
  const root = document.documentElement;
  if (!document.startViewTransition) {
    update();
    const animation = root.animate([{ opacity: 0.85 }, { opacity: 1 }], {
      duration: 180,
    });
    return {
      finished: animation.finished,
      skipTransition: () => animation.cancel(),
    };
  }
  const rect = trigger?.getBoundingClientRect();
  const origin = {
    x: rect ? rect.left + rect.width / 2 : 0,
    y: rect ? rect.top + rect.height / 2 : 0,
  };
  const frames = diagonalWaveFrames(innerWidth, innerHeight, origin);
  root.classList.add('bazar-theme-wave');
  const transition = document.startViewTransition(update);
  transition.ready
    .then(() => {
      root.animate(frames, {
        duration: 850,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      });
    })
    .catch(() => {
      /* Una transición omitida conserva el cambio de tema. */
    });
  transition.finished
    .catch(() => {})
    .finally(() => root.classList.remove('bazar-theme-wave'));
  return transition;
}
