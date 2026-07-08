export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(242,238,231,.12)",
        background: "linear-gradient(180deg, rgba(13,13,12,.92), #070706)",
        padding: "34px 0",
        color: "#b9afa2"
      }}
    >
      <div className="container" style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, color: "#f2eee7", letterSpacing: ".16em", textTransform: "uppercase", fontSize: 12 }}>
              DR. SALVADOR CORDERO | HAUTLAB
            </p>
            <p style={{ margin: "10px 0 0", maxWidth: 560, lineHeight: 1.6 }}>
              Dermatología clínica y medicina estética en Mérida, Yucatán. Precisión médica. Estética contenida.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14, fontSize: 13 }}>
              <a href="/procedimientos" style={{ color: "#b9afa2" }}>Procedimientos</a>
              <a href="/pagos" style={{ color: "#b9afa2" }}>Pagos</a>
              <a href="/rinomodelacion" style={{ color: "#b9afa2" }}>Rinomodelación</a>
              <a href="/botox" style={{ color: "#b9afa2" }}>Botox</a>
            </div>
          </div>
          <div style={{ textAlign: "right", lineHeight: 1.8 }}>
            <a href="https://wa.me/529992809758" target="_blank" rel="noreferrer" style={{ color: "#f2eee7" }}>WhatsApp 999 280 9758</a><br />
            <a href="mailto:dr.salvadorcordero@gmail.com" style={{ color: "#b9afa2" }}>dr.salvadorcordero@gmail.com</a><br />
            <span>Calle 43 #299A x 32A, San Ramón Norte, Mérida</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", borderTop: "1px solid rgba(242,238,231,.10)", paddingTop: 16, fontSize: 12 }}>
          <span>© {year} HAUTLAB. Todos los derechos reservados.</span>
          <span>Dr. Salvador Cordero Romero · Uso informativo · La valoración médica no sustituye una consulta presencial.</span>
        </div>
      </div>
    </footer>
  );
}
