"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CraftStory, ScrollEffects } from "./scroll-experience";
import { ContactForm } from "./contact-form";

const phone = "tel:+4740403681";
const email = "mailto:post@helleas.no";

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    diagonal: <><path d="M6 18 18 6M6 6h12v12" /></>,
    phone: <path d="m7 3 3 5-3 2c1 3 4 6 7 7l2-3 5 3c0 3-2 5-5 4C9 19 5 15 3 8 2 5 4 3 7 3Z" />,
    drop: <path d="M12 3C10 7 5 11 5 15a7 7 0 0 0 14 0c0-4-5-8-7-12ZM8 15a4 4 0 0 0 4 4" />,
    heat: <><path d="M7 20c-5-6 5-9 0-16M12 20c-5-6 5-9 0-16M17 20c-5-6 5-9 0-16" /></>,
    bath: <><path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3ZM5 12V5a3 3 0 0 1 6 0M7 20v2m10-2v2M9 6h4" /></>,
    tool: <path d="m14 6 4 4 3-3a6 6 0 0 1-8 7l-7 7-3-3 7-7a6 6 0 0 1 7-8l-3 3Z" />,
    home: <><path d="m3 11 9-8 9 8M5 9v12h14V9M9 21v-8h6v8" /></>,
    check: <><path d="m7 12 3 3 7-7" /><circle cx="12" cy="12" r="10" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
  };
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.arrow}</svg>;
}

function Brand() {
  return <span className="brand" aria-hidden="true"><img className="brand-logo" src="/img/helle-drop.svg" alt="" width="1240" height="1799" /><span className="brand-wordmark">helle<span>.</span></span></span>;
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return <>
    <a className="skip-link" href="#main">Hopp til innhald</a>
    <header className="site-header">
      <div className="nav-inner wrap">
        <a href="/" aria-label="Helle AS — heim"><Brand /></a>
        <nav className={menuOpen ? "site-nav is-open" : "site-nav"} id="site-navigation" aria-label="Hovudmeny">
          {[["Tenester", "services"], ["Om oss", "about"], ["Arbeidet vårt", "portfolio"], ["Kontakt oss", "contact"]].map(([label, id]) => <a key={id} className={id === "contact" ? "nav-contact" : undefined} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <a className="nav-phone" href={phone}><Icon name="phone" /><span>40 40 36 81</span><span className="phone-availability">24/7</span></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Lukk meny" : "Opne meny"} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} /></button>
      </div>
    </header>
  </>;
}

function HeroActions() {
  return <div className="hero-actions"><a href="#contact" className="button button-primary">Kontakt oss <Icon name="diagonal" /></a><a href="#services" className="button button-text">Sjå kva me kan <Icon name="arrow" /></a></div>;
}

function Hero() {
  return <>
    <section className="hero hero-signature wrap" data-hero="signature" aria-label="Velkomen til Helle AS">
      <div className="signature-kicker"><span className="eyebrow">DIN LOKALE RØYRLEGGJAR</span><span className="location-tag"><Icon name="pin" /> Bømlo, Noreg</span></div>
      <div className="signature-title"><h1>Vatn. Varme.<br /><span>Skikkeleg</span> handverk.</h1><div className="signature-stamp"><Icon name="drop" /><span>HEILT HELLE.<br />HEILT HEIME.</span></div></div>
      <div className="signature-bottom"><div className="signature-image"><img src="/img/portfolio/5.jpg" width="2081" height="2081" alt="Dusj og detaljar på badet" fetchPriority="high" /><span>Gode kvardagar byrjar heime.</span></div><div className="signature-intro"><p>Små drypp eller store draumar?<br />Me tek oss av det. Med stoltheit i faget og begge beina på Bømlo.</p><HeroActions /><div className="mini-trust"><Icon name="check" /> Meisterkompetanse <span>·</span> Service 24/7</div></div></div>
    </section>
    <div className="trust-strip"><div className="wrap"><span><Icon name="check" /> Røyrleggjarmeister</span><span><Icon name="pin" /> Lokalt på Bømlo</span><span><Icon name="clock" /> Tilgjengeleg 24/7</span><span><Icon name="tool" /> Små og store oppdrag</span></div></div>
  </>;
}

const services = [
  { number: "01", icon: "bath", name: "Bad & velvære", text: "Eit rom å trivast i. Me hjelper med dusj, toalett, møblar og alle dei viktige detaljane.", subject: "Eg vil snakka om bad" },
  { number: "02", icon: "drop", name: "Kjøkken & vatn", text: "Frå eit nytt blandebatteri til trygge vassinstallasjonar. Gode løysingar for kvardagen.", subject: "Eg vil snakka om kjøkken og vatn" },
  { number: "03", icon: "heat", name: "Varme & inneklima", text: "Varmepumper, vassboren golvvarme og ventilasjon. Rett temperatur, heile året.", subject: "Eg vil snakka om varme og inneklima" },
  { number: "04", icon: "home", name: "Nybygg & oppussing", text: "Ein god samarbeidspartnar frå planlegging til ferdig bygg. Me ser heilskapen.", subject: "Eg vil snakka om nybygg eller oppussing" },
];

function Services() {
  return <section className="services-section section-space" id="services"><div className="wrap"><div className="section-heading"><div><p className="eyebrow">01 / DETTE KAN ME</p><h2>Frå små drypp<br />til store planar.</h2></div><p>Ein god heim treng løysingar som fungerer.<br />Me tek hand om det som ligg bak.</p></div><div className="service-grid">{services.map((service) => <a className="service-card" key={service.number} href="#contact"><div className="service-card-top"><Icon name={service.icon} /><span>{service.number}</span></div><h3>{service.name}</h3><p>{service.text}</p><span className="service-card-action">La oss ta ein prat <Icon name="diagonal" /></span></a>)}</div><div className="emergency-strip"><span className="emergency-icon"><Icon name="phone" /></span><div><strong>Vatn på avvegar?</strong><p>Lekkasje, tett avløp eller kaldt vatn? Me er tilgjengelege 24/7.</p></div><a href={phone}>Ring 40 40 36 81 <Icon name="diagonal" /></a></div></div></section>;
}

function About() {
  return <section className="about-section section-space" id="about"><div className="wrap about-grid"><div className="about-visual"><span className="about-outline" aria-hidden="true" /><img src="/img/anders.png" alt="Anders Helle, røyrleggjarmeister og dagleg leiar" width="300" height="299" loading="lazy" /><div className="portrait-caption"><strong>Anders Helle</strong><span>Røyrleggjarmeister & dagleg leiar</span></div><span className="master-year">MEISTERBREV<br /><strong>2009</strong></span></div><div className="about-copy"><p className="eyebrow">02 / FOLKA BAK FAGET</p><h2>Ein røyrleggjar.<br /><em>Ein du kjenner.</em></h2><p>Me trur på korte avstandar, ærlege svar og arbeid me kan vera stolte av. Det er slik me byggjer gode kundeforhold på Bømlo.</p><p>Anders Helle tok meisterbrev i 2009 og har brei erfaring frå service, anlegg og prosjektleiing. Hos oss får du fagkunnskap og personleg oppfølging — frå første telefon til siste detalj.</p><div className="values"><span><Icon name="check" /> Me kjem som avtalt</span><span><Icon name="check" /> Me ryddar etter oss</span><span><Icon name="check" /> Me har auge for detaljane</span><span><Icon name="check" /> Me er stolte av faget</span></div><a href="#contact" className="text-link">Bli betre kjend med oss <Icon name="diagonal" /></a></div></div></section>;
}

const projects = [
  { image: "3", title: "Detaljane gjer forskjellen", category: "KJØKKEN & VATN", alt: "Forkromma blandebatteri ved ein kjøkkenvask" },
  { image: "5", title: "Ein betre start på dagen", category: "BAD & VELVÆRE", alt: "Dusjhovud med rennande vatn på eit flislagt bad" },
  { image: "1", title: "Trygt. Heilt frå innsida.", category: "VVS & INSTALLASJON", alt: "Røyr og ventilar i ein VVS-installasjon" },
  { image: "2", title: "Solide løysingar under bakken", category: "VATN & AVLØP", alt: "Vass- og avløpsinstallasjon i kum" },
  { image: "4", title: "Rett verktøy. Rett kunnskap.", category: "HANDVERK & SERVICE", alt: "Verktøy til røyrleggjararbeid" },
  { image: "6", title: "Plass til gode kvardagar", category: "BAD & OPPUSSING", alt: "Toalettinstallasjon på bad" },
];

function Portfolio() {
  const [showAll, setShowAll] = useState(false);
  const [activeImage, setActiveImage] = useState<(typeof projects)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  return <section className="portfolio-section section-space" id="portfolio"><div className="wrap"><div className="section-heading"><div><p className="eyebrow">03 / EIT BLIKK PÅ FAGET</p><h2>Handverk du kan sjå.<br />Kvalitet du kan kjenna.</h2></div><button type="button" className="text-link" aria-expanded={showAll} aria-controls="project-grid" onClick={() => setShowAll(!showAll)}>{showAll ? "Vis færre bilete" : "Sjå alle bileta"}<Icon name={showAll ? "close" : "diagonal"} /></button></div><div className="project-grid" id="project-grid">{projects.slice(0, showAll ? projects.length : 3).map((project) => <button className="project-card" key={project.image} type="button" aria-label={`Sjå større bilete: ${project.title}`} onClick={() => { setActiveImage(project); dialog.current?.showModal(); }}><div className="project-image"><img src={`/img/portfolio/${project.image}.jpg`} alt={project.alt} width="2080" height="2080" loading="lazy" /><span className="project-open"><Icon name="diagonal" /></span></div><span className="eyebrow">{project.category}</span><h3>{project.title}</h3></button>)}</div></div><dialog className="image-dialog" ref={dialog} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} aria-label={activeImage?.title || "Større bilete"}><button type="button" className="dialog-close" aria-label="Lukk bilete" onClick={() => dialog.current?.close()}><Icon name="close" /></button>{activeImage && <><img src={`/img/portfolio/${activeImage.image}.jpg`} alt={activeImage.alt} /><p>{activeImage.title}</p></>}</dialog></section>;
}

function Contact() {
  return <section className="contact-section section-space" id="contact"><div className="wrap contact-grid">
    <div className="contact-copy"><p className="eyebrow">LA OSS FINNA EI LØYSING</p>
      <div className="contact-top"><h2>Kva kan me<br /><em>hjelpa deg med?</em></h2><p>Små spørsmål eller store planar.<br />Me høyrer gjerne frå deg.</p></div>
      <div className="contact-methods"><a href={phone}><span><Icon name="phone" /> HASTAR DET? RING OSS · 24/7</span><strong>40 40 36 81</strong><Icon name="diagonal" /></a><a href={email}><span><Icon name="mail" /> DU KAN ÒG SENDA E-POST</span><strong>post@helleas.no</strong><Icon name="diagonal" /></a></div>
    </div>
    <ContactForm />
  </div></section>;
}

function Footer() {
  return <footer className="site-footer"><div className="wrap footer-main"><a href="/" aria-label="Helle AS — heim"><Brand /></a><p>Vatn. Varme. Bad.<br />Tryggleik, heilt enkelt.</p><div><span>Bremnes, Bømlo</span><a href="https://www.facebook.com/prororbomlo" target="_blank" rel="noreferrer">Følg oss på Facebook <Icon name="diagonal" /></a></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Helle AS</span><span>Lokalt handverk. Med stoltheit.</span><a href="#main">Til toppen ↑</a></div></footer>;
}

export function HomePage() {
  return <><ScrollEffects /><SiteHeader /><main id="main"><Hero /><CraftStory /><Services /><About /><Portfolio /><Contact /></main><Footer /></>;
}
