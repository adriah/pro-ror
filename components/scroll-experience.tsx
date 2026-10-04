"use client";

import { useEffect, useRef, useState } from "react";
import type { BathroomScene } from "./bathroom-scene";

/** Native scrolling throughout. Effects enhance fully visible server-rendered content. */
export function ScrollEffects() {
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const animations = new Set<Animation>();
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      progress.current?.style.setProperty("--page-progress", String(distance > 0 ? window.scrollY / distance : 0));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
    const setup = () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      if (preference.matches) return;
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          const stagger = element.matches(".service-card, .project-card, .job-grid article")
            ? Array.from(element.parentElement?.children || []).indexOf(element) % 4 * 75 : 0;
          const animation = element.animate([
            { opacity: 0, transform: "translate3d(0, 32px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ], { duration: 850, delay: stagger, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
          observer?.unobserve(element);
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(".section-heading, .service-card, .about-visual, .about-copy, .project-card, .contact-top, .contact-methods > a, .story-fallback article").forEach((element) => observer?.observe(element));
    };
    setup();
    updateProgress();
    preference.addEventListener("change", setup);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", setup);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={progress} className="reading-progress" aria-hidden="true" />;
}

const chapters = [
  {
    number: "01", label: "DRAUMEN", title: "Det finst eit bad", emphasis: "berre du ser.",
    text: "Litt meir plass. Betre flyt. Ein god start på dagen. Me byrjar med det du drøymer om — og finn ut korleis det kan bli verkeleg.",
    image: "/img/portfolio/3.jpg", alt: "Naturlege materialar og gjennomtenkte detaljar i heimen", detail: "Frå tanke til teikning", noun: "Tenk det.",
  },
  {
    number: "02", label: "INNSIDA", title: "Det viktigaste", emphasis: "er ofte usynleg.",
    text: "Trygge vassrøyr. Varme under føtene. Kvar kopling har ein jobb å gjera. Her legg me grunnlaget for eit rom som varer.",
    image: "/img/portfolio/1.jpg", alt: "Røyrkoplingar og ventilar i ein VVS-installasjon", detail: "Vatn inn. Varme under føtene.", noun: "Bygg det.",
  },
  {
    number: "03", label: "HANDVERKET", title: "Bit for bit.", emphasis: "Heilt ditt.",
    text: "Røyrarbeidet møter rommet du har sett føre deg. Dusj, badekar og servant finn plassen sin. Gode val blir ein god heilskap.",
    image: "/img/header.jpg", alt: "Ein røyrleggjar som arbeider med koparrøyr", detail: "Frå installasjon til ferdig rom", noun: "Sjå det.",
  },
  {
    number: "04", label: "KVARDAGEN", title: "Så er det berre", emphasis: "å nyta det.",
    text: "Den første varme dusjen. Eit roleg augneblink. Det er dette alt handverket handlar om: ein kvardag som fungerer, heilt enkelt.",
    image: "/img/portfolio/5.jpg", alt: "Ein varm dusj i eit ferdig bad", detail: "Godt handverk. Heilt heime.", noun: "Lev i det.",
  },
];

export function CraftStory() {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const renderer = useRef<BathroomScene | null>(null);
  const progressRef = useRef(0);
  const [motion, setMotion] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const cinematic = motion && !failed;

  useEffect(() => {
    const media = window.matchMedia("(min-height: 650px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Load the 3D engine only when this part of the page is approaching the viewport.
  useEffect(() => {
    if (!cinematic || !canvasHost.current) return;
    let cancelled = false;
    let loading = false;
    const host = canvasHost.current;
    const contextLost = (event: Event) => { event.preventDefault(); setFailed(true); };
    const resize = new ResizeObserver(() => renderer.current?.resize());
    resize.observe(host);
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting) || loading) return;
      loading = true;
      import("./bathroom-scene").then(({ createBathroomScene }) => {
        if (cancelled) return;
        renderer.current = createBathroomScene(host);
        renderer.current.update(progressRef.current);
        host.querySelector("canvas")?.addEventListener("webglcontextlost", contextLost);
        setReady(true);
      }).catch(() => { if (!cancelled) setFailed(true); });
      observer.disconnect();
    }, { rootMargin: "500px" });
    observer.observe(host);
    return () => {
      cancelled = true;
      observer.disconnect(); resize.disconnect();
      host.querySelector("canvas")?.removeEventListener("webglcontextlost", contextLost);
      renderer.current?.dispose(); renderer.current = null;
      setReady(false);
    };
  }, [cinematic]);

  useEffect(() => {
    if (!cinematic) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!section.current || !scene.current) return;
      const rect = section.current.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(scene.current).top) || 0;
      const travel = section.current.offsetHeight - scene.current.offsetHeight;
      const progress = Math.max(0, Math.min(1, (top - rect.top) / Math.max(1, travel)));
      progressRef.current = progress;
      section.current.style.setProperty("--story-progress", progress.toFixed(4));
      setActive(Math.min(3, Math.floor(progress * 4)));
      if (rect.top < window.innerHeight && rect.bottom > 0) renderer.current?.update(progress);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    if (section.current) resize.observe(section.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const theme = new MutationObserver(schedule);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-concept"] });
    update();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); theme.disconnect();
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
    };
  }, [cinematic]);

  function jumpToChapter(index: number) {
    if (!section.current || !scene.current) return;
    const top = parseFloat(getComputedStyle(scene.current).top) || 0;
    const distance = section.current.offsetHeight - scene.current.offsetHeight;
    window.scrollTo({ top: window.scrollY + section.current.getBoundingClientRect().top - top + distance * (index + 0.55) / 4, behavior: "smooth" });
  }

  return <section ref={section} className="craft-story" id="handverket" data-cinematic={cinematic} data-chapter={active} data-renderer={ready ? "ready" : failed ? "fallback" : "loading"} aria-labelledby="story-title">
    <div className="story-scene" ref={scene}>
      <div className="story-heading wrap"><div><p className="eyebrow">GODT HANDVERK, FRÅ INNSIDA</p><h2 id="story-title">Eit rom. Ei forvandling.</h2></div><a href="#services" className="story-skip">Til tenestene <span aria-hidden="true">↗</span></a></div>
      {cinematic && <div className="story-stage wrap">
        <div className="story-copy-stack">
          {chapters.map((chapter, index) => <article className="story-chapter" key={chapter.number} data-active={active === index} aria-hidden={active !== index}>
            <p className="story-overline"><span>{chapter.number} / 04</span>{chapter.label}</p>
            <h3>{chapter.title}<br /><em>{chapter.emphasis}</em></h3>
            <p className="story-description">{chapter.text}</p>
            <span className="story-detail"><span aria-hidden="true">↳</span>{chapter.detail}</span>
          </article>)}
          <nav className="story-controls" aria-label="Kapittel i handverkshistoria">{chapters.map((chapter, index) => <button type="button" key={chapter.number} onClick={() => jumpToChapter(index)} aria-current={active === index ? "step" : undefined} aria-label={`${chapter.number} ${chapter.label}`}><span>{chapter.number}</span><span className="chapter-name">{chapter.label}</span></button>)}</nav>
        </div>
        <div className="story-world" role="img" aria-label={`${chapters[active].label}: ${chapters[active].detail}. Illustrert baderom som blir bygd opp frå planteikning til ferdig rom.`}>
          <span className="world-orbit world-orbit-one" aria-hidden="true" /><span className="world-orbit world-orbit-two" aria-hidden="true" />
          <div className="story-canvas" ref={canvasHost} />
          {!ready && <div className="scene-loading" aria-hidden="true"><img src="/img/portfolio/5.jpg" alt="" /><span>Eit bad blir til.</span></div>}
        </div>
        <span className="story-giant-word" aria-hidden="true">{chapters[active].noun}</span>
      </div>}
      {!cinematic && <div className="story-fallback wrap">{chapters.map(chapter => <article key={chapter.number} className="story-chapter"><div><p className="story-overline"><span>{chapter.number} / 04</span>{chapter.label}</p><h3>{chapter.title}<br /><em>{chapter.emphasis}</em></h3><p className="story-description">{chapter.text}</p></div><img src={chapter.image} alt={chapter.alt} width="1200" height="1200" loading="lazy" /></article>)}</div>}
      {cinematic && <div className="story-bottom wrap"><span className="scroll-cue"><span className="scroll-mouse" aria-hidden="true" />RULL OG SJÅ ROMMET BLI TIL</span></div>}
    </div>
  </section>;
}
