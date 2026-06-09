/* ============================================================
   TALISMÁN — Módulo CAJA (apertura, ventas, ganancia, arqueo)
   ============================================================ */
function AperturaCard() {
  const { abrirCaja } = window.useStore();
  const [monto, setMonto] = React.useState("200");
  return React.createElement("div", { className: "card card-pad fade-up", style: { marginBottom: 14, border: "1px solid var(--border-accent)" } },
    React.createElement("div", { className: "row gap16 wrap", style: { alignItems: "flex-end" } },
      React.createElement("div", { style: { flex: 1, minWidth: 220 } },
        React.createElement("h3", { className: "row gap8", style: { margin: "0 0 6px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 16 } },
          React.createElement(window.Icon, { name: "key", style: { width: 18, height: 18, color: "var(--accent)" } }), "Caja cerrada"),
        React.createElement("p", { className: "t2", style: { margin: 0, fontSize: 13 } }, "Apertura la caja con el monto inicial en efectivo para habilitar los cobros del turno.")),
      React.createElement("label", { className: "field", style: { width: 180 } },
        React.createElement("span", { className: "field__label" }, "Monto inicial (efectivo)"),
        React.createElement("input", { className: "input", type: "number", value: monto, onChange: e => setMonto(e.target.value) })),
      React.createElement("button", { className: "btn btn--accent btn--lg", onClick: () => abrirCaja(monto) },
        React.createElement(window.Icon, { name: "check" }), "Aperturar caja")));
}

function ArqueoModal({ onClose }) {
  const { caja, montoInicial, cerrarCaja, aperturaHora, egresos, registrarGasto } = window.useStore();
  const [contadoEf, setContadoEf] = React.useState("");
  const [contadoYape, setContadoYape] = React.useState("");
  const [concepto, setConcepto] = React.useState("");
  const [montoG, setMontoG] = React.useState("");
  const [metodoG, setMetodoG] = React.useState("Efectivo");
  const addGasto = () => { const ok = registrarGasto({ concepto, monto: montoG, metodo: metodoG }); if (ok) { setConcepto(""); setMontoG(""); } };
  const difEf = contadoEf !== "" ? (parseFloat(contadoEf) - caja.efectivoEsperado) : null;
  const difYape = contadoYape !== "" ? (parseFloat(contadoYape) - caja.yapeEsperado) : null;
  const fila = (label, esperado, contado, setC, dif) => React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 12 } },
    React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 10 } },
      React.createElement("b", { style: { fontFamily: "'Space Grotesk',sans-serif" } }, label),
      React.createElement("span", { className: "t3", style: { fontSize: 12 } }, "Esperado ", React.createElement("b", { className: "num", style: { color: "var(--text)" } }, window.money(esperado)))),
    React.createElement("label", { className: "field" }, React.createElement("span", { className: "field__label" }, "Monto contado"),
      React.createElement("input", { className: "input", type: "number", placeholder: "0.00", value: contado, onChange: e => setC(e.target.value) })),
    dif != null && React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginTop: 8, fontSize: 13 } },
      React.createElement("span", { className: "t2" }, "Diferencia"),
      React.createElement("b", { className: "num", style: { color: Math.abs(dif) < 0.01 ? "var(--ok)" : (dif < 0 ? "var(--danger)" : "var(--warn)") } }, (dif >= 0 ? "+" : "") + window.money(dif))));

  // Fila de un egreso (gasto manual o pago de planilla) en el detalle del arqueo
  const egresoRow = (e, last) => {
    const esPlanilla = e.tipo === "pago" || e.tipo === "adelanto";
    const etiqueta = esPlanilla ? e.nombre : e.concepto;
    const tipoTxt = esPlanilla ? (e.tipo === "adelanto" ? "Adelanto de planilla" : "Pago de sueldo") : "Gasto";
    return React.createElement("div", { key: e.id, className: "line", style: { padding: "9px 10px", alignItems: "center", borderBottom: last ? "none" : "1px solid var(--border)" } },
      React.createElement("div", { style: { flex: 1 } },
        React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, etiqueta),
        React.createElement("div", { className: "t3", style: { fontSize: 11 } }, tipoTxt + " · " + String(e.fecha).slice(11))),
      React.createElement("span", { className: "badge badge--muted", style: { marginRight: 10 } }, e.metodo),
      React.createElement("b", { className: "num", style: { fontSize: 13, color: "var(--danger)" } }, "− " + window.money(e.monto)));
  };

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(460px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Arqueo y cierre · abierta " + (aperturaHora || "—")),
          React.createElement("h2", { style: { margin: "0 0 6px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700 } }, "Arqueo de caja"),
          React.createElement("p", { className: "t2", style: { marginTop: 0, marginBottom: 16, fontSize: 13 } }, "Solo se contrastan efectivo y Yape (tarjeta va directo al banco)."),
          React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 14, background: "var(--bg-2)" } },
            React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "Monto inicial"), React.createElement("span", { className: "num" }, window.money(montoInicial))),
            React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "Total ventas del turno"), React.createElement("span", { className: "num" }, window.money(caja.totalCobrado))),
            caja.gastosTotal > 0 && React.createElement("div", { className: "sumline" }, React.createElement("span", { style: { color: "var(--danger)" } }, "Total gastos del turno"), React.createElement("span", { className: "num", style: { color: "var(--danger)" } }, "− " + window.money(caja.gastosTotal))),
            caja.planillaTotal > 0 && React.createElement("div", { className: "sumline" }, React.createElement("span", { style: { color: "var(--danger)" } }, "Total pagos de planilla"), React.createElement("span", { className: "num", style: { color: "var(--danger)" } }, "− " + window.money(caja.planillaTotal))),
            React.createElement("div", { className: "sumline total" }, React.createElement("span", null, "Efectivo + Yape esperado"), React.createElement("b", { className: "num" }, window.money(caja.efectivoEsperado + caja.yapeEsperado)))),
          // Gastos del turno: registro manual (la planilla entra automáticamente)
          React.createElement("div", { className: "field__label" }, "Gastos del turno"),
          React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 12 } },
            React.createElement("label", { className: "field", style: { display: "block", marginBottom: 10 } },
              React.createElement("span", { className: "field__label" }, "Concepto"),
              React.createElement("input", { className: "input", placeholder: "Ej: Luz, compras, servicio", value: concepto, onChange: e => setConcepto(e.target.value) })),
            React.createElement("div", { className: "row gap10", style: { marginBottom: 12, alignItems: "flex-end" } },
              React.createElement("label", { className: "field", style: { flex: 1 } },
                React.createElement("span", { className: "field__label" }, "Monto (S/)"),
                React.createElement("input", { className: "input", type: "number", placeholder: "0", value: montoG, onChange: e => setMontoG(e.target.value) })),
              React.createElement("div", { className: "seg" },
                [["Efectivo", "cash"], ["Yape", "yape"]].map(([m, ic]) =>
                  React.createElement("button", { key: m, className: metodoG === m ? "is-active" : "", onClick: () => setMetodoG(m) }, React.createElement(window.Icon, { name: ic }), m)))),
            React.createElement("button", { className: "btn btn--ghost btn--block", onClick: addGasto },
              React.createElement(window.Icon, { name: "plus" }), "Agregar gasto")),

          // Detalle de salidas del turno (gastos manuales + pagos de planilla)
          egresos.length > 0
            ? React.createElement("div", { style: { marginBottom: 14 } },
                React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", marginBottom: 6 } },
                  React.createElement("span", { className: "field__label", style: { marginBottom: 0 } }, "Detalle de salidas"),
                  React.createElement("span", { className: "t3", style: { fontSize: 11 } }, "Gastos " + window.money0(caja.gastosTotal) + " · Planilla " + window.money0(caja.planillaTotal))),
                React.createElement("div", { className: "card", style: { padding: 6 } },
                  egresos.map((e, i) => egresoRow(e, i === egresos.length - 1))))
            : React.createElement("div", { className: "empty", style: { padding: 14, marginBottom: 14, fontSize: 12.5 } }, "Sin gastos ni pagos registrados este turno"),

          fila("Efectivo", caja.efectivoEsperado, contadoEf, setContadoEf, difEf),
          fila("Yape", caja.yapeEsperado, contadoYape, setContadoYape, difYape),
          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", style: { marginTop: 6 }, onClick: () => { cerrarCaja(); onClose(); } },
            React.createElement(window.Icon, { name: "check" }), "Confirmar cierre de caja"))))
  );
}

function DeclaracionesPanel() {
  const { declaraciones, updateDeclaracion, toast, buscarCliente } = window.useStore();
  const [f, setF] = React.useState("todas");
  const [preview, setPreview] = React.useState(null); // { name, data }
  const fileRef = React.useRef(null);
  const targetRef = React.useRef(null); // id del registro que recibe el PDF
  const lista = declaraciones.filter(d => f === "todas" || (f === "boleta" && d.tipo === "Boleta") || (f === "factura" && d.tipo === "Factura") || (f === "pend" && d.estado === "Pendiente"));
  const emitidas = declaraciones.filter(d => d.estado === "Emitido").length;
  const pend = declaraciones.filter(d => d.estado === "Pendiente").length;

  const MAX_PDF = 5 * 1024 * 1024; // 5 MB

  // Abre el selector de archivos para un registro concreto
  const pedirPDF = (id) => {
    targetRef.current = id;
    if (fileRef.current) { fileRef.current.value = ""; fileRef.current.click(); }
  };

  // Valida + guarda el PDF asociado al registro
  const onArchivo = (e) => {
    const file = e.target.files && e.target.files[0];
    const id = targetRef.current;
    e.target.value = "";
    if (!file || !id) return;
    const esPDF = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!esPDF) { toast("Solo se permiten archivos PDF"); return; }
    if (file.size > MAX_PDF) { toast("El PDF supera el máximo de 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      updateDeclaracion(id, { pdf: true, pdfData: reader.result, pdfName: file.name, estado: "Emitido" });
      toast("PDF adjuntado · " + file.name);
    };
    reader.onerror = () => toast("Error al cargar el PDF, intenta de nuevo");
    reader.readAsDataURL(file);
  };

  // "Ver": muestra el archivo subido por el usuario; si es un registro semilla sin archivo real, usa el comprobante generado
  const verPDF = (d) => {
    if (d.pdfData) setPreview({ name: d.pdfName || (d.tipo + ".pdf"), data: d.pdfData });
    else window.exportarComprobante(d);
  };

  const abrirEnPestana = (p) => {
    try {
      const bin = atob(p.data.split(",")[1]);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([arr], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (err) { window.open(p.data, "_blank"); }
  };

  return React.createElement(React.Fragment, null,
    React.createElement("input", { ref: fileRef, type: "file", accept: "application/pdf,.pdf", style: { display: "none" }, onChange: onArchivo }),
    preview && React.createElement(React.Fragment, null,
      React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: () => setPreview(null) }),
      React.createElement("div", { className: "modal-wrap" },
        React.createElement("div", { className: "modal", style: { width: "min(920px,96vw)", height: "90vh", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" } },
          React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--border)" } },
            React.createElement("div", { className: "row gap8", style: { alignItems: "center", minWidth: 0 } },
              React.createElement(window.Icon, { name: "receipt", style: { width: 15, height: 15, color: "var(--text-3)" } }),
              React.createElement("span", { style: { fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, preview.name)),
            React.createElement("div", { className: "row gap6" },
              React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => abrirEnPestana(preview) }, React.createElement(window.Icon, { name: "down", style: { width: 14, height: 14 } }), "Abrir en pestaña"),
              React.createElement("button", { className: "iconbtn", onClick: () => setPreview(null) }, React.createElement(window.Icon, { name: "x" })))),
          React.createElement("iframe", { title: "Comprobante PDF", src: preview.data, style: { flex: 1, width: "100%", border: 0, background: "#fff" } })))),

    React.createElement("div", { className: "fade-up" },
    React.createElement("div", { className: "row gap12 wrap", style: { marginBottom: 16 } },
      React.createElement("div", { className: "card", style: { padding: "12px 16px" } },
        React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif" } }, "Comprobantes"),
        React.createElement("div", { className: "num", style: { fontSize: 20, fontWeight: 700, marginTop: 3 } }, declaraciones.length)),
      React.createElement("div", { className: "card", style: { padding: "12px 16px" } },
        React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif" } }, "Emitidos"),
        React.createElement("div", { className: "num", style: { fontSize: 20, fontWeight: 700, marginTop: 3, color: "var(--ok)" } }, emitidas)),
      React.createElement("div", { className: "card", style: { padding: "12px 16px" } },
        React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif" } }, "Pendientes"),
        React.createElement("div", { className: "num", style: { fontSize: 20, fontWeight: 700, marginTop: 3, color: pend ? "var(--warn)" : "var(--text)" } }, pend)),
      React.createElement("div", { className: "row gap6 wrap", style: { marginLeft: "auto" } },
        [["todas", "Todas"], ["boleta", "Boletas"], ["factura", "Facturas"], ["pend", "Pendientes"]].map(([k, l]) =>
          React.createElement("button", { key: k, className: "chip" + (f === k ? " is-active" : ""), onClick: () => setF(k) }, l)))),

    React.createElement("div", { className: "card", style: { overflow: "hidden" } },
      React.createElement("table", { className: "tbl" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Tipo"), React.createElement("th", null, "Cliente"),
          React.createElement("th", null, "Documento"), React.createElement("th", null, "Celular"), React.createElement("th", null, "Mesa"),
          React.createElement("th", null, "Fecha"), React.createElement("th", { style: { textAlign: "right" } }, "Monto"),
          React.createElement("th", null, "Estado"), React.createElement("th", null, "PDF"),
          React.createElement("th", { style: { textAlign: "right" } }, "Acciones"))),
        React.createElement("tbody", null,
          lista.map(d => {
            const cli = buscarCliente(d.docCliente);
            const cel = cli ? cli.celular : null;
            return React.createElement("tr", { key: d.id },
            React.createElement("td", null, React.createElement(window.Badge, { kind: d.tipo === "Factura" ? "resv" : "muted" }, d.tipo)),
            React.createElement("td", null, React.createElement("b", { style: { fontWeight: 600 } }, d.cliente)),
            React.createElement("td", { className: "num t2", style: { fontSize: 12 } }, d.docCliente),
            React.createElement("td", { className: "num t2", style: { fontSize: 12 } }, cel ? React.createElement("span", { className: "row gap6" }, React.createElement(window.Icon, { name: "phone", style: { width: 13, height: 13, color: "var(--text-3)" } }), cel) : React.createElement("span", { className: "t3", style: { fontSize: 11.5 } }, "—")),
            React.createElement("td", { className: "num" }, d.mesa),
            React.createElement("td", { className: "num t2", style: { fontSize: 12 } }, d.fecha),
            React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700 } }, window.money0(d.monto)),
            React.createElement("td", null, React.createElement(window.Badge, { kind: d.estado === "Emitido" ? "ok" : "warn" }, d.estado)),
            React.createElement("td", null, d.pdf
              ? React.createElement("span", { className: "row gap6", style: { fontSize: 11.5, color: "var(--ok)" } }, React.createElement(window.Icon, { name: "check", style: { width: 14, height: 14 } }), "PDF adjunto")
              : React.createElement("span", { className: "t3", style: { fontSize: 11.5 } }, "Sin adjunto")),
            React.createElement("td", { style: { textAlign: "right" } }, React.createElement("div", { className: "row-actions" },
              d.pdf
                ? React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => pedirPDF(d.id) }, React.createElement(window.Icon, { name: "up", style: { width: 14, height: 14 } }), "Reemplazar")
                : React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => pedirPDF(d.id) }, React.createElement(window.Icon, { name: "plus", style: { width: 14, height: 14 } }), "Adjuntar PDF"),
              React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => verPDF(d) }, React.createElement(window.Icon, { name: "down", style: { width: 14, height: 14 } }), "Ver"))));
          }))))));
}

function ComandaModal({ venta, onClose }) {
  const { prodById, descById } = window.useStore();
  const metodoIc = { Efectivo: "cash", Tarjeta: "card", Yape: "yape" }[venta.metodo] || "dollar";

  // Reconstruye las líneas de la comanda a partir de lo guardado al cobrar
  const lineas = (venta.lineas || []).map(([pid, q]) => {
    const p = prodById[pid];
    if (!p) return null;
    return { nombre: p.nombre, sub: p.sub, cat: p.cat, precio: p.precio, qty: q, total: p.precio * q };
  }).filter(Boolean);
  const comidas = lineas.filter(l => l.cat === "comida");
  const bebidas = lineas.filter(l => l.cat === "bebida");
  const descs = (venta.descartables || []).map(([did, q]) => {
    const d = descById[did]; if (!d) return null;
    return { nombre: d.nombre, precio: d.precio, qty: q, total: d.precio * q };
  }).filter(Boolean);

  const subtotal = venta.comida + venta.bebida + (venta.descTotal || 0);
  const total = venta.total != null ? venta.total : venta.comida + venta.bebida;
  const sinDetalle = lineas.length === 0 && descs.length === 0;

  const grupo = (titulo, ic, items) => items.length === 0 ? null :
    React.createElement("div", { style: { marginBottom: 4 } },
      React.createElement("div", { className: "row gap8", style: { padding: "4px 2px 8px", color: "var(--text-3)" } },
        React.createElement(window.Icon, { name: ic, style: { width: 14, height: 14 } }),
        React.createElement("span", { style: { fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif" } }, titulo)),
      items.map((l, i) => React.createElement("div", { key: i, className: "line", style: { padding: "9px 2px", alignItems: "center", borderBottom: i === items.length - 1 ? "none" : "1px solid var(--border)" } },
        React.createElement("span", { className: "num", style: { width: 34, fontWeight: 700, color: "var(--accent)" } }, l.qty + "×"),
        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
          React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600 } }, l.nombre),
          l.sub && React.createElement("div", { className: "t3", style: { fontSize: 11 } }, l.sub + " · " + window.money(l.precio) + " c/u")),
        React.createElement("b", { className: "num", style: { fontSize: 13.5 } }, window.money0(l.total)))));

  const sumRow = (label, val, opts = {}) => React.createElement("div", { className: "sumline" + (opts.total ? " total" : "") },
    React.createElement("span", opts.danger ? { style: { color: "var(--danger)" } } : (opts.total ? null : { className: "t2" }), label),
    React.createElement(opts.total ? "b" : "span", { className: "num", style: opts.danger ? { color: "var(--danger)" } : null }, (opts.danger ? "− " : "") + window.money(val)));

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(440px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Comanda cobrada · " + venta.hora),
          React.createElement("h2", { style: { margin: "0 0 14px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700 } }, "Mesa " + venta.mesa),

          // Cabecera: cliente, documento y método de pago
          React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 14, background: "var(--bg-2)" } },
            React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center" } },
              React.createElement("div", { className: "row gap8", style: { alignItems: "center", minWidth: 0 } },
                React.createElement(window.Icon, { name: "user", style: { width: 16, height: 16, color: "var(--text-3)" } }),
                React.createElement("div", { style: { minWidth: 0 } },
                  React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, venta.cliente || "Cliente varios"),
                  React.createElement("div", { className: "t3", style: { fontSize: 11 } }, (venta.documento || "Boleta") + (venta.cupon ? " · cupón " + venta.cupon : "")))),
              React.createElement("span", { className: "badge badge--muted row gap6", style: { alignItems: "center" } },
                React.createElement(window.Icon, { name: metodoIc, style: { width: 14, height: 14 } }), venta.metodo))),

          // Detalle de lo consumido
          sinDetalle
            ? React.createElement("div", { className: "empty", style: { padding: 18, marginBottom: 14, fontSize: 12.5 } }, "Esta venta no guardó el detalle de productos.")
            : React.createElement("div", { className: "card", style: { padding: "10px 14px", marginBottom: 14 } },
                grupo("Comida", "utensils", comidas),
                grupo("Bebidas", "coffee", bebidas),
                descs.length > 0 && grupo("Para llevar", "box", descs)),

          // Totales
          React.createElement("div", { className: "card", style: { padding: 14, background: "var(--bg-2)" } },
            sumRow("Comida", venta.comida),
            sumRow("Bebidas", venta.bebida),
            (venta.descTotal || 0) > 0 && sumRow("Para llevar", venta.descTotal),
            (venta.recargo || 0) > 0 && React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "Recargo tarjeta"), React.createElement("span", { className: "num" }, "+ " + window.money(venta.recargo))),
            (venta.descuento || 0) > 0 && sumRow("Descuento cupón", venta.descuento, { danger: true }),
            sumRow("Total cobrado", total, { total: true })),
          (venta.pagos && venta.pagos.length > 1) && React.createElement("div", { className: "card", style: { padding: 14, marginTop: 12, background: "var(--bg-2)" } },
            React.createElement("div", { className: "field__label" }, "Pago dividido"),
            venta.pagos.map((p, i) => React.createElement("div", { key: i, className: "sumline" },
              React.createElement("span", { className: "row gap8", style: { alignItems: "center" } },
                React.createElement(window.Icon, { name: { Efectivo: "cash", Tarjeta: "card", Yape: "yape" }[p.metodo] || "dollar", style: { width: 14, height: 14, color: "var(--text-3)" } }), p.metodo),
              React.createElement("span", { className: "num" }, window.money(p.monto))))),
          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", style: { marginTop: 16 },
            onClick: () => window.imprimirTicket && window.imprimirTicket(venta, prodById, descById) },
            React.createElement(window.Icon, { name: "receipt" }), "Imprimir ticket (80 mm)")))));
}

function Caja() {
  const { caja, ventas, topProductos, cajaAbierta, montoInicial, aperturaHora, costoProducto } = window.useStore();
  const [filtro, setFiltro] = React.useState("todos");
  const [arqueo, setArqueo] = React.useState(false);
  const [verComanda, setVerComanda] = React.useState(null);
  const [pestana, setPestana] = React.useState("caja");
  const detalle = topProductos.filter(p => p.qty > 0 && (filtro === "todos" || p.cat === filtro));
  const metodos = [{ k: "Efectivo", ic: "cash" }, { k: "Tarjeta", ic: "card" }, { k: "Yape", ic: "yape" }];
  const exportar = () => window.exportarCajaPDF(caja, ventas, detalle, costoProducto);

  return React.createElement("div", { className: "view" },
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, cajaAbierta ? "Caja abierta · " + (aperturaHora || "") + " · inicial " + window.money0(montoInicial) : "Cierre de turno"),
        React.createElement("h1", { className: "page-title" }, "Caja"),
        React.createElement("p", { className: "page-sub" }, "Ventas del día alimentadas en tiempo real por cada mesa cobrada.")),
      React.createElement("div", { className: "row gap8" },
        React.createElement("div", { className: "seg", style: { marginRight: 4 } },
          [["caja", "Caja del día"], ["declaraciones", "Declaraciones"], ["cupones", "Cupones"]].map(([k, l]) =>
            React.createElement("button", { key: k, className: pestana === k ? "is-active" : "", onClick: () => setPestana(k) }, l))),
        React.createElement("button", { className: "btn btn--ghost", disabled: !cajaAbierta, onClick: () => setArqueo(true) }, React.createElement(window.Icon, { name: "receipt" }), "Arqueo y cierre"),
        React.createElement("button", { className: "btn btn--accent", onClick: exportar }, React.createElement(window.Icon, { name: "down" }), "Exportar día"))),

    pestana === "declaraciones"
      ? React.createElement(DeclaracionesPanel, null)
      : pestana === "cupones"
      ? React.createElement(window.CuponesPanel, null)
      : React.createElement(React.Fragment, null,
    !cajaAbierta && React.createElement(AperturaCard, null),

    /* Totales */
    React.createElement("div", { style: { display: "grid", gap: 14, gridTemplateColumns: "1.2fr 1fr 1fr 1fr", marginBottom: 14 } },
      React.createElement("div", { className: "card card-pad fade-up", style: { background: "linear-gradient(150deg, var(--surface-2), var(--surface))" } },
        React.createElement("div", { className: "stat__label" }, React.createElement(window.Icon, { name: "dollar" }), "Total vendido hoy"),
        React.createElement("div", { className: "num", style: { fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 10, color: "var(--accent)" } }, window.money0(caja.totalCobrado)),
        React.createElement("div", { className: "row gap8 wrap", style: { marginTop: 12 } },
          React.createElement("span", { className: "badge badge--muted" }, caja.nTrans + " mesas atendidas"),
          React.createElement("span", { className: "badge badge--ok" }, "Cupones − " + window.money0(caja.descuentos)))),
      React.createElement("div", { className: "card stat fade-up" },
        React.createElement("div", { className: "stat__label" }, React.createElement(window.Icon, { name: "up" }), "Ganancia del día"),
        React.createElement("div", { className: "stat__val", style: { color: "var(--ok)" } }, window.money0(caja.ganancia)),
        React.createElement("div", { className: "stat__foot" }, "Costo " + window.money0(caja.costoTotal) + " · margen " + Math.round(caja.ganancia / (caja.total || 1) * 100) + "%"),
        React.createElement("div", { className: "meter ok", style: { marginTop: 10 } }, React.createElement("i", { style: { width: Math.min(100, Math.round(caja.ganancia / (caja.total || 1) * 100)) + "%" } }))),
      React.createElement("div", { className: "card stat fade-up" },
        React.createElement("div", { className: "stat__label" }, React.createElement(window.Icon, { name: "utensils" }), "Comida"),
        React.createElement("div", { className: "stat__val" }, window.money0(caja.comida)),
        React.createElement("div", { className: "stat__foot" }, caja.itemsComida + " platos · " + Math.round(caja.comida / (caja.total || 1) * 100) + "%"),
        React.createElement("div", { className: "meter", style: { marginTop: 10 } }, React.createElement("i", { style: { width: (caja.comida / (caja.total || 1) * 100) + "%" } }))),
      React.createElement("div", { className: "card stat fade-up" },
        React.createElement("div", { className: "stat__label" }, React.createElement(window.Icon, { name: "coffee" }), "Bebidas"),
        React.createElement("div", { className: "stat__val" }, window.money0(caja.bebida)),
        React.createElement("div", { className: "stat__foot" }, caja.itemsBebida + " bebidas · " + Math.round(caja.bebida / (caja.total || 1) * 100) + "%"),
        React.createElement("div", { className: "meter ok", style: { marginTop: 10 } }, React.createElement("i", { style: { width: (caja.bebida / (caja.total || 1) * 100) + "%" } })))),

    React.createElement("div", { style: { display: "grid", gap: 14, gridTemplateColumns: "1.4fr 1fr", alignItems: "start" } },
      /* Detalle productos vendidos con costo y ganancia */
      React.createElement("div", { className: "card fade-up", style: { overflow: "hidden" } },
        React.createElement("div", { className: "row", style: { justifyContent: "space-between", padding: "16px 18px 14px" } },
          React.createElement("h3", { style: { margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } }, "Detalle de productos vendidos"),
          React.createElement("div", { className: "seg" },
            [["todos", "Todos"], ["comida", "Comida"], ["bebida", "Bebidas"]].map(([k, l]) =>
              React.createElement("button", { key: k, className: filtro === k ? "is-active" : "", onClick: () => setFiltro(k) }, l)))),
        React.createElement("table", { className: "tbl" },
          React.createElement("thead", null, React.createElement("tr", null,
            React.createElement("th", null, "Producto"),
            React.createElement("th", { style: { textAlign: "right" } }, "Cant."),
            React.createElement("th", { style: { textAlign: "right" } }, "Venta"),
            React.createElement("th", { style: { textAlign: "right" } }, "Costo total"),
            React.createElement("th", { style: { textAlign: "right" } }, "Ganancia"))),
          React.createElement("tbody", null,
            detalle.map(p => {
              const costo = costoProducto(p) * p.qty; const gan = p.ingreso - costo;
              return React.createElement("tr", { key: p.id },
                React.createElement("td", null, React.createElement("b", { style: { fontWeight: 600 } }, p.nombre), React.createElement("div", { className: "t3", style: { fontSize: 11 } }, p.sub)),
                React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, fontSize: 15 } }, p.qty),
                React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700 } }, window.money0(p.ingreso)),
                React.createElement("td", { className: "num t2", style: { textAlign: "right" } }, window.money0(costo)),
                React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, color: "var(--ok)" } }, window.money0(gan)));
            }))),
        React.createElement("div", { className: "row", style: { justifyContent: "space-between", padding: "13px 18px", borderTop: "1px solid var(--border)", background: "var(--bg-2)" } },
          React.createElement("span", { className: "t2", style: { fontSize: 12 } }, detalle.reduce((s, p) => s + p.qty, 0) + " unidades · " + detalle.length + " productos"),
          React.createElement("span", { className: "row gap16" },
            React.createElement("span", { className: "t3", style: { fontSize: 12 } }, "Venta ", React.createElement("b", { className: "num", style: { color: "var(--text)" } }, window.money0(detalle.reduce((s, p) => s + p.ingreso, 0)))),
            React.createElement("span", { className: "t3", style: { fontSize: 12 } }, "Ganancia ", React.createElement("b", { className: "num", style: { color: "var(--ok)" } }, window.money0(detalle.reduce((s, p) => s + (p.ingreso - costoProducto(p) * p.qty), 0))))))),

      React.createElement("div", null,
        /* Por método */
        React.createElement("div", { className: "card card-pad fade-up", style: { marginBottom: 14 } },
          React.createElement("h3", { style: { margin: "0 0 14px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } }, "Por método de pago"),
          metodos.map(m => {
            const v = caja.porMetodo[m.k] || 0; const tot = Object.values(caja.porMetodo).reduce((a, b) => a + b, 0) || 1; const pct = Math.round(v / tot * 100);
            return React.createElement("div", { key: m.k, style: { marginBottom: 13 } },
              React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 6 } },
                React.createElement("span", { className: "row gap8", style: { fontSize: 13 } }, React.createElement(window.Icon, { name: m.ic, style: { width: 16, height: 16, color: "var(--text-3)" } }), m.k),
                React.createElement("b", { className: "num", style: { fontSize: 13 } }, window.money0(v))),
              React.createElement("div", { className: "meter" }, React.createElement("i", { style: { width: pct + "%" } })));
          })),
        /* Últimos cobros */
        React.createElement("div", { className: "card fade-up", style: { overflow: "hidden" } },
          React.createElement("h3", { style: { margin: 0, padding: "16px 18px 12px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } }, "Últimos cobros"),
          React.createElement("div", { style: { maxHeight: 320, overflowY: "auto" } },
            React.createElement("table", { className: "tbl" },
              React.createElement("tbody", null,
                ventas.slice(0, 14).map(v => React.createElement("tr", { key: v.id, style: { cursor: "pointer" }, onClick: () => setVerComanda(v) },
                  React.createElement("td", null, React.createElement("b", { className: "num" }, "Mesa " + v.mesa), React.createElement("div", { className: "t3", style: { fontSize: 11 } }, v.hora + " · " + v.items + " ítems" + (v.documento ? " · " + v.documento : ""))),
                  React.createElement("td", null, React.createElement("span", { className: "badge badge--muted" }, v.metodo)),
                  React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700 } }, window.money0(v.total != null ? v.total : v.comida + v.bebida)),
                  React.createElement("td", { style: { textAlign: "right", width: 1, whiteSpace: "nowrap" } },
                    React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: (e) => { e.stopPropagation(); setVerComanda(v); } },
                      React.createElement(window.Icon, { name: "receipt", style: { width: 14, height: 14 } }), "Ver comanda")))))))))
    )),

    arqueo && React.createElement(ArqueoModal, { onClose: () => setArqueo(false) }),
    verComanda && React.createElement(ComandaModal, { venta: verComanda, onClose: () => setVerComanda(null) })
  );
}
window.Caja = Caja;
