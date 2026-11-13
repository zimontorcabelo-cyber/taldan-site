'use client';

import { useEffect } from 'react';

/** Darkens the masthead after a little scroll and marks the nav link of the
 *  section currently on screen. */
export default function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector('.masthead');
    if (!header) return;
    function onScroll() {
      header!.classList.toggle('scrolled', window.scrollY > 40);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.mast-nav a[data-nav]'));
    const targets = links
      .map((a) => document.getElementById(a.dataset.nav as string))
      .filter(Boolean) as HTMLElement[];
    let io: IntersectionObserver | null = null;
    if (targets.length) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const link = links.find((a) => a.dataset.nav === e.target.id);
            if (!link) return;
            if (e.isIntersecting) {
              links.forEach((a) => (a === link ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
            } else if (link.getAttribute('aria-current')) {
              link.removeAttribute('aria-current');
            }
          });
        },
        { rootMargin: '-45% 0px -50% 0px' }
      );
      targets.forEach((el) => io!.observe(el));
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);
  return null;
}
