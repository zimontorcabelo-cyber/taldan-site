'use client';

import { useEffect } from 'react';

export default function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector('.masthead');
    if (!header) return;
    function onScroll() {
      header!.classList.toggle('scrolled', window.scrollY > 40);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return null;
}
