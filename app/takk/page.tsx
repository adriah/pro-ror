import type { Metadata } from "next";

export const metadata: Metadata = { title: "Takk for meldinga", robots: { index: false, follow: false } };

export default function ThankYouPage() {
  return <main id="main" className="thank-you wrap section-space">
    <a href="/" aria-label="Helle AS — heim" className="brand"><img className="brand-logo" src="/img/helle-drop.svg" alt="" width="1240" height="1799" /><span className="brand-wordmark">helle<span>.</span></span></a>
    <p className="eyebrow">MELDINGA ER MOTTEKEN</p>
    <h1>Takk for at du<br /><em>tok kontakt.</em></h1>
    <p>Me svarar så snart me kan. Hastar det, ring oss på <a href="tel:+4740403681">40 40 36 81</a>.</p>
    <a className="button button-primary" href="/">Tilbake til framsida <span aria-hidden="true">↗</span></a>
  </main>;
}
