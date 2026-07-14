"use client";

import { useState } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function LeadForm() {
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = [
      "Hola, quiero agendar una valoración con el Dr. Salvador Cordero.",
      name ? `Mi nombre es: ${name}.` : "",
      interest ? `Me interesa: ${interest}.` : "",
      message ? `Comentario: ${message}.` : ""
    ]
      .filter(Boolean)
      .join(" ");

    window.location.href = buildWhatsAppLink(text);
  }

  return (
    <form id="lead-form" className="form" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        name="name"
        placeholder="Nombre"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        className="input"
        type="text"
        name="interest"
        placeholder="Tratamiento o motivo de consulta"
        value={interest}
        onChange={(event) => setInterest(event.target.value)}
      />
      <textarea
        className="textarea"
        name="message"
        placeholder="Cuéntanos brevemente qué te gustaría mejorar o revisar."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button className="button button-primary" type="submit">
        Enviar por WhatsApp
      </button>
      <p className="form-note">
        Este formulario abre WhatsApp con tu mensaje precargado. No sustituye una valoración médica.
      </p>
    </form>
  );
}
