/* ============================================================
   TALISMÁN — Cupones · Panel de gestión + alta manual
   (reutiliza el sistema visual; no cambia el diseño)
   ============================================================ */
const { useState: _cuS } = React;

/* ---------- Helpers de presentación ---------- */
function cuponTipoLabel(t) { return t === "monto" ? "Monto fijo" : "Porcentaje"; }
function cuponValorLabel(c) { return c.tipo === "monto" ? window.money0(c.valor) : (c.valor + "%"); }

/* ============================================================
   MODAL: Nuevo cupón
   ============================================================ */
function NuevoCuponModal({ onClose }) {
  const { addCupon, cupones, toast } = window.useStore();
  const [codigo, setCodigo] = _cuS("");
  const [tipo, setTipo] = _cuS("pct");          // pct | monto
  const [valor, setValor] = _cuS("");
  const [vence, setVence] = _cuS("");
  const [maxUsos, setMaxUsos] = _cuS("");        // opcional
  const [activo, setActivo] = _cuS(true);

  const guardar = () => {
    const code = codigo.trim().toUpperCase();
    if (!code) return toast("Ingresa un código", "warn");
    if (cupones.some(c => c.codigo.toUpperCase() === code)) return toast("Ya existe un cupón con ese código", "warn");
    const v = parseFloat(valor);
    if (!v || v <= 0) return toast("Ingresa un valor válido", "warn");
    if (tipo === "pct" && v > 100) return toast("El porcentaje no puede superar 100%", "warn");
    addCupon({ codigo: code, tipo, valor: v, vence, maxUsos, activo });
    onClose();
  };

  const field = (label, node, style) => React.createElement("label", { className: "field", style: Object.assign({ flex: 1 }, style) },
    React.createElement("span", { className: "field__label" }, label), node);

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(460px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Promociones"),
          React.createElement("h2", { style: { margin: "0 0 16px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700 } }, "Nuevo cupón"),

          // Código
          field("Código", React.createElement("input", { className: "input", placeholder: "Ej: VERANO20", value: codigo, onChange: e => setCodigo(e.target.value), style: { textTransform: "uppercase" } }), { display: "block", marginBottom: 12 }),

          // Tipo + Valor
          React.createElement("div", { className: "row gap10", style: { marginBottom: 12 } },
            field("Tipo", React.createElement("div", { className: "seg", style: { display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%" } },
              [["pct", "Porcentaje"], ["monto", "Monto"]].map(([k, l]) =>
                React.createElement("button", { key: k, className: tipo === k ? "is-active" : "", style: { justifyContent: "center" }, onClick: () => setTipo(k) }, l)))),
            field(tipo === "monto" ? "Valor (S/)" : "Valor (%)", React.createElement("input", { className: "input", type: "number", placeholder: tipo === "monto" ? "0.00" : "0", value: valor, onChange: e => setValor(e.target.value) }))),

          // Fecha de expiración + Límite de uso
          React.createElement("div", { className: "row gap10", style: { marginBottom: 12 } },
            field("Fecha de expiración", React.createElement("input", { className: "input", type: "date", value: vence, onChange: e => setVence(e.target.value) })),
            field("Límite de uso (opcional)", React.createElement("input", { className: "input", type: "number", placeholder: "Sin límite", value: maxUsos, onChange: e => setMaxUsos(e.target.value) }))),

          // Estado
          React.createElement("div", { className: "field__label" }, "Estado"),
          React.createElement("div", { className: "seg", style: { display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", marginBottom: 20 } },
            [[true, "Activo"], [false, "Inactivo"]].map(([k, l]) =>
              React.createElement("button", { key: String(k), className: activo === k ? "is-active" : "", style: { justifyContent: "center" }, onClick: () => setActivo(k) }, l))),

          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", onClick: guardar },
            React.createElement(window.Icon, { name: "check" }), "Guardar cupón"),
          React.createElement("div", { className: "t3", style: { fontSize: 11, textAlign: "center", marginTop: 10 } }, "Se inserta en la tabla cupones y queda disponible en el cobro.")
        )))
  );
}
window.NuevoCuponModal = NuevoCuponModal;

/* ============================================================
   PANEL: lista de cupones (dentro de Caja)
   ============================================================ */
function CuponesPanel() {
  const { cupones, updateCupon, toast } = window.useStore();
  const [nuevo, setNuevo] = _cuS(false);
  const hoy = new Date("2026-06-06T00:00:00");
  const vencido = (c) => c.vence && new Date(c.vence + "T00:00:00") < hoy;
  const activos = cupones.filter(c => c.activo && !vencido(c)).length;

  const statCard = (label, val, color) => React.createElement("div", { className: "card", style: { padding: "12px 16px" } },
    React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif" } }, label),
    React.createElement("div", { className: "num", style: { fontSize: 20, fontWeight: 700, marginTop: 3, color: color || "var(--text)" } }, val));

  return React.createElement("div", { className: "fade-up" },
    React.createElement("div", { className: "row gap12 wrap", style: { marginBottom: 16 } },
      statCard("Cupones", cupones.length),
      statCard("Vigentes", activos, "var(--ok)"),
      React.createElement("div", { style: { marginLeft: "auto" } },
        React.createElement("button", { className: "btn btn--accent", onClick: () => setNuevo(true) }, React.createElement(window.Icon, { name: "plus" }), "Nuevo cupón"))),

    React.createElement("div", { className: "card", style: { overflow: "hidden" } },
      React.createElement("table", { className: "tbl" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Código"), React.createElement("th", null, "Tipo"),
          React.createElement("th", { style: { textAlign: "right" } }, "Valor"),
          React.createElement("th", null, "Expira"),
          React.createElement("th", { style: { textAlign: "right" } }, "Usos"),
          React.createElement("th", null, "Estado"),
          React.createElement("th", { style: { textAlign: "right", width: 150 } }, "Acciones"))),
        React.createElement("tbody", null,
          cupones.map(c => {
            const venc = vencido(c);
            const estadoKind = !c.activo ? "muted" : (venc ? "danger" : "ok");
            const estadoLabel = !c.activo ? "Inactivo" : (venc ? "Vencido" : "Activo");
            return React.createElement("tr", { key: c.id },
              React.createElement("td", null, React.createElement("b", { className: "num", style: { fontWeight: 700, letterSpacing: ".02em" } }, c.codigo)),
              React.createElement("td", null, React.createElement(window.Badge, { kind: c.tipo === "monto" ? "muted" : "resv" }, cuponTipoLabel(c.tipo))),
              React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, color: "var(--accent)" } }, cuponValorLabel(c)),
              React.createElement("td", { className: "num t2", style: { fontSize: 12 } }, c.vence || "—"),
              React.createElement("td", { className: "num t2", style: { textAlign: "right" } }, (c.usos || 0) + " / " + (c.maxUsos == null ? "∞" : c.maxUsos)),
              React.createElement("td", null, React.createElement(window.Badge, { kind: estadoKind }, estadoLabel)),
              React.createElement("td", { style: { textAlign: "right" } },
                React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => { updateCupon(c.id, { activo: !c.activo }); toast((c.activo ? "Cupón desactivado: " : "Cupón activado: ") + c.codigo); } },
                  React.createElement(window.Icon, { name: c.activo ? "x" : "check", style: { width: 14, height: 14 } }), c.activo ? "Desactivar" : "Activar")));
          })))),

    React.createElement("p", { className: "t3", style: { fontSize: 12, marginTop: 12, display: "flex", gap: 8, alignItems: "center" } },
      React.createElement(window.Icon, { name: "star", style: { width: 15, height: 15, color: "var(--accent)" } }),
      "Los cupones activos y vigentes se pueden aplicar en el cobro de cada mesa."),

    nuevo && React.createElement(NuevoCuponModal, { onClose: () => setNuevo(false) }));
}
window.CuponesPanel = CuponesPanel;
