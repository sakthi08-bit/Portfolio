import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  DEFAULT_EDITABLE_PROFILE,
  EditableProfileOverrides,
  PORTFOLIO_DATA,
  ProjectItem,
  resolveInstagramHref,
} from './data/portfolio';
import { HeroCanvas } from './components/HeroCanvas';
import { PortraitFrame, ProjectArt } from './components/ProjectArt';
import { TerminalDrawer } from './components/TerminalDrawer';
import { ProfileCustomizerModal } from './components/ProfileCustomizerModal';
import { ProjectModal } from './components/ProjectModal';

gsap.registerPlugin(ScrollTrigger);

const STORAGE_KEY = 'sk_portfolio_profile_v1';
const INTRO_SEEN_KEY = 'sk_portfolio_intro_seen_v1';
const GLYPHS = '!/\\_-=+*^?#[]{}ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[c] || c;
  });
}

function scrambleElement(el: HTMLElement, to: string) {
  const from = el.textContent || '';
  const len = Math.max(from.length, to.length);
  const queue: Array<{ from: string; to: string; start: number; end: number; ch: string }> = [];
  for (let i = 0; i < len; i++) {
    const start = Math.floor(Math.random() * 16);
    queue.push({
      from: from[i] || '',
      to: to[i] || '',
      start,
      end: start + 8 + Math.floor(Math.random() * 16),
      ch: '',
    });
  }
  let frame = 0;
  const prevRaf = Number(el.dataset.scrRaf || '0');
  if (prevRaf) cancelAnimationFrame(prevRaf);

  const update = () => {
    let out = '';
    let done = 0;
    for (let j = 0; j < queue.length; j++) {
      const q = queue[j];
      if (frame >= q.end) {
        done++;
        out += escapeHtml(q.to);
      } else if (frame >= q.start) {
        if (!q.ch || Math.random() < 0.28) {
          q.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        out += `<span class="scr">${escapeHtml(q.ch)}</span>`;
      } else {
        out += escapeHtml(q.from);
      }
    }
    el.innerHTML = out;
    if (done < queue.length) {
      frame++;
      el.dataset.scrRaf = String(requestAnimationFrame(update));
    }
  };

  update();
}

function RollText({ children }: { children: React.ReactNode }) {
  return (
    <span className="roll">
      <span className="roll__in">{children}</span>
    </span>
  );
}

function SplitChars({ text }: { text: string }) {
  const words = text.trim().split(' ');
  return (
    <span data-chars="" className="is-split">
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          <span className="cw">
            {Array.from(word).map((ch, ci) => (
              <span key={ci} className="ch">
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  );
}

function SplitWords({
  segments,
  fillMode = false,
}: {
  segments: Array<{ text: string; italic?: boolean }>;
  fillMode?: boolean;
}) {
  return (
    <span data-split={fillMode ? undefined : ''} data-fill={fillMode ? '' : undefined} className={`is-split ${fillMode ? 'is-fill' : ''}`}>
      {segments.map((seg, si) => {
        const tokens = seg.text.split(/(\s+)/);
        const content = tokens.map((tok, ti) => {
          if (!tok) return null;
          if (/^\s+$/.test(tok)) return <React.Fragment key={ti}> </React.Fragment>;
          return (
            <span key={ti} className="w">
              <span className="w__in">{tok}</span>
            </span>
          );
        });
        return seg.italic ? <em key={si}>{content}</em> : <React.Fragment key={si}>{content}</React.Fragment>;
      })}
    </span>
  );
}

export default function App() {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const [showLoader, setShowLoader] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return sessionStorage.getItem(INTRO_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const [profile, setProfile] = useState<EditableProfileOverrides>(() => {
    if (typeof window === 'undefined') return DEFAULT_EDITABLE_PROFILE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_EDITABLE_PROFILE, ...JSON.parse(saved) };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_EDITABLE_PROFILE;
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [navOnAccent, setNavOnAccent] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('top');
  const [clockText, setClockText] = useState<string>('--:--');
  const [openExpIds, setOpenExpIds] = useState<Record<string, boolean>>({
    [PORTFOLIO_DATA.experience[0].id]: true,
  });

  const [emailCopied, setEmailCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Direct honest message composer state
  const [msgName, setMsgName] = useState('');
  const [msgTopic, setMsgTopic] = useState('');
  const [msgBody, setMsgBody] = useState('');

  const rootContainerRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loaderNumRef = useRef<HTMLSpanElement | null>(null);
  const loaderBarRef = useRef<HTMLElement | null>(null);
  const loaderWordRef = useRef<HTMLSpanElement | null>(null);
  const roleRef = useRef<HTMLSpanElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const collabRef = useRef<HTMLElement | null>(null);
  const marqueeTrackRef = useRef<HTMLDivElement | null>(null);
  const workPinRef = useRef<HTMLDivElement | null>(null);
  const workTrackRef = useRef<HTMLDivElement | null>(null);
  const workProgressRef = useRef<HTMLElement | null>(null);
  const footerMarkRef = useRef<HTMLDivElement | null>(null);
  const footerMarkSpanRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const cursorLabelRef = useRef<HTMLSpanElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const handleSaveProfile = useCallback((updated: EditableProfileOverrides) => {
    setProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, []);

  const instagramHref = useMemo(
    () => resolveInstagramHref(profile.instagramId, profile.instagramCustomUrl),
    [profile.instagramId, profile.instagramCustomUrl]
  );

  // Compose mailto and WhatsApp URLs dynamically from honest form inputs
  const composedMailtoHref = useMemo(() => {
    const subject = msgTopic.trim()
      ? `${msgTopic.trim()}${msgName.trim() ? ` — from ${msgName.trim()}` : ''}`
      : msgName.trim()
        ? `Portfolio Inquiry from ${msgName.trim()}`
        : 'Hello Sakthi — Portfolio Inquiry';
    const bodyLines: string[] = [];
    if (msgName.trim()) bodyLines.push(`Name: ${msgName.trim()}`);
    if (msgTopic.trim()) bodyLines.push(`Topic: ${msgTopic.trim()}`);
    if (msgBody.trim()) {
      if (bodyLines.length) bodyLines.push('');
      bodyLines.push(msgBody.trim());
    }
    const params = new URLSearchParams();
    params.set('subject', subject);
    if (bodyLines.length) params.set('body', bodyLines.join('\n'));
    return `mailto:${PORTFOLIO_DATA.contact.email}?${params.toString().replace(/\+/g, '%20')}`;
  }, [msgName, msgTopic, msgBody]);

  const composedWhatsAppHref = useMemo(() => {
    const parts: string[] = [];
    if (msgName.trim()) {
      parts.push(`Hi Sakthi, I'm ${msgName.trim()}.`);
    } else {
      parts.push('Hi Sakthi, I visited your portfolio and wanted to connect.');
    }
    if (msgTopic.trim()) parts.push(`Topic: ${msgTopic.trim()}`);
    if (msgBody.trim()) parts.push(msgBody.trim());
    return `${PORTFOLIO_DATA.contact.whatsappUrl}?text=${encodeURIComponent(parts.join('\n'))}`;
  }, [msgName, msgTopic, msgBody]);

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);

  // Live IST clock
  useEffect(() => {
    let fmt: Intl.DateTimeFormat | null = null;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return;
    }
    const tick = () => {
      if (fmt) setClockText(fmt.format(new Date()));
    };
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);

  // Sync root classes and Lenis pause when overlays open
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('menu-open', menuOpen);
    const shouldPauseScroll = menuOpen || Boolean(selectedProject) || customizerOpen;
    if (lenisRef.current) {
      if (shouldPauseScroll) lenisRef.current.stop();
      else lenisRef.current.start();
    }
  }, [menuOpen, selectedProject, customizerOpen]);

  // Global keyboard shortcuts (` for terminal, Escape for mobile menu)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const typing =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.isContentEditable);

      if (e.key === '`' && !typing) {
        e.preventDefault();
        setTerminalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (menuOpen) setMenuOpen(false);
        if (terminalOpen) setTerminalOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen, terminalOpen]);

  // Scroll state for header hide/show and orange accent band inversion
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setNavScrolled(y > 40);
      if (collabRef.current && navRef.current) {
        const r = collabRef.current.getBoundingClientRect();
        const navH = navRef.current.offsetHeight;
        setNavOnAccent(r.top < navH && r.bottom > navH / 2);
      }
      if (!menuOpen) {
        setNavHidden(y > lastY && y > 400);
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  // Active nav section observer
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const ids = ['top', 'about', 'experience', 'projects', 'skills', 'additional', 'contact'];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Footer full-width fitted wordmark
  useEffect(() => {
    const fitFooterMark = () => {
      const mark = footerMarkRef.current;
      const span = footerMarkSpanRef.current;
      if (!mark || !span) return;
      const cs = getComputedStyle(mark);
      const avail = mark.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      span.style.fontSize = '100px';
      const w = span.getBoundingClientRect().width;
      if (w > 0) {
        span.style.fontSize = `${(99 * avail) / w}px`;
      }
    };
    fitFooterMark();
    window.addEventListener('resize', fitFooterMark);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitFooterMark);
    }
    return () => window.removeEventListener('resize', fitFooterMark);
  }, []);

  // Smooth anchor click handler
  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, targetHash: string) => {
      if (!targetHash.startsWith('#')) return;
      const target =
        targetHash === '#top' || targetHash === '#'
          ? 0
          : (document.querySelector(targetHash) as HTMLElement | null);
      if (target === null) return;
      e.preventDefault();
      setMenuOpen(false);
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          duration: 1.4,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
        });
      } else if (target === 0) {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    },
    [reducedMotion]
  );

  // Main GSAP + ScrollTrigger + Lenis + Custom Cursor setup
  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.classList.remove('js-motion', 'has-cursor');
      return;
    }

    root.classList.add('js-motion');

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);

    // Role rotator timer
    let roleTimer: number | null = null;
    const startRoleRotator = () => {
      if (roleTimer) window.clearInterval(roleTimer);
      let idx = 0;
      roleTimer = window.setInterval(() => {
        if (!roleRef.current) return;
        idx = (idx + 1) % PORTFOLIO_DATA.rotatingRoles.length;
        scrambleElement(roleRef.current, PORTFOLIO_DATA.rotatingRoles[idx]);
      }, 3400);
    };

    const ctx = gsap.context(() => {
      // 1. Horizontal pinned projects gallery on desktop
      const pin = workPinRef.current;
      const track = workTrackRef.current;
      const progressBar = workProgressRef.current;

      const mm = gsap.matchMedia();
      if (pin && track) {
        mm.add('(min-width: 901px)', () => {
          pin.classList.add('is-horizontal');
          const getDist = () => Math.max(0, track.scrollWidth - window.innerWidth);
          const horizTween = gsap.to(track, {
            x: () => -getDist(),
            ease: 'none',
            scrollTrigger: {
              trigger: pin,
              start: 'top top',
              end: () => `+=${getDist()}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                if (progressBar) {
                  progressBar.style.transform = `scaleX(${self.progress})`;
                }
              },
            },
          });

          // Subtle schematic art drift inside each card
          const arts = gsap.utils.toArray<SVGElement>('.card__art', track);
          arts.forEach((art) => {
            const card = art.closest('.card');
            if (!card) return;
            gsap.fromTo(
              art,
              { xPercent: -12 },
              {
                xPercent: 12,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: horizTween,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              }
            );
          });

          return () => {
            pin.classList.remove('is-horizontal');
            gsap.set(track, { clearProps: 'x' });
          };
        });
      }

      // 2. Hero prepare & intro
      const heroChars = gsap.utils.toArray<HTMLElement>('.hero .ch');
      const heroMetaEls = gsap.utils.toArray<HTMLElement>('.hero [data-hero]');
      gsap.set(heroChars, { yPercent: 115, rotate: 7, transformOrigin: '0% 100%' });
      gsap.set(heroMetaEls, { y: 24, opacity: 0 });

      const playHeroIntro = () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .to(heroChars, { yPercent: 0, rotate: 0, duration: 1.45, stagger: 0.032 }, 0)
          .to(heroMetaEls, { opacity: 1, y: 0, duration: 1.15, stagger: 0.07 }, 0.32)
          .fromTo('#field', { opacity: 0 }, { opacity: 1, duration: 2.0, ease: 'power2.out' }, 0.15)
          .add(startRoleRotator, 1.5);
      };

      // Preloader sequence with safety watchdog
      if (showLoader && loaderRef.current && loaderNumRef.current && loaderBarRef.current && loaderWordRef.current) {
        lenis.stop();
        let finished = false;
        const finishLoader = () => {
          if (finished) return;
          finished = true;
          lenis.start();
          try {
            sessionStorage.setItem(INTRO_SEEN_KEY, '1');
          } catch {
            // ignore
          }
          setShowLoader(false);
        };

        const watchdog = window.setTimeout(() => {
          playHeroIntro();
          finishLoader();
        }, 4500);

        const counterObj = { v: 0 };
        const words = PORTFOLIO_DATA.loaderWords;

        gsap
          .timeline()
          .to(counterObj, {
            v: 100,
            duration: 1.9,
            ease: 'power3.inOut',
            onUpdate: () => {
              if (loaderNumRef.current) {
                loaderNumRef.current.textContent = String(Math.round(counterObj.v));
              }
              if (loaderBarRef.current) {
                loaderBarRef.current.style.transform = `scaleX(${counterObj.v / 100})`;
              }
              if (loaderWordRef.current) {
                const wi = Math.min(words.length - 1, Math.floor((counterObj.v / 100) * words.length));
                if (loaderWordRef.current.textContent !== words[wi]) {
                  loaderWordRef.current.textContent = words[wi];
                }
              }
            },
          })
          .to('.loader__row', { opacity: 0, y: -24, duration: 0.45, ease: 'power2.in', stagger: 0.05 }, '+=0.08')
          .to(loaderRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'expo.inOut' }, '-=0.15')
          .add(() => {
            lenis.start();
            playHeroIntro();
          }, '-=0.55')
          .add(() => {
            window.clearTimeout(watchdog);
            finishLoader();
          });
      } else {
        playHeroIntro();
      }

      // 3. Hero scroll parallax
      const heroScrollTrigger = {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      };
      gsap.to('.hero__title', { yPercent: -18, ease: 'none', scrollTrigger: heroScrollTrigger });
      gsap.to('.hero__foot', { yPercent: -38, opacity: 0, ease: 'none', scrollTrigger: heroScrollTrigger });
      gsap.to('.hero__field', { yPercent: 20, ease: 'none', scrollTrigger: heroScrollTrigger });

      // 4. Split headings reveal
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        const words = gsap.utils.toArray<HTMLElement>('.w__in', el);
        gsap.set(words, { yPercent: 110 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 86%',
          once: true,
          onEnter: () => {
            gsap.to(words, { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger: 0.055 });
          },
        });
      });

      // 5. Statement word-by-word scroll fill
      gsap.utils.toArray<HTMLElement>('[data-fill]').forEach((el) => {
        const words = gsap.utils.toArray<HTMLElement>('.w__in', el);
        gsap.fromTo(
          words,
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.5,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'bottom 45%',
              scrub: 0.6,
            },
          }
        );
      });

      // 6. General scroll reveals
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          const onScreen: HTMLElement[] = [];
          batch.forEach((node) => {
            const el = node as HTMLElement;
            el.classList.add('is-in');
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) onScreen.push(el);
            else gsap.set(el, { clearProps: 'opacity,transform' });
          });
          if (!onScreen.length) return;
          gsap.fromTo(
            onScreen,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
              ease: 'expo.out',
              overwrite: true,
              stagger: Math.min(0.08, 0.5 / onScreen.length),
              clearProps: 'opacity,transform',
            }
          );
        },
        onLeave: (batch) => {
          batch.forEach((node) => (node as HTMLElement).classList.add('is-in'));
          gsap.set(batch, { clearProps: 'opacity,transform' });
        },
      });

      // 7. Portrait frame clip reveal
      const portraitInner = document.querySelector<HTMLElement>('.about__portrait-inner');
      if (portraitInner) {
        gsap.fromTo(
          portraitInner,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.5,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: portraitInner, start: 'top 84%', once: true },
          }
        );
      }

      // 8. Animated stat counters
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count || '0');
        const suffix = el.dataset.suffix || '';
        const obj = { v: 0 };
        el.textContent = `0${suffix}`;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              v: target,
              duration: 2.0,
              ease: 'power3.out',
              onUpdate: () => {
                el.textContent = `${Math.round(obj.v)}${suffix}`;
              },
            });
          },
        });
      });

      // 9. Featured recon mock animation
      const mockEl = document.querySelector<HTMLElement>('.mock');
      if (mockEl) {
        gsap
          .timeline({ scrollTrigger: { trigger: mockEl, start: 'top 80%', once: true } })
          .fromTo('.mock__plot path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut' }, 0)
          .from('.mock__progress i', { scaleX: 0, duration: 1.35, ease: 'power2.out' }, 0)
          .from('.mock__log', { opacity: 0, y: 14, duration: 0.55, stagger: 0.22, ease: 'power3.out' }, 0.35);
      }

      // 10. Scramble section labels
      gsap.utils.toArray<HTMLElement>('[data-scramble]').forEach((el) => {
        const finalStr = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: () => scrambleElement(el, finalStr),
        });
      });
    }, rootContainerRef);

    // 11. Velocity-reactive marquee ticker
    let marqueeX = 0;
    let marqueeDir = 1;
    const marqueeTicker = (_time: number, dt: number) => {
      const track = marqueeTrackRef.current;
      if (!track) return;
      const v = lenis.velocity || 0;
      if (v > 0.2) marqueeDir = 1;
      else if (v < -0.2) marqueeDir = -1;
      marqueeX -= marqueeDir * (0.025 + Math.min(Math.abs(v) * 0.01, 0.45)) * (dt / 16.67);
      if (marqueeX <= -50) marqueeX += 50;
      if (marqueeX > 0) marqueeX -= 50;
      track.style.transform = `translate3d(${marqueeX}%,0,0)`;
    };
    gsap.ticker.add(marqueeTicker);

    // 12. Fine-pointer custom cursor & magnetic buttons
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const magneticCleanups: Array<() => void> = [];
    let cursorTicker: (() => void) | null = null;
    let onPointerMoveCursor: ((e: PointerEvent) => void) | null = null;
    let onMouseOutCursor: ((e: MouseEvent) => void) | null = null;
    let onMouseOverCursor: ((e: MouseEvent) => void) | null = null;

    if (finePointer && cursorRef.current && cursorDotRef.current && cursorRingRef.current && cursorLabelRef.current) {
      root.classList.add('has-cursor');
      const cursor = cursorRef.current;
      const dot = cursorDotRef.current;
      const ring = cursorRingRef.current;
      const label = cursorLabelRef.current;

      let mx = window.innerWidth / 2;
      let my = window.innerHeight / 2;
      let rx = mx;
      let ry = my;

      onPointerMoveCursor = (e: PointerEvent) => {
        mx = e.clientX;
        my = e.clientY;
        cursor.classList.add('is-visible');
      };
      onMouseOutCursor = (e: MouseEvent) => {
        if (!e.relatedTarget) cursor.classList.remove('is-visible');
      };
      onMouseOverCursor = (e: MouseEvent) => {
        const target = (e.target as HTMLElement | null)?.closest(
          '[data-cursor], [data-cursor-hide], a, button, input, textarea, label'
        ) as HTMLElement | null;
        cursor.classList.remove('is-hover', 'is-label', 'is-hidden');
        if (!target) return;
        if (target.hasAttribute('data-cursor-hide')) {
          cursor.classList.add('is-hidden');
        } else if (target.getAttribute('data-cursor')) {
          label.textContent = target.getAttribute('data-cursor') || '';
          cursor.classList.add('is-label');
        } else {
          cursor.classList.add('is-hover');
        }
      };

      cursorTicker = () => {
        rx += (mx - rx) * 0.2;
        ry += (my - ry) * 0.2;
        dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
        ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      };

      window.addEventListener('pointermove', onPointerMoveCursor, { passive: true });
      document.addEventListener('mouseout', onMouseOutCursor);
      document.addEventListener('mouseover', onMouseOverCursor);
      gsap.ticker.add(cursorTicker);

      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        const strength = el.classList.contains('cta-orb') || el.classList.contains('collab__badge') ? 0.38 : 0.25;
        const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * strength);
          yTo((e.clientY - (r.top + r.height / 2)) * strength);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);
        magneticCleanups.push(() => {
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerleave', onLeave);
        });
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      if (roleTimer) window.clearInterval(roleTimer);
      ctx.revert();
      gsap.ticker.remove(lenisTicker);
      gsap.ticker.remove(marqueeTicker);
      if (cursorTicker) gsap.ticker.remove(cursorTicker);
      if (onPointerMoveCursor) window.removeEventListener('pointermove', onPointerMoveCursor);
      if (onMouseOutCursor) document.removeEventListener('mouseout', onMouseOutCursor);
      if (onMouseOverCursor) document.removeEventListener('mouseover', onMouseOverCursor);
      magneticCleanups.forEach((fn) => fn());
      lenis.destroy();
      lenisRef.current = null;
      root.classList.remove('js-motion', 'has-cursor');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const toggleExperience = (id: string) => {
    setOpenExpIds((prev) => ({ ...prev, [id]: !prev[id] }));
    window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 750);
  };

  const handleCopyEmail = () => {
    const email = PORTFOLIO_DATA.contact.email;
    if (!navigator.clipboard) {
      window.location.href = `mailto:${email}`;
      return;
    }
    navigator.clipboard.writeText(email).then(
      () => {
        setEmailCopied(true);
        window.setTimeout(() => setEmailCopied(false), 2200);
      },
      () => {
        window.location.href = `mailto:${email}`;
      }
    );
  };

  const handleCopyInstagramId = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(profile.instagramId).then(() => {
      setIgCopied(true);
      window.setTimeout(() => setIgCopied(false), 2200);
    });
  };

  return (
    <div ref={rootContainerRef}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* ═══ Preloader ═══ */}
      {showLoader && (
        <div className="loader" id="loader" ref={loaderRef} aria-hidden="true">
          <div className="loader__row">
            <span className="mono">{PORTFOLIO_DATA.fullName}</span>
            <span className="mono">Portfolio — {profile.locationLabel}</span>
          </div>
          <div className="loader__row loader__row--bottom">
            <span className="loader__word" ref={loaderWordRef}>
              {PORTFOLIO_DATA.loaderWords[0]}
            </span>
            <span className="loader__count">
              <span ref={loaderNumRef}>0</span>
            </span>
          </div>
          <div className="loader__bar">
            <i ref={loaderBarRef} />
          </div>
        </div>
      )}

      {/* ═══ Custom Cursor ═══ */}
      <div className="cursor" ref={cursorRef} aria-hidden="true">
        <div className="cursor__dot" ref={cursorDotRef} />
        <div className="cursor__ring" ref={cursorRingRef}>
          <span className="cursor__label" ref={cursorLabelRef} />
        </div>
      </div>

      {/* ═══ Top Bar (Strict 3-Zone Contract) ═══ */}
      <header
        ref={navRef}
        className={`nav ${navScrolled ? 'is-scrolled' : ''} ${navHidden ? 'is-hidden' : ''} ${navOnAccent ? 'on-accent' : ''}`}
        id="nav"
      >
        <a
          href="#top"
          onClick={(e) => scrollToSection(e, '#top')}
          className="nav__logo"
          aria-label="Sakthi Kumaran — Back to top"
          data-magnetic=""
        >
          <RollText>{PORTFOLIO_DATA.fullName}</RollText>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, '#about')}
            className={activeNav === 'about' ? 'is-active' : ''}
          >
            <RollText>About</RollText>
          </a>
          <a
            href="#experience"
            onClick={(e) => scrollToSection(e, '#experience')}
            className={activeNav === 'experience' ? 'is-active' : ''}
          >
            <RollText>Experience</RollText>
          </a>
          <a
            href="#projects"
            onClick={(e) => scrollToSection(e, '#projects')}
            className={activeNav === 'projects' ? 'is-active' : ''}
          >
            <RollText>Projects</RollText>
          </a>
          <a
            href="#skills"
            onClick={(e) => scrollToSection(e, '#skills')}
            className={activeNav === 'skills' ? 'is-active' : ''}
          >
            <RollText>Skills</RollText>
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, '#contact')}
            className={activeNav === 'contact' ? 'is-active' : ''}
          >
            <RollText>Contact</RollText>
          </a>
        </nav>

        <div className="nav__right">
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, '#contact')}
            className="nav__cta"
            data-magnetic=""
          >
            <RollText>Get in touch</RollText>
          </a>

          <button
            type="button"
            className="nav__menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="nav__menu-label">{menuOpen ? 'Close' : 'Menu'}</span>
            <span className="nav__menu-icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      {/* ═══ Mobile Navigation Curtain ═══ */}
      <div
        className={`menu ${menuOpen ? 'is-open' : ''}`}
        id="mobile-menu"
        aria-hidden={!menuOpen}
        data-lenis-prevent=""
      >
        <nav className="menu__links" aria-label="Mobile">
          <a href="#about" onClick={(e) => scrollToSection(e, '#about')}>
            <span className="mono">01</span>About
          </a>
          <a href="#experience" onClick={(e) => scrollToSection(e, '#experience')}>
            <span className="mono">02</span>Experience
          </a>
          <a href="#projects" onClick={(e) => scrollToSection(e, '#projects')}>
            <span className="mono">03</span>Projects
          </a>
          <a href="#skills" onClick={(e) => scrollToSection(e, '#skills')}>
            <span className="mono">04</span>Skills
          </a>
          <a href="#additional" onClick={(e) => scrollToSection(e, '#additional')}>
            <span className="mono">05</span>Additional Work
          </a>
          <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>
            <span className="mono">06</span>Contact
          </a>
        </nav>

        <div className="menu__foot mono">
          <a
            href={PORTFOLIO_DATA.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="menu__cta"
          >
            <span>Message on WhatsApp</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a href={`mailto:${PORTFOLIO_DATA.contact.email}`}>{PORTFOLIO_DATA.contact.email}</a>
          <div className="menu__socials">
            <a href={PORTFOLIO_DATA.contact.githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={PORTFOLIO_DATA.contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            {instagramHref ? (
              <a href={instagramHref} target="_blank" rel="noopener noreferrer">
                Instagram ({profile.instagramId})
              </a>
            ) : (
              <button type="button" onClick={handleCopyInstagramId}>
                {igCopied ? 'Copied ID ✓' : `IG: ${profile.instagramId}`}
              </button>
            )}
          </div>
        </div>
      </div>

      <main id="main">
        {/* ═══ 1. HERO ═══ */}
        <section className="hero" id="top">
          <HeroCanvas reducedMotion={reducedMotion} />

          <div className="hero__meta wrap" data-hero="">
            <span className="mono">({PORTFOLIO_DATA.identityLine})</span>
            <span className="mono hero__coords">
              {profile.locationLabel} · {clockText} IST
            </span>
          </div>

          <h1 className="hero__title wrap" aria-label={PORTFOLIO_DATA.fullName}>
            <span className="hero__line" aria-hidden="true">
              <SplitChars text={PORTFOLIO_DATA.firstName} />
            </span>
            <span className="hero__line hero__line--2" aria-hidden="true">
              <span className="hero__aside mono" data-hero="">
                Coder · Developer
                <br />
                &amp; Cybersecurity Enthusiast
              </span>
              <SplitChars text={PORTFOLIO_DATA.lastName} />
              <span className="hero__star" data-hero="">
                *
              </span>
            </span>
          </h1>

          <div className="hero__foot wrap">
            <p className="hero__lede" data-hero="">
              Building ideas into <em>digital experiences.</em>
            </p>
            <div className="hero__role" data-hero="">
              <span className="mono hero__role-label">Focus —</span>
              <span className="hero__role-text" ref={roleRef}>
                {PORTFOLIO_DATA.rotatingRoles[0]}
              </span>
            </div>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, '#about')}
              className="hero__scroll mono"
              data-hero=""
              aria-label="Scroll to About section"
            >
              <span>Scroll</span>
              <span className="hero__scroll-line">
                <i />
              </span>
            </a>
          </div>
        </section>

        {/* ═══ Marquee ═══ */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track" ref={marqueeTrackRef}>
            {[0, 1].map((groupIndex) => (
              <div className="marquee__group" key={groupIndex}>
                {PORTFOLIO_DATA.marqueeItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {item.italic ? <em>{item.text}</em> : <span>{item.text}</span>}
                    <b>✳</b>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 2. ABOUT ═══ */}
        <section className="section about" id="about">
          <div className="wrap">
            <div className="section__head">
              <span className="mono" data-scramble="">
                (01)
              </span>
              <span className="mono" data-scramble="">
                About
              </span>
            </div>

            <p className="statement">
              <SplitWords
                fillMode
                segments={[
                  { text: PORTFOLIO_DATA.about.statementPrefix },
                  { text: PORTFOLIO_DATA.about.statementHighlight, italic: true },
                  { text: PORTFOLIO_DATA.about.statementSuffix },
                ]}
              />
            </p>

            <div className="about__grid">
              <figure className="about__portrait">
                <div className="about__portrait-inner">
                  <PortraitFrame
                    portraitUrl={profile.portraitUrl}
                    fullName={PORTFOLIO_DATA.fullName}
                  />
                </div>
                <figcaption className="about__portrait-caption mono">
                  <span>Sakthi Kumaran</span>
                  <button
                    type="button"
                    className="about__portrait-edit mono"
                    onClick={() => setCustomizerOpen(true)}
                    data-cursor="Edit"
                  >
                    Customize details
                  </button>
                </figcaption>
              </figure>

              <div className="about__body">
                {PORTFOLIO_DATA.about.paragraphs.map((p, i) => (
                  <p key={i} data-reveal="">
                    <strong>{p.lead}</strong>
                    {p.body}
                  </p>
                ))}
                <p data-reveal="">
                  <em>“{PORTFOLIO_DATA.quote}”</em>
                </p>

                <dl className="facts" data-reveal="">
                  <div>
                    <dt className="mono">Name</dt>
                    <dd>{PORTFOLIO_DATA.fullName}</dd>
                  </div>
                  <div>
                    <dt className="mono">Identity</dt>
                    <dd>{PORTFOLIO_DATA.identityLine}</dd>
                  </div>
                  <div>
                    <dt className="mono">Location</dt>
                    <dd>{profile.locationLabel}</dd>
                  </div>
                  <div>
                    <dt className="mono">Learning Focus</dt>
                    <dd>{profile.educationNote}</dd>
                  </div>
                  <div>
                    <dt className="mono">Core Stack</dt>
                    <dd>Python · C/C++ · Bash · JavaScript</dd>
                  </div>
                  <div>
                    <dt className="mono">GitHub</dt>
                    <dd>
                      <a
                        href={PORTFOLIO_DATA.contact.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-arrow"
                      >
                        github.com/{PORTFOLIO_DATA.contact.githubHandle} ↗
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="mono">Open to</dt>
                    <dd>
                      <a
                        href="#contact"
                        onClick={(e) => scrollToSection(e, '#contact')}
                        className="link-arrow"
                      >
                        Projects, internships &amp; security research
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="stats">
              {PORTFOLIO_DATA.about.stats.map((st, idx) => (
                <div className="stat" key={idx} data-reveal="">
                  <span
                    className="stat__num"
                    data-count={st.count}
                    data-suffix={st.suffix}
                  >
                    {st.count}
                    {st.suffix}
                  </span>
                  <span className="stat__label mono">{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 3. EXPERIENCE / LEARNING JOURNEY ═══ */}
        <section className="section exp" id="experience">
          <div className="wrap">
            <div className="section__head">
              <span className="mono" data-scramble="">
                (02)
              </span>
              <span className="mono" data-scramble="">
                Experience &amp; Learning Journey
              </span>
            </div>

            <h2 className="h2">
              <SplitWords
                segments={[
                  { text: 'Learning & ' },
                  { text: 'building', italic: true },
                ]}
              />
            </h2>

            <ol className="exp__list">
              {PORTFOLIO_DATA.experience.map((item) => {
                const isOpen = Boolean(openExpIds[item.id]);
                return (
                  <li
                    key={item.id}
                    className={`exp__item ${isOpen ? 'is-open' : ''}`}
                    data-reveal=""
                  >
                    <button
                      type="button"
                      className="exp__row"
                      aria-expanded={isOpen}
                      onClick={() => toggleExperience(item.id)}
                    >
                      <span className="exp__num mono">{item.num}</span>
                      <span className="exp__role">
                        {item.role}
                        {item.isCurrent && (
                          <span className="exp__role-status">(Current)</span>
                        )}
                      </span>
                      <span className="exp__co">{item.organization}</span>
                      <span className="exp__date mono">{item.period}</span>
                      <span className="exp__plus" aria-hidden="true" />
                    </button>
                    <div className="exp__panel">
                      <div className="exp__inner">
                        <p className="exp__meta mono">{item.meta}</p>
                        {item.bullets && (
                          <ul className="exp__bullets">
                            {item.bullets.map((b, bi) => (
                              <li key={bi}>{b}</li>
                            ))}
                          </ul>
                        )}
                        <ul className="meta-tags">
                          {item.tags.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ═══ 4. SELECTED PROJECTS ═══ */}
        <section className="section work" id="projects">
          <div className="wrap">
            <div className="section__head">
              <span className="mono" data-scramble="">
                (03)
              </span>
              <span className="mono" data-scramble="">
                Selected Projects
              </span>
            </div>

            <h2 className="h2">
              <SplitWords
                segments={[
                  { text: "Things I've " },
                  { text: 'built', italic: true },
                ]}
              />
            </h2>

            {/* Featured Flagship Showcase */}
            <article className="feature" data-reveal="">
              <div className="feature__info">
                <span className="mono feature__kicker">{PORTFOLIO_DATA.featuredProject.kicker}</span>
                <h3 className="feature__title">{PORTFOLIO_DATA.featuredProject.title}</h3>
                <p className="feature__sub">{PORTFOLIO_DATA.featuredProject.subtitle}</p>
                <p className="feature__desc">{PORTFOLIO_DATA.featuredProject.description}</p>
                <ul className="meta-tags">
                  {PORTFOLIO_DATA.featuredProject.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <a
                  href={PORTFOLIO_DATA.featuredProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  data-magnetic=""
                >
                  <RollText>View on GitHub</RollText>
                  <span className="btn__arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>

              {/* Live Recon Topology & Output Mock */}
              <div className="mock" aria-hidden="true">
                <div className="mock__bar">
                  <i />
                  <i />
                  <i />
                  <span className="mono">sakthi@lab:~/netrecon-suite</span>
                </div>
                <div className="mock__body">
                  <div className="mock__video">
                    <div className="mock__screen">
                      <svg viewBox="0 0 200 90" preserveAspectRatio="none" className="mock__plot">
                        <path
                          d="M8 72 L42 54 L76 62 L114 28 L152 40 L192 16"
                          pathLength={1}
                        />
                        <circle cx="42" cy="54" r="3" />
                        <circle cx="114" cy="28" r="3.5" />
                        <circle cx="192" cy="16" r="3.5" />
                      </svg>
                    </div>
                    <div className="mock__progress">
                      <i />
                    </div>
                    <div className="mock__caption mono">
                      Raw-socket TCP discovery · Lab subnet 10.0.2.0/24
                    </div>
                  </div>

                  <div className="mock__chat">
                    <div className="mock__log mock__log--cmd">
                      <span>$</span> python3 scanner.py --target 10.0.2.15
                    </div>
                    <div className="mock__log">
                      <span>22/tcp</span> open · OpenSSH 9.6
                      <br />
                      <span>80/tcp</span> open · Apache 2.4
                      <br />
                      <span>443/tcp</span> open · TLS 1.3
                    </div>
                    <div className="mock__log">
                      Scan completed · <span>3 active services</span> fingerprinted
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Horizontal Scroll-Pinned Project Gallery */}
          <div className="work__pin" ref={workPinRef}>
            <div className="work__track" ref={workTrackRef}>
              <div className="work__intro">
                <span className="mono">Selected builds</span>
                <span className="work__count">04</span>
                <p>Security scanners, cryptographic utilities, and network tools.</p>
                <span className="mono work__hint">Keep scrolling →</span>
              </div>

              {PORTFOLIO_DATA.projects.map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  className="card"
                  onClick={() => setSelectedProject(proj)}
                  data-cursor="Inspect"
                >
                  <div className="card__cover">
                    <span className="card__num">{proj.num}</span>
                    <ProjectArt type={proj.artType} />
                  </div>
                  <div className="card__meta">
                    <h3 className="card__title">{proj.title}</h3>
                    <p className="card__sub">{proj.subtitle}</p>
                    <p className="card__desc">{proj.description}</p>
                    <ul className="meta-tags">
                      {proj.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </button>
              ))}

              <a
                className="card card--more"
                href={PORTFOLIO_DATA.contact.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="GitHub"
              >
                <span className="mono">Open source</span>
                <span className="card--more__title">
                  More on <em>GitHub</em>
                </span>
                <span className="card--more__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
            <div className="work__progress" aria-hidden="true">
              <i ref={workProgressRef} />
            </div>
          </div>
        </section>

        {/* ═══ 5. SKILLS ═══ */}
        <section className="section skills" id="skills">
          <div className="wrap">
            <div className="section__head">
              <span className="mono" data-scramble="">
                (04)
              </span>
              <span className="mono" data-scramble="">
                Skills &amp; Arsenal
              </span>
            </div>

            <h2 className="h2">
              <SplitWords
                segments={[
                  { text: 'Tools of the ' },
                  { text: 'trade', italic: true },
                ]}
              />
            </h2>

            <div className="skills__list">
              {PORTFOLIO_DATA.skills.map((cat) => (
                <div className="skill-row" key={cat.num} data-reveal="">
                  <span className="mono skill-row__num">{cat.num}</span>
                  <h3 className="skill-row__name">{cat.name}</h3>
                  <ul className="skill-items">
                    {cat.items.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 6. ADDITIONAL WORK & EXPERIMENTS ═══ */}
        <section className="section content" id="additional">
          <div className="wrap">
            <div className="section__head">
              <span className="mono" data-scramble="">
                (05)
              </span>
              <span className="mono" data-scramble="">
                Additional Work
              </span>
            </div>

            <h2 className="h2">
              <SplitWords
                segments={[
                  { text: 'Experiments & ' },
                  { text: 'labs', italic: true },
                ]}
              />
            </h2>

            <p className="lede" data-reveal="">
              Beyond standalone scanners: workflow automation frameworks, CTF helper toolkits, and interactive frontend builds.
            </p>

            <div className="platforms">
              {PORTFOLIO_DATA.additionalWork.map((item) => (
                <a
                  key={item.id}
                  className="platform"
                  href={item.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-reveal=""
                  data-cursor="GitHub"
                >
                  <div className="platform__head">
                    <span className="mono">{item.kicker}</span>
                    <span className="platform__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </div>
                  <div className="platform__art-wrap">
                    <ProjectArt type={item.artType} />
                  </div>
                  <h3 className="platform__title">{item.title}</h3>
                  <p className="platform__sub">{item.subtitle}</p>
                  <p className="platform__desc">{item.description}</p>
                  <ul className="meta-tags">
                    {item.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Collaboration Accent Band (Reference Visual Signature) ═══ */}
        <section className="collab" id="collaborate" ref={collabRef}>
          <div className="collab__marquee" aria-hidden="true">
            <div className="collab__marquee-track">
              <span>
                Building ideas into digital experiences ✳ Software Development ✳ Cybersecurity ✳ Python &amp; Automation ✳ Building ideas into digital experiences ✳ Software Development ✳ Cybersecurity ✳ Python &amp; Automation ✳&nbsp;
              </span>
              <span>
                Building ideas into digital experiences ✳ Software Development ✳ Cybersecurity ✳ Python &amp; Automation ✳ Building ideas into digital experiences ✳ Software Development ✳ Cybersecurity ✳ Python &amp; Automation ✳&nbsp;
              </span>
            </div>
          </div>

          <div className="wrap collab__inner">
            <div className="collab__top mono">
              <span>Collaboration &amp; Projects</span>
              <span>Open for projects, internships &amp; research</span>
            </div>

            <div className="collab__grid">
              <div className="collab__copy">
                <h2 className="collab__title">
                  <SplitWords
                    segments={[
                      { text: 'Have an idea in mind? ' },
                      { text: "Let's build it.", italic: true },
                    ]}
                  />
                </h2>
                <p className="collab__lede" data-reveal="">
                  Whether you want to build a clean digital product, automate technical workflows in Python, or collaborate on cybersecurity research and CTFs — let&apos;s connect.
                </p>
              </div>

              <a
                href={PORTFOLIO_DATA.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="collab__badge"
                data-magnetic=""
                data-cursor-hide=""
                aria-label="Message Sakthi Kumaran on WhatsApp"
              >
                <svg viewBox="0 0 200 200" className="collab__ring" aria-hidden="true">
                  <defs>
                    <path
                      id="ring-path"
                      d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"
                    />
                  </defs>
                  <text textLength={486}>
                    <textPath href="#ring-path">
                      START A CONVERSATION ✳ BUILD TOGETHER ✳{' '}
                    </textPath>
                  </text>
                </svg>
                <span className="collab__badge-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>

            <div className="collab__bottom">
              <ol className="collab__list">
                {PORTFOLIO_DATA.collaborationPillars.map((p) => (
                  <li key={p.num} data-reveal="">
                    <span className="mono">{p.num}</span>
                    <strong>{p.title}</strong>
                    <p>{p.desc}</p>
                  </li>
                ))}
              </ol>

              <div className="collab__action" data-reveal="">
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, '#contact')}
                  className="collab__btn"
                  data-magnetic=""
                >
                  <span className="collab__btn-label">Reach out directly</span>
                  <span className="collab__btn-sub mono">Email or WhatsApp</span>
                  <span className="collab__btn-arrow" aria-hidden="true">
                    ↓
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 7. CONTACT ═══ */}
        <section className="contact" id="contact">
          <div className="wrap">
            <div className="section__head">
              <span className="mono" data-scramble="">
                (06)
              </span>
              <span className="mono" data-scramble="">
                Contact
              </span>
            </div>

            <h2 className="contact__title">
              <SplitWords
                segments={[
                  { text: "Let's build something " },
                  { text: 'remarkable.', italic: true },
                ]}
              />
            </h2>

            <div className="contact__grid">
              <div className="contact__left" data-reveal="">
                <p className="contact__lede">
                  Open to software development collaborations, security research opportunities, internships, and technical discussions. Copy my email below or compose a direct message.
                </p>

                <button
                  type="button"
                  className="email"
                  onClick={handleCopyEmail}
                  data-cursor="Copy"
                >
                  <span className="email__addr">{PORTFOLIO_DATA.contact.email}</span>
                  <span className="email__state mono" aria-live="polite">
                    {emailCopied ? 'Copied ✓' : 'Copy'}
                  </span>
                </button>

                {/* Honest Direct Message Composer (launches user's real Email client or WhatsApp) */}
                <div className="composer">
                  <div className="composer__field">
                    <label className="mono" htmlFor="msg-name">
                      Your Name
                    </label>
                    <input
                      id="msg-name"
                      type="text"
                      className="composer__input"
                      placeholder="Alex Morgan"
                      value={msgName}
                      onChange={(e) => setMsgName(e.target.value)}
                    />
                  </div>
                  <div className="composer__field">
                    <label className="mono" htmlFor="msg-topic">
                      Subject / Project Topic
                    </label>
                    <input
                      id="msg-topic"
                      type="text"
                      className="composer__input"
                      placeholder="Web Project, Security Tooling, or Internship"
                      value={msgTopic}
                      onChange={(e) => setMsgTopic(e.target.value)}
                    />
                  </div>
                  <div className="composer__field">
                    <label className="mono" htmlFor="msg-body">
                      Message
                    </label>
                    <textarea
                      id="msg-body"
                      className="composer__textarea"
                      placeholder="Hi Sakthi, I'd love to discuss..."
                      value={msgBody}
                      onChange={(e) => setMsgBody(e.target.value)}
                    />
                  </div>
                  <div className="composer__actions">
                    <a href={composedMailtoHref} className="btn">
                      <RollText>Open in Email</RollText>
                      <span className="btn__arrow" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                    <a
                      href={composedWhatsAppHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--ghost"
                    >
                      <RollText>Send via WhatsApp</RollText>
                      <span className="btn__arrow" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  </div>
                  <p className="composer__note mono">
                    Opens your email client or WhatsApp directly with your message pre-filled.
                  </p>
                </div>
              </div>

              <div className="contact__right">
                <h3 className="mono contact__ww-title" data-reveal="">
                  Direct Channels
                </h3>

                <div className="ww" data-reveal="">
                  <span className="mono">01</span>
                  <div>
                    <strong>Email</strong>
                    <a href={`mailto:${PORTFOLIO_DATA.contact.email}`}>
                      {PORTFOLIO_DATA.contact.email}
                    </a>
                  </div>
                </div>

                <div className="ww" data-reveal="">
                  <span className="mono">02</span>
                  <div>
                    <strong>WhatsApp</strong>
                    <a
                      href={PORTFOLIO_DATA.contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {PORTFOLIO_DATA.contact.whatsappDisplay} ↗
                    </a>
                  </div>
                </div>

                <div className="ww" data-reveal="">
                  <span className="mono">03</span>
                  <div>
                    <strong>GitHub</strong>
                    <a
                      href={PORTFOLIO_DATA.contact.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      github.com/{PORTFOLIO_DATA.contact.githubHandle} ↗
                    </a>
                  </div>
                </div>

                <div className="ww" data-reveal="">
                  <span className="mono">04</span>
                  <div>
                    <strong>Instagram</strong>
                    <div className="ig-inline-row">
                      {instagramHref ? (
                        <a href={instagramHref} target="_blank" rel="noopener noreferrer">
                          {profile.instagramId} ↗
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCopyInstagramId}
                          className="text-left text-[var(--fg-2)] hover:text-[var(--fg)]"
                        >
                          {igCopied ? `${profile.instagramId} (Copied ✓)` : profile.instagramId}
                        </button>
                      )}
                      <button
                        type="button"
                        className="ig-edit-trigger"
                        onClick={() => setCustomizerOpen(true)}
                      >
                        Edit ID
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={PORTFOLIO_DATA.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-orb"
                data-magnetic=""
                data-cursor-hide=""
              >
                <span className="cta-orb__text">
                  Chat on
                  <br />
                  WhatsApp
                  <br />
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            </div>

            <div className="socials" data-reveal="">
              <a
                href={PORTFOLIO_DATA.contact.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="socials__item"
              >
                <RollText>GitHub</RollText>
                <span className="socials__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
              <a
                href={PORTFOLIO_DATA.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="socials__item"
              >
                <RollText>WhatsApp</RollText>
                <span className="socials__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
              <a
                href={`mailto:${PORTFOLIO_DATA.contact.email}`}
                className="socials__item"
              >
                <RollText>Email</RollText>
                <span className="socials__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
              {instagramHref ? (
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="socials__item"
                >
                  <RollText>{`Instagram · ${profile.instagramId}`}</RollText>
                  <span className="socials__arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyInstagramId}
                  className="socials__item"
                  data-cursor="Copy"
                >
                  <RollText>
                    {igCopied ? 'Copied Instagram ID ✓' : `Instagram · ${profile.instagramId}`}
                  </RollText>
                  <span className="socials__arrow" aria-hidden="true">
                    ⎘
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ═══ 8. FOOTER ═══ */}
      <footer className="footer">
        <div className="wrap footer__top">
          <p className="footer__quote">“{PORTFOLIO_DATA.quote}”</p>

          <div className="footer__col mono">
            <span>Local time · {profile.locationLabel}</span>
            <span className="text-[var(--fg)]">{clockText} IST</span>
            <a href={`mailto:${PORTFOLIO_DATA.contact.email}`} className="footer__mail">
              {PORTFOLIO_DATA.contact.email}
            </a>
          </div>

          <div className="footer__col mono">
            <button
              type="button"
              className="footer__btn"
              onClick={() => setTerminalOpen((prev) => !prev)}
            >
              <RollText>Open terminal</RollText> <kbd>`</kbd>
            </button>
            <button
              type="button"
              className="footer__btn"
              onClick={() => setCustomizerOpen(true)}
            >
              <RollText>Edit details</RollText>
            </button>
            <a
              href="#top"
              onClick={(e) => scrollToSection(e, '#top')}
              className="footer__btn"
            >
              <RollText>Back to top</RollText> ↑
            </a>
          </div>
        </div>

        <div className="footer__mark" ref={footerMarkRef} aria-hidden="true">
          <span ref={footerMarkSpanRef}>{PORTFOLIO_DATA.fullName}</span>
        </div>

        <div className="wrap footer__bottom mono">
          <div className="footer__credits-left">
            <span>© {new Date().getFullYear()} {PORTFOLIO_DATA.fullName}</span>
            <span>·</span>
            <span>Designed and developed by Sakthi Kumaran.</span>
          </div>
          <div className="footer__nexus">
            Created and Managed by <strong>NEXUS ENTERPRISES</strong>
          </div>
        </div>
      </footer>

      {/* ═══ Interactive Terminal & Modals ═══ */}
      <TerminalDrawer
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        onOpenCustomizer={() => {
          setTerminalOpen(false);
          setCustomizerOpen(true);
        }}
        profile={profile}
      />

      <ProfileCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
