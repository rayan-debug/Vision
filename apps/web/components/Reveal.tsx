'use client';
import { useEffect } from 'react';

// Adds `.in` to any element with [data-reveal] when it enters the viewport.
// Paired with CSS in globals.css. No JS framework needed for the animation.
export default function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
