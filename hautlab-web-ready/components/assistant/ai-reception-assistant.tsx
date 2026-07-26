"use client";

import Link from "next/link";
import { Bot, ExternalLink, Loader2, MessageCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { assistantQuickQuestions, assistantWelcome } from "@/lib/assistant-knowledge";
import { trackHautlabEvent } from "@/lib/client-analytics";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const MAX_INPUT_LENGTH = 1_000;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AssistantApiResponse = {
  reply?: string;
  error?: string;
};

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: assistantWelcome
};

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content
  };
}

export function AIReceptionAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasUserMessages = messages.some((message) => message.role === "user");

  const whatsappHref = useMemo(() => {
    const recentQuestions = messages
      .filter((message) => message.role === "user")
      .slice(-3)
      .map((message) => `• ${message.content.replace(/\s+/g, " ").trim()}`)
      .join("\n");

    const summary = recentQuestions
      ? `Hola, vengo del asistente virtual de HAUTLAB. Quiero continuar por WhatsApp. Mis preguntas fueron:\n${recentQuestions}`
      : "Hola, vengo del asistente virtual de HAUTLAB y quiero agendar una valoración.";

    return buildWhatsAppLink(summary.slice(0, 900));
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function openAssistant() {
    setOpen(true);
    trackHautlabEvent("ai_assistant_open");
  }

  async function sendMessage(rawMessage: string) {
    const cleanMessage = rawMessage.trim().slice(0, MAX_INPUT_LENGTH);
    if (!cleanMessage || loading) return;

    const userMessage = createMessage("user", cleanMessage);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);
    trackHautlabEvent("ai_assistant_message");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .slice(-10)
            .map(({ role, content }) => ({ role, content }))
        })
      });

      const payload = (await response.json()) as AssistantApiResponse;
      const reply = payload.reply;
      if (!response.ok || !reply) {
        throw new Error(payload.error || "No pude responder en este momento.");
      }

      setMessages((current) => [...current, createMessage("assistant", reply)]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No pude responder en este momento."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openAssistant}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[90] inline-flex min-h-12 items-center gap-3 rounded-full border border-bone/15 bg-[#11100e]/95 px-4 py-3 text-sm font-medium text-bone shadow-calm backdrop-blur-xl transition hover:border-champagne/45 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/50 sm:bottom-6 sm:right-6"
          aria-label="Abrir asistente virtual de HAUTLAB"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-champagne text-background">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Pregunta a HAUTLAB</span>
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-title"
          className="fixed inset-x-3 bottom-3 z-[90] flex max-h-[min(760px,calc(100dvh-24px))] flex-col overflow-hidden rounded-[1.75rem] border border-bone/15 bg-[#0d0c0b]/98 shadow-calm backdrop-blur-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[660px] sm:max-h-[calc(100dvh-48px)] sm:w-[410px]"
        >
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white/[0.04] text-champagne">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p id="assistant-title" className="truncate text-sm font-medium text-bone">
                  Asistente HAUTLAB
                </p>
                <p className="mt-0.5 text-xs text-quiet">Información general y agenda</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-white/[0.05] hover:text-bone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/50"
              aria-label="Cerrar asistente"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-white/[0.035] text-champagne">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                )}
                <div
                  className={`max-w-[84%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-br-lg bg-champagne text-background"
                      : "rounded-bl-lg border border-line bg-white/[0.035] text-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {!hasUserMessages && (
              <div className="grid gap-2 pt-1">
                {assistantQuickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void sendMessage(question)}
                    className="rounded-2xl border border-line bg-white/[0.025] px-4 py-3 text-left text-xs leading-5 text-muted transition hover:border-bone/25 hover:bg-white/[0.05] hover:text-bone"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2.5 text-xs text-quiet" aria-live="polite">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white/[0.035] text-champagne">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </span>
                Preparando una respuesta…
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-champagne/20 bg-champagne/[0.06] px-4 py-3 text-xs leading-5 text-muted" role="alert">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-line bg-[#0b0a09] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-5">
            {hasUserMessages && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackHautlabEvent("ai_assistant_handoff")}
                className="mb-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-champagne/30 bg-champagne/[0.08] px-4 text-xs font-medium text-bone transition hover:bg-champagne/[0.14]"
              >
                Continuar por WhatsApp <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <div className="flex items-end gap-2">
              <label htmlFor="hautlab-assistant-input" className="sr-only">
                Escribe tu pregunta
              </label>
              <textarea
                ref={inputRef}
                id="hautlab-assistant-input"
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT_LENGTH))}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={MAX_INPUT_LENGTH}
                placeholder="Escribe una pregunta general…"
                className="max-h-28 min-h-12 flex-1 resize-none rounded-2xl border border-line bg-white/[0.035] px-4 py-3 text-sm leading-6 text-bone outline-none transition placeholder:text-quiet focus:border-champagne/45"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => void sendMessage(input)}
                disabled={loading || !input.trim()}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-champagne text-background transition hover:bg-bone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Enviar pregunta"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-quiet">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-champagne" />
              <p>
                No compartas datos sensibles o imágenes. Este asistente no diagnostica ni sustituye una consulta. Consulta el{" "}
                <Link href="/aviso-de-privacidad" className="text-muted underline decoration-line underline-offset-2">
                  aviso de privacidad
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
