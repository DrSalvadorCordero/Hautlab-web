"use client";

import { Mic, PhoneOff, Volume2 } from "lucide-react";
import { useRef, useState } from "react";

type SessionResponse = {
  session?: { id?: string };
  transport?: { type?: string; sdp?: string };
  error?: string;
};

type VoiceStatus = "idle" | "connecting" | "connected" | "ending" | "error";

export function VoiceReceptionLab() {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function cleanup() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    channelRef.current?.close();
    channelRef.current = null;
    peerRef.current?.getSenders().forEach((sender) => sender.track?.stop());
    peerRef.current?.close();
    peerRef.current = null;
    mediaRef.current?.getTracks().forEach((track) => track.stop());
    mediaRef.current = null;
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    setSessionId(null);
  }

  async function waitForIce(connection: RTCPeerConnection) {
    if (connection.iceGatheringState === "complete") return;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        connection.removeEventListener("icegatheringstatechange", onState);
        reject(new Error("No se pudo completar la conexión de audio."));
      }, 10_000);

      function onState() {
        if (connection.iceGatheringState !== "complete") return;
        clearTimeout(timer);
        connection.removeEventListener("icegatheringstatechange", onState);
        resolve();
      }

      connection.addEventListener("icegatheringstatechange", onState);
      onState();
    });
  }

  async function start() {
    if (status === "connecting" || status === "connected") return;
    cleanup();
    setError(null);
    setStatus("connecting");

    try {
      const connection = new RTCPeerConnection();
      peerRef.current = connection;

      connection.addEventListener("track", (event) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.srcObject = new MediaStream([event.track]);
        void audio.play().catch(() => undefined);
      });

      const microphone = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaRef.current = microphone;
      for (const track of microphone.getAudioTracks()) {
        connection.addTrack(track, microphone);
      }

      const events = connection.createDataChannel("oai-events");
      channelRef.current = events;

      events.addEventListener("message", ({ data }) => {
        let event: {
          type?: string;
          session?: { id?: string };
          client_event_id?: string;
          error?: { message?: string };
        };
        try {
          event = JSON.parse(String(data));
        } catch {
          return;
        }

        if (event.type === "session.started") {
          setStatus("connected");
          setSessionId(event.session?.id ?? null);

          const instructionId = "hautlab-greeting-" + Date.now();
          events.send(
            JSON.stringify({
              type: "session.instructions.append",
              event_id: instructionId,
              delegation_id: null,
              content:
                "Habla primero ahora, en español de México, con un saludo de recepción muy breve. Preséntate como asistente virtual de recepción de HAUTLAB, pregunta en qué puedes ayudar y después escucha.",
            }),
          );
          return;
        }

        if (
          event.type === "session.instructions.appended" &&
          typeof event.client_event_id === "string" &&
          event.client_event_id.startsWith("hautlab-greeting-")
        ) {
          events.send(
            JSON.stringify({
              type: "session.commentary.append",
              event_id: "hautlab-begin-" + Date.now(),
              delegation_id: null,
              content: "Comienza la conversación ahora siguiendo las instrucciones.",
            }),
          );
          return;
        }

        if (event.type === "session.closed") {
          cleanup();
          setStatus("idle");
          return;
        }

        if (event.type === "error") {
          setError(event.error?.message ?? "La sesión de voz reportó un error.");
        }
      });

      events.addEventListener("close", () => {
        if (status !== "ending") {
          cleanup();
          setStatus("idle");
        }
      });

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      await waitForIce(connection);

      const sdp = connection.localDescription?.sdp;
      if (!sdp) throw new Error("No se pudo generar la conexión WebRTC.");

      const response = await fetch("/api/admin/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp }),
      });
      const result = (await response.json().catch(() => ({}))) as SessionResponse;

      if (!response.ok || !result.transport?.sdp) {
        throw new Error(result.error ?? "No se pudo iniciar GPT-Live.");
      }

      setSessionId(result.session?.id ?? null);
      await connection.setRemoteDescription({
        type: "answer",
        sdp: result.transport.sdp,
      });
    } catch (startError) {
      cleanup();
      setStatus("error");
      setError(
        startError instanceof Error
          ? startError.message
          : "No se pudo iniciar la conversación.",
      );
    }
  }

  function stop() {
    const events = channelRef.current;
    if (!events || events.readyState !== "open") {
      cleanup();
      setStatus("idle");
      return;
    }

    setStatus("ending");
    events.send(JSON.stringify({ type: "session.close" }));
    closeTimerRef.current = setTimeout(() => {
      cleanup();
      setStatus("idle");
    }, 12_000);
  }

  const connected = status === "connected";
  const busy = status === "connecting" || status === "ending";

  return (
    <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">
            Recepción por voz · OpenAI
          </p>
          <h2 className="mt-2 font-serif text-2xl text-bone sm:text-3xl">
            HAUTLAB Voice Lab
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Prueba aquí el recepcionista de voz antes de conectarlo al número telefónico.
            Usa GPT-Live, el conocimiento aprobado de HAUTLAB y límites clínicos de recepción.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
          <span
            className={[
              "h-2 w-2 rounded-full",
              connected ? "bg-emerald-300" : busy ? "bg-amber-300" : "bg-white/30",
            ].join(" ")}
          />
          {status === "connecting"
            ? "Conectando"
            : status === "connected"
              ? "En conversación"
              : status === "ending"
                ? "Finalizando"
                : status === "error"
                  ? "Error"
                  : "Listo para probar"}
        </div>
      </div>

      {error ? (
        <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!connected ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void start()}
            className="inline-flex items-center gap-2 rounded-full border border-champagne/30 bg-champagne/[0.08] px-5 py-2.5 text-sm text-bone transition hover:bg-champagne/[0.12] disabled:opacity-40"
          >
            <Mic className="h-4 w-4" />
            {status === "connecting" ? "Conectando…" : "Probar recepcionista"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/[0.04] px-5 py-2.5 text-sm text-red-100 transition hover:bg-red-400/[0.08]"
          >
            <PhoneOff className="h-4 w-4" />
            Terminar conversación
          </button>
        )}

        <div className="inline-flex items-center gap-2 text-xs text-muted">
          <Volume2 className="h-4 w-4" />
          Micrófono + altavoz del dispositivo
        </div>
      </div>

      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-black/10 p-4">
          <p className="text-xs text-muted">Modelo</p>
          <p className="mt-2 text-sm text-bone">GPT-Live-1</p>
        </div>
        <div className="rounded-2xl border border-line bg-black/10 p-4">
          <p className="text-xs text-muted">Voz</p>
          <p className="mt-2 text-sm text-bone">Marin</p>
        </div>
        <div className="rounded-2xl border border-line bg-black/10 p-4">
          <p className="text-xs text-muted">Sesión</p>
          <p className="mt-2 truncate text-sm text-bone">
            {sessionId ?? "—"}
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-muted">
        Esta prueba todavía no recibe llamadas WIM ni transfiere llamadas. Esa capa se activa
        cuando exista un destino SIP o desvío telefónico. El comportamiento conversacional ya
        puede probarse desde este panel.
      </p>
    </section>
  );
}
