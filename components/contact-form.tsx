"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const sending = useRef(false);
  const result = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    for (const name of ["name", "email", "message"]) {
      const input = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
      input.value = input.value.trim();
    }
    if (!form.reportValidity()) return;

    const body = new URLSearchParams();
    new FormData(form).forEach((value, name) => body.append(name, String(value)));
    sending.current = true;
    setStatus("sending");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      // Netlify detects the matching static form in public/__forms.html.
      // Posting to that real HTML file also works without a Next.js server.
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Form submission was not accepted");
      form.reset();
      setStatus("success");
    } catch {
      // Preserve the message so the visitor can retry or copy it into an email.
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      sending.current = false;
      requestAnimationFrame(() => result.current?.focus());
    }
  }

  return <div className="contact-form-card">
    <h3 id="contact-form-heading">Fortel oss kva du treng.</h3>
    <p className="form-intro">Skriv nokre ord, så tek me kontakt.</p>
    <form name="kontakt" method="POST" action="/takk.html" aria-labelledby="contact-form-heading" onSubmit={submit}>
      <input type="hidden" name="form-name" value="kontakt" />
      <input type="hidden" name="subject" value="Ny førespurnad frå helleas.no" />
      <p hidden><label>Ikkje fyll ut dette feltet<input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
      <fieldset disabled={status === "sending"}>
        <legend className="visually-hidden">Kontaktopplysningar og melding</legend>
        <div className="form-fields">
          <label htmlFor="contact-name">Namn<input id="contact-name" name="name" autoComplete="name" required maxLength={100} /></label>
          <label htmlFor="contact-phone">Telefon <span>(valfritt)</span><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
          <label className="form-field-wide" htmlFor="contact-email">E-post<input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label className="form-field-wide" htmlFor="contact-message">Kva kan me hjelpa deg med?<textarea id="contact-message" name="message" rows={5} required maxLength={5000} placeholder="Til dømes eit nytt bad, ein lekkasje eller eit spørsmål …" /></label>
        </div>
        <p className="form-privacy">Me bruker kontaktopplysningane dine til å svara på førespurnaden.</p>
        <button type="submit" className="button button-primary form-submit">{status === "sending" ? "Sender …" : "Send melding"}<span aria-hidden="true">↗</span></button>
      </fieldset>
      <div ref={result} className={`form-result form-result-${status}`} role="status" aria-live="polite" aria-atomic="true" tabIndex={-1}>
        {status === "success" && <><strong>Takk! Me har fått meldinga di.</strong><span>Me tek kontakt så snart me kan.</span></>}
        {status === "error" && <><strong>Me fekk ikkje stadfesta at meldinga kom fram.</strong><span>Prøv igjen, eller ring <a href="tel:+4740403681">40 40 36 81</a>. Du kan òg skriva til <a href="mailto:post@helleas.no">post@helleas.no</a>.</span></>}
        {status === "sending" && <span>Meldinga di blir send …</span>}
      </div>
    </form>
  </div>;
}
