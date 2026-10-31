'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export const PFContext = createContext(null);
export const usePF = () => useContext(PFContext);

export const pad = (n) => String(n).padStart(2, '0');
export const isPdf = (p) => /\.pdf(\?|#|$)/i.test(p || '');
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* atribut target untuk link eksternal (bukan mailto) */
export const extProps = (url) => (/^https?:/.test(url || '') ? { target: '_blank', rel: 'noopener' } : {});

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

export async function copyText(s) {
  try {
    await navigator.clipboard.writeText(s);
    return true;
  } catch (_) {
    const ta = Object.assign(document.createElement('textarea'), { value: s });
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
    ta.remove();
    return ok;
  }
}

export function setTheme(next, e, reduced) {
  const root = document.documentElement;
  const apply = () => {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('pf-theme', next); } catch (_) { /* mode privat */ }
    window.dispatchEvent(new Event('pf-theme'));
  };
  if (!document.startViewTransition || reduced) return apply();
  const x = e && e.detail ? e.clientX : innerWidth - 80;
  const y = e && e.detail ? e.clientY : 44;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => {});
  return undefined;
}
