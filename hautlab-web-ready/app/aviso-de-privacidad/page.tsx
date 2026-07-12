import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Mail, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";

const privacyUrl = `${siteConfig.url}/aviso-de-privacidad`;

export const metadata: Metadata = {
  title: "Aviso de Privacidad Integral | HAUTLAB",
  description: "Aviso de Privacidad Integral de Dr. Salvador Cordero Romero / HAUTLAB para pacientes, prospectos y titulares de datos personales.",
  alternates: { canonical: privacyUrl },
  openGraph: {
    title: "Aviso de Privacidad Integral | HAUTLAB",
    description: "Consulta el Aviso de Privacidad Integral de HAUTLAB y los mecanismos para ejercer derechos ARCO.",
    url: privacyUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Aviso de Privacidad Integral | HAUTLAB",
    description: "Consulta el Aviso de Privacidad Integral de HAUTLAB y los mecanismos para ejercer derechos ARCO."
  }
};

function PrivacySection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-9 first:border-t-0 first:pt-0">
      <p className="text-xs uppercase tracking-[0.18em] text-champagne">{number}</p>
      <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-bone">{title}</h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-muted">{children}</div>
    </section>
  );
}

const listClass = "ml-5 list-disc space-y-2 marker:text-champagne";

export default function PrivacyPage() {
  const emailHref = `mailto:${siteConfig.privacyEmail}?subject=Solicitud%20de%20privacidad%20o%20derechos%20ARCO`;

  return (
    <main>
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Aviso de privacidad" }]} />

      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.24em] text-champagne">Documento institucional</p>
            <h1 className="max-w-5xl font-serif text-[clamp(3rem,7vw,6.2rem)] leading-[.9] tracking-[-.065em] text-bone">
              Aviso de Privacidad Integral.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
              Dr. Salvador Cordero Romero, quien opera profesionalmente como Dr. Salvador Cordero / HAUTLAB.
            </p>
          </div>

          <Card className="p-7">
            <ShieldCheck className="h-6 w-6 text-champagne" />
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-champagne">Consulta pública</p>
            <p className="mt-3 text-sm leading-7 text-muted">Última actualización del documento integral: {siteConfig.privacyUpdated}.</p>
            <p className="mt-3 text-sm leading-7 text-muted">Correo de privacidad: {siteConfig.privacyEmail}</p>
          </Card>
        </div>
      </section>

      <section className="border-b border-line bg-background py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[.32fr_.68fr] lg:gap-14">
          <aside className="h-fit lg:sticky lg:top-28">
            <Card className="p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Control de privacidad</p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Puedes limitar finalidades secundarias, ejercer derechos ARCO o modificar la analítica opcional del sitio.
              </p>
              <div className="mt-6 grid gap-3">
                <a href={emailHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-champagne px-5 text-sm font-medium text-background transition hover:bg-bone">
                  <Mail className="h-4 w-4" /> Contactar por privacidad
                </a>
                <CookieSettingsButton
                  label="Cambiar analítica"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white/[0.03] px-5 text-sm font-medium text-bone transition hover:border-bone/30 hover:bg-white/[0.06]"
                />
                <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm text-muted transition hover:text-bone">
                  <ArrowLeft className="h-4 w-4" /> Volver al inicio
                </Link>
              </div>
            </Card>
          </aside>

          <article className="space-y-10">
            <PrivacySection number="I" title="Identidad y domicilio del responsable">
              <p>
                El responsable del tratamiento de sus datos personales es <strong className="font-medium text-bone">Dr. Salvador Cordero Romero</strong>, quien opera profesionalmente como Dr. Salvador Cordero / HAUTLAB, con domicilio para efectos de privacidad en {siteConfig.address}, México.
              </p>
              <p>Correo para asuntos de privacidad y ejercicio de derechos ARCO: <a className="text-bone underline decoration-line underline-offset-4" href={emailHref}>{siteConfig.privacyEmail}</a>.</p>
            </PrivacySection>

            <PrivacySection number="II" title="Datos personales que podemos recabar">
              <p>Para brindar atención médica, administrativa y de seguimiento, el Responsable podrá recabar:</p>
              <ul className={listClass}>
                <li><strong className="text-bone">Identificación:</strong> nombre, edad, fecha de nacimiento, sexo, firma e identificación oficial cuando sea necesaria.</li>
                <li><strong className="text-bone">Contacto:</strong> teléfono, WhatsApp, correo, domicilio, ciudad y medios proporcionados por la persona titular.</li>
                <li><strong className="text-bone">Agenda y administración:</strong> cita, motivo de consulta, confirmaciones, cancelaciones, pagos, anticipos y preferencias de comunicación.</li>
                <li><strong className="text-bone">Facturación:</strong> RFC, razón social, régimen fiscal, código postal fiscal y constancia de situación fiscal.</li>
                <li><strong className="text-bone">Pago:</strong> comprobantes, referencias y datos relacionados con links o plataformas de cobro. HAUTLAB no almacena la información completa de tarjetas procesadas por terceros.</li>
                <li><strong className="text-bone">Clínicos y de salud:</strong> antecedentes, medicamentos, alergias, padecimientos, diagnósticos, evolución, notas, recetas, estudios, cuestionarios, fotografías y videos clínicos.</li>
              </ul>
              <p>Los datos de salud, antecedentes médicos, evolución clínica e imágenes clínicas identificables son datos personales sensibles.</p>
            </PrivacySection>

            <PrivacySection number="III" title="Finalidades primarias">
              <p>Los datos podrán utilizarse para:</p>
              <ul className={listClass}>
                <li>Identificar al paciente o posible paciente y organizar citas.</li>
                <li>Brindar orientación administrativa previa a la consulta.</li>
                <li>Integrar, actualizar y conservar el expediente clínico.</li>
                <li>Realizar valoración, documentar hallazgos, evolución, indicaciones y seguimiento.</li>
                <li>Emitir recetas, notas, constancias, presupuestos, consentimientos y documentos relacionados con la atención.</li>
                <li>Evaluar seguridad clínica, respuesta terapéutica y posibles efectos adversos.</li>
                <li>Gestionar pagos, anticipos, comprobantes y facturación.</li>
                <li>Cumplir obligaciones sanitarias, fiscales, contractuales, regulatorias y legales.</li>
                <li>Mantener comunicación por WhatsApp, teléfono, correo o medios proporcionados por el paciente.</li>
              </ul>
            </PrivacySection>

            <PrivacySection number="IV" title="Finalidades secundarias">
              <p>Cuando sea procedente, los datos podrán utilizarse para recordatorios generales, información educativa, disponibilidad de agenda, campañas, encuestas de satisfacción y análisis internos de calidad.</p>
              <p>Puedes oponerte a estas finalidades escribiendo a {siteConfig.privacyEmail}. La negativa no será motivo para negar la atención solicitada.</p>
            </PrivacySection>

            <PrivacySection number="V" title="Fotografías, videos y uso de imagen">
              <p>Las fotografías y videos clínicos podrán utilizarse para expediente, valoración, seguimiento, comparación evolutiva, seguridad y documentación interna.</p>
              <p>La publicación de imágenes, testimonios, casos clínicos o material de antes y después para docencia, publicidad, redes sociales, página web o difusión pública requiere consentimiento específico, separado y por escrito.</p>
              <p>Autorizar la atención o el seguimiento digital no autoriza automáticamente la publicación de imágenes o resultados.</p>
            </PrivacySection>

            <PrivacySection number="VI" title="WhatsApp y canales digitales">
              <p>WhatsApp, correo, formularios, redes sociales y otros canales externos pueden implicar riesgos propios de sus plataformas. Se utilizan para agenda, orientación administrativa, indicaciones generales, seguimiento, comprobantes y coordinación de la atención.</p>
              <p>WhatsApp no sustituye una consulta médica formal y no debe utilizarse para urgencias. Ante dificultad respiratoria, pérdida súbita de visión, dolor intenso, sangrado importante, infección severa o deterioro progresivo, acude de inmediato a un servicio de urgencias.</p>
            </PrivacySection>

            <PrivacySection number="VII" title="Plataformas y terceros tecnológicos">
              <p>El Responsable podrá apoyarse en sistemas de expediente como Nimbo, WhatsApp Business y Meta, procesadores de pago como Mercado Pago o Stripe, correo, almacenamiento, agenda, facturación, soporte administrativo y proveedores sanitarios cuando sea necesario.</p>
              <p>Los terceros deberán tratar los datos conforme a las instrucciones aplicables, obligaciones de confidencialidad y sus propios avisos o condiciones de privacidad.</p>
            </PrivacySection>

            <PrivacySection number="VIII" title="Transferencias de datos personales">
              <p>Los datos podrán compartirse cuando sea necesario para cumplir obligaciones legales, fiscales, sanitarias o judiciales; atender requerimientos de autoridad; proteger derechos; realizar referencias, estudios o interconsultas; gestionar pagos y facturación; o atender una urgencia.</p>
              <p>Los datos no serán vendidos ni rentados para fines ajenos a la atención, administración o cumplimiento legal.</p>
            </PrivacySection>

            <PrivacySection number="IX" title="Menores de edad y representación">
              <p>Los datos de menores de edad o personas que no puedan consentir por sí mismas deberán ser proporcionados por madre, padre, tutor o representante autorizado. Podrá solicitarse documentación que acredite la representación.</p>
            </PrivacySection>

            <PrivacySection number="X" title="Seguridad y confidencialidad">
              <p>Se implementan medidas administrativas, técnicas y físicas razonables para proteger los datos contra daño, pérdida, alteración, destrucción, uso o acceso no autorizado.</p>
              <p>El acceso se limita al personal, colaboradores, encargados o proveedores que necesiten la información para cumplir sus funciones y deban guardar confidencialidad.</p>
            </PrivacySection>

            <PrivacySection number="XI" title="Conservación de datos">
              <p>Los datos se conservarán durante el tiempo necesario para la atención, expediente clínico, obligaciones legales, fiscales, administrativas y sanitarias, así como posibles responsabilidades profesionales.</p>
              <p>Una vez cumplidas las finalidades, podrán bloquearse, resguardarse, disociarse o eliminarse conforme a los plazos aplicables. La revocación no tendrá efectos retroactivos ni obligará a eliminar información que deba conservarse legalmente.</p>
            </PrivacySection>

            <PrivacySection number="XII" title="Derechos ARCO y revocación">
              <p>Puedes solicitar acceso, rectificación, cancelación u oposición, así como revocar el consentimiento cuando legalmente proceda, escribiendo a {siteConfig.privacyEmail}.</p>
              <p>La solicitud deberá incluir:</p>
              <ul className={listClass}>
                <li>Nombre completo y medio para recibir respuesta.</li>
                <li>Documento que acredite identidad o representación, cuando corresponda.</li>
                <li>Descripción clara del derecho que deseas ejercer.</li>
                <li>Datos personales involucrados y elementos que faciliten su localización.</li>
              </ul>
              <p>La respuesta se realizará conforme a los plazos y procedimientos previstos por la legislación aplicable.</p>
            </PrivacySection>

            <PrivacySection number="XIII" title="Limitación del uso o divulgación">
              <p>Puedes limitar comunicaciones informativas o finalidades secundarias enviando un correo a {siteConfig.privacyEmail}. Esto no afectará mensajes necesarios para citas, seguimiento, pagos, facturación, cumplimiento legal o seguridad del paciente.</p>
            </PrivacySection>

            <PrivacySection number="XIV" title="Herramientas digitales e inteligencia artificial">
              <p>Algunas respuestas administrativas iniciales pueden recibir asistencia de herramientas digitales, automatización o inteligencia artificial supervisada para agenda, ubicación, costos, preparación general, pagos y canalización.</p>
              <p>Estas herramientas no sustituyen la valoración médica, no emiten diagnósticos ni prescriben tratamientos y deben escalar dudas clínicas, complicaciones, imágenes médicas, urgencias o casos sensibles al equipo humano.</p>
            </PrivacySection>

            <PrivacySection number="XV" title="Cookies, sitio web y analítica">
              <div className="rounded-3xl border border-line bg-white/[0.025] p-5">
                <div className="flex items-start gap-3">
                  <SlidersHorizontal className="mt-1 h-5 w-5 shrink-0 text-champagne" />
                  <div>
                    <p className="font-medium text-bone">Implementación actual del sitio</p>
                    <p className="mt-2">El formulario de contacto no guarda su contenido en una base de datos del sitio; prepara un mensaje que la persona decide enviar por WhatsApp.</p>
                    <p className="mt-2">La analítica de Meta permanece desactivada hasta la aceptación expresa. Cuando se acepta, solo se activa en páginas generales —inicio y pagos—, con configuración automática deshabilitada.</p>
                    <p className="mt-2">No se envían al píxel nombres, teléfonos, mensajes, diagnósticos, fotografías clínicas ni parámetros que identifiquen un tratamiento o condición específica.</p>
                  </div>
                </div>
              </div>
              <p>La preferencia puede modificarse en cualquier momento mediante el botón “Preferencias de cookies” disponible en el footer.</p>
            </PrivacySection>

            <PrivacySection number="XVI" title="Cambios al aviso">
              <p>El aviso podrá modificarse por cambios legales, regulatorios, operativos o tecnológicos. Las actualizaciones se publicarán en {siteConfig.url}/aviso-de-privacidad.</p>
            </PrivacySection>

            <PrivacySection number="XVII" title="Consentimiento">
              <p>Al proporcionar datos por medios físicos, digitales, WhatsApp, formularios, expediente, agenda o consulta, la persona titular reconoce haber sido informada sobre su tratamiento conforme a este aviso.</p>
              <p>Los datos sensibles, imágenes clínicas, publicación de testimonios, antes y después u otras finalidades específicas podrán requerir consentimiento expreso y separado mediante un mecanismo legalmente aplicable.</p>
            </PrivacySection>
          </article>
        </div>
      </section>
    </main>
  );
}
