/* ============================================================
   TALISMÁN — Personal · Modales y lógica de rendimiento
   (solo agrega funcionalidad; reutiliza el sistema visual)
   ============================================================ */
const { useState: _pS } = React;

/* ---------- Indicador de desempeño (bonificaciones vs descuentos) ---------- */
window.desempenoEmpleado = function (p) {
  const bonif = p.bonif || 0, desc = p.desc || 0;
  const neto = bonif - desc;
  const base = bonif + desc;
  const pct = base > 0 ? Math.round((bonif / base) * 100) : 50; // % a favor
  let nivel, kind;
  if (neto >= 400) { nivel = "Excelente"; kind = "ok"; }
  else if (neto >= 150) { nivel = "Bueno"; kind = "ok"; }
  else if (neto >= 0) { nivel = "Regular"; kind = "warn"; }
  else { nivel = "Bajo"; kind = "danger"; }
  return { bonif, desc, neto, pct, nivel, kind };
};

const CARGOS = ["Mozo", "Chef", "Cocina", "Cajero", "Administra.", "Limpieza", "Barra"];
const TURNOS = ["Mañana", "Tarde", "Noche", "Completo"];
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const _field = (label, node, style) =>
  React.createElement("label", { className: "field", style: Object.assign({ flex: 1 }, style) },
    React.createElement("span", { className: "field__label" }, label), node);

/* ============================================================
   ADMINISTRAR PERSONAL — agrega / inactiva
   ============================================================ */
function AdministrarPersonalModal({ onClose }) {
  const { personal, addEmpleado, retirarEmpleado, reactivarEmpleado, toast } = window.useStore();
  const [mode, setMode] = _pS("menu"); // menu | agregar | inactivar

  // --- formulario de alta ---
  const [f, setF] = _pS({ nombre: "", doc: "", cargo: "Mozo", turno: "Tarde", sueldo: "", ingreso: "2026-06-06", descanso: "Lunes", frecuencia: "mensual" });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const inp = (k, props = {}) => React.createElement("input", Object.assign({ className: "input", value: f[k], onChange: e => set(k, e.target.value) }, props));
  const sel = (k, opts) => React.createElement("select", { className: "select", value: f[k], onChange: e => set(k, e.target.value) }, opts.map(o => React.createElement("option", { key: o, value: o }, o)));

  const guardar = () => {
    if (!f.nombre.trim()) return toast("Ingresa el nombre", "warn");
    if (!f.doc.trim()) return toast("Ingresa el DNI", "warn");
    addEmpleado(f);
    onClose();
  };

  const activos = personal.filter(p => p.estado !== "inactivo");
  const inactivos = personal.filter(p => p.estado === "inactivo");

  const header = (kicker, titulo) => React.createElement("div", { style: { marginBottom: 16 } },
    React.createElement("div", { className: "kicker" }, kicker),
    React.createElement("h2", { style: { margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700 } }, titulo));

  const back = React.createElement("button", { className: "btn btn--ghost btn--sm", style: { marginBottom: 14 }, onClick: () => setMode("menu") },
    React.createElement(window.Icon, { name: "chevR", style: { width: 14, height: 14, transform: "rotate(180deg)" } }), "Volver");

  let body;
  if (mode === "menu") {
    const opcion = (icon, titulo, desc, onClick, tone) => React.createElement("button", {
      className: "card", onClick,
      style: { display: "flex", alignItems: "center", gap: 14, padding: 16, textAlign: "left", width: "100%", marginBottom: 10, cursor: "pointer" }
    },
      React.createElement("span", { style: { width: 44, height: 44, borderRadius: 12, flex: "none", display: "grid", placeItems: "center", background: tone === "danger" ? "var(--danger-soft)" : "var(--accent-soft)", color: tone === "danger" ? "var(--danger)" : "var(--accent)" } },
        React.createElement(window.Icon, { name: icon, style: { width: 22, height: 22 } })),
      React.createElement("div", { style: { flex: 1 } },
        React.createElement("div", { style: { fontWeight: 600, fontSize: 15 } }, titulo),
        React.createElement("div", { className: "t3", style: { fontSize: 12.5, marginTop: 2 } }, desc)),
      React.createElement(window.Icon, { name: "chevR", style: { width: 18, height: 18, color: "var(--text-3)" } }));
    body = React.createElement(React.Fragment, null,
      header("Gestión del equipo", "Administrar personal"),
      opcion("plus", "Agregar empleado", "Registra una nueva ficha en la planilla", () => setMode("agregar")),
      opcion("logout", "Inactivar empleado", "Retira sin borrar datos ni historial", () => setMode("inactivar"), "danger"));
  } else if (mode === "agregar") {
    body = React.createElement(React.Fragment, null,
      back,
      header("Nueva ficha", "Agregar empleado"),
      _field("Nombre completo", inp("nombre", { placeholder: "Ej: Ana Torres" }), { marginBottom: 12, display: "block" }),
      React.createElement("div", { className: "row gap10", style: { marginBottom: 12 } },
        _field("DNI", inp("doc", { placeholder: "Ej: 45128890" })),
        _field("Sueldo (S/)", inp("sueldo", { type: "number", placeholder: "0" }))),
      React.createElement("div", { className: "row gap10", style: { marginBottom: 12 } },
        _field("Cargo", sel("cargo", CARGOS)),
        _field("Turno", sel("turno", TURNOS))),
      React.createElement("div", { className: "row gap10", style: { marginBottom: 12 } },
        _field("Fecha de ingreso", inp("ingreso", { type: "date" })),
        _field("Día de descanso", sel("descanso", DIAS))),
      _field("Frecuencia de pago", React.createElement("select", { className: "select", style: { textTransform: "capitalize" }, value: f.frecuencia, onChange: e => set("frecuencia", e.target.value) }, ["semanal", "quincenal", "mensual"].map(o => React.createElement("option", { key: o, value: o }, o))), { marginBottom: 18, display: "block" }),
      React.createElement("button", { className: "btn btn--accent btn--lg btn--block", onClick: guardar },
        React.createElement(window.Icon, { name: "check" }), "Agregar a la planilla"));
  } else {
    body = React.createElement(React.Fragment, null,
      back,
      header("Baja sin pérdida de datos", "Inactivar empleado"),
      React.createElement("p", { className: "t2", style: { marginTop: 0, marginBottom: 14, fontSize: 13 } },
        "Al retirar, el empleado pasa a estado inactivo pero conserva su ficha e historial. Puedes reincorporarlo cuando quieras."),
      React.createElement("div", { className: "field__label" }, "Activos"),
      React.createElement("div", { className: "card", style: { padding: 6, marginBottom: 14 } },
        activos.length === 0
          ? React.createElement("div", { className: "empty", style: { padding: 18 } }, "Sin empleados activos")
          : activos.map(p => React.createElement("div", { key: p.id, className: "line", style: { padding: "9px 8px", borderBottom: "none" } },
              React.createElement("div", { className: "line__name", style: { flex: 1 } }, p.nombre, React.createElement("span", null, p.cargo + " · " + p.turno)),
              React.createElement("button", { className: "btn btn--danger btn--sm", onClick: () => retirarEmpleado(p.id) },
                React.createElement(window.Icon, { name: "logout", style: { width: 14, height: 14 } }), "Retirar")))),
      inactivos.length > 0 && React.createElement(React.Fragment, null,
        React.createElement("div", { className: "field__label" }, "Inactivos"),
        React.createElement("div", { className: "card", style: { padding: 6 } },
          inactivos.map(p => React.createElement("div", { key: p.id, className: "line", style: { padding: "9px 8px", borderBottom: "none", opacity: .75 } },
            React.createElement("div", { className: "line__name", style: { flex: 1 } }, p.nombre, React.createElement("span", null, p.cargo + " · inactivo")),
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => reactivarEmpleado(p.id) }, "Reincorporar"))))));
  }

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(480px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" }, body))));
}
window.AdministrarPersonalModal = AdministrarPersonalModal;

/* ============================================================
   DETALLE DE EMPLEADO — ficha + rendimiento + historial
   ============================================================ */
function EmpleadoDetalleModal({ emp, onClose }) {
  const { retirarEmpleado, reactivarEmpleado } = window.useStore();
  const [confirm, setConfirm] = _pS(false);
  const [pagar, setPagar] = _pS(false);
  const [adel, setAdel] = _pS(false);
  const vence = window.pagoVence(emp);
  const pendiente = emp.adelantoPendiente || 0;
  const d = window.desempenoEmpleado(emp);
  const inactivo = emp.estado === "inactivo";
  const estadoBadge = inactivo ? { kind: "muted", label: "Inactivo" }
    : emp.estado === "activo" ? { kind: "ok", label: "Activo" } : { kind: "muted", label: "Descanso" };

  const ficha = [
    ["DNI", emp.doc],
    ["Turno", emp.turno],
    ["Sueldo", window.money0(emp.sueldo)],
    ["Fecha de ingreso", emp.ingreso || "—"],
    ["Día de descanso", emp.descanso || "—"],
    ["Cargo", emp.cargo],
  ];
  const fichaRow = (label, val) => React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)" } },
    React.createElement("span", { className: "t3", style: { fontSize: 12.5 } }, label),
    React.createElement("b", { style: { fontWeight: 600, fontSize: 13.5 } }, val));

  const stat = (label, val, color) => React.createElement("div", { className: "card", style: { padding: 14, flex: 1, textAlign: "center" } },
    React.createElement("div", { className: "t3", style: { fontSize: 11.5, marginBottom: 6 } }, label),
    React.createElement("b", { className: "num", style: { fontSize: 19, color } }, val));

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(520px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },

          // Encabezado con avatar
          React.createElement("div", { className: "row gap10", style: { alignItems: "center", marginBottom: 18 } },
            React.createElement("span", { className: "avatar", style: { width: 50, height: 50, borderRadius: 14, fontSize: 17, background: inactivo ? "var(--surface-3)" : "linear-gradient(150deg,var(--accent-2),var(--accent))", color: inactivo ? "var(--text-2)" : "var(--accent-ink)" } },
              emp.nombre.split(" ").map(w => w[0]).slice(0, 2).join("")),
            React.createElement("div", { style: { flex: 1 } },
              React.createElement("h2", { style: { margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontSize: 21, fontWeight: 700 } }, emp.nombre),
              React.createElement("div", { className: "t3", style: { fontSize: 12.5, marginTop: 2 } }, emp.cargo)),
            React.createElement(window.Badge, { kind: estadoBadge.kind }, estadoBadge.label)),

          // Rendimiento
          React.createElement("div", { className: "field__label" }, "Rendimiento"),
          React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 16 } },
            React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
              React.createElement("span", { className: "t2", style: { fontSize: 13 } }, "Indicador de desempeño"),
              React.createElement(window.Badge, { kind: d.kind }, d.nivel)),
            React.createElement("div", { className: "meter " + d.kind, style: { marginBottom: 8 } }, React.createElement("i", { style: { width: d.pct + "%" } })),
            React.createElement("div", { className: "row", style: { justifyContent: "space-between" } },
              React.createElement("span", { className: "t3", style: { fontSize: 11.5 } }, "Balance neto"),
              React.createElement("b", { className: "num", style: { fontSize: 13.5, color: d.neto >= 0 ? "var(--ok)" : "var(--danger)" } }, (d.neto >= 0 ? "+" : "−") + window.money0(Math.abs(d.neto))))),

          // Bonificaciones / descuentos
          React.createElement("div", { className: "row gap10", style: { marginBottom: 16 } },
            stat("Bonificaciones acum.", window.money0(d.bonif), "var(--ok)"),
            stat("Descuentos acum.", window.money0(d.desc), "var(--danger)")),

          // Control de pagos (frecuencia · próxima fecha · adelanto · acciones)
          React.createElement("div", { className: "field__label" }, "Control de pagos"),
          React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 16 } },
            React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
              React.createElement("span", { className: "t2", style: { fontSize: 13 } }, "Próximo pago · " + (emp.frecuencia || "mensual")),
              vence
                ? React.createElement(window.Badge, { kind: "warn" }, "Toca pagar")
                : React.createElement(window.Badge, { kind: "ok" }, window.proximaFechaPago(emp))),
            React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center" } },
              React.createElement("span", { className: "t3", style: { fontSize: 12 } }, "Adelanto pendiente"),
              React.createElement("b", { className: "num", style: { fontSize: 13.5, color: pendiente > 0 ? "var(--warn)" : "var(--text-2)" } }, window.money(pendiente))),
            !inactivo && React.createElement("div", { className: "row gap8", style: { marginTop: 12 } },
              vence && React.createElement("button", { className: "btn btn--accent btn--sm", style: { flex: 1 }, onClick: () => setPagar(true) },
                React.createElement(window.Icon, { name: "dollar", style: { width: 14, height: 14 } }), "Pagar sueldo"),
              React.createElement("button", { className: "btn btn--ghost btn--sm", style: { flex: 1 }, onClick: () => setAdel(true) },
                React.createElement(window.Icon, { name: "plus", style: { width: 14, height: 14 } }), "Adelanto"))),

          // Ficha
          React.createElement("div", { className: "field__label" }, "Datos de la ficha"),
          React.createElement("div", { style: { marginBottom: 16 } }, ficha.map(([l, v]) => React.createElement(React.Fragment, { key: l }, fichaRow(l, v)))),

          // Historial mensual
          React.createElement("div", { className: "field__label" }, "Historial mensual"),
          (emp.historial && emp.historial.length)
            ? React.createElement("div", { className: "card", style: { padding: 6, marginBottom: 18 } },
                React.createElement("div", { className: "row", style: { padding: "6px 10px", justifyContent: "space-between" } },
                  React.createElement("span", { className: "t3", style: { fontSize: 11, flex: 1 } }, "Mes"),
                  React.createElement("span", { className: "t3", style: { fontSize: 11, width: 90, textAlign: "right" } }, "Bonif."),
                  React.createElement("span", { className: "t3", style: { fontSize: 11, width: 90, textAlign: "right" } }, "Desc.")),
                emp.historial.map((h, i) => React.createElement("div", { key: i, className: "line", style: { padding: "8px 10px", borderBottom: i < emp.historial.length - 1 ? "1px solid var(--border)" : "none" } },
                  React.createElement("span", { style: { flex: 1, fontSize: 13, fontWeight: 500 } }, h.mes),
                  React.createElement("b", { className: "num", style: { width: 90, textAlign: "right", color: "var(--ok)", fontSize: 13 } }, "+" + window.money0(h.bonif)),
                  React.createElement("b", { className: "num", style: { width: 90, textAlign: "right", color: "var(--danger)", fontSize: 13 } }, "−" + window.money0(h.desc)))))
            : React.createElement("div", { className: "empty", style: { padding: 18, marginBottom: 18 } }, React.createElement(window.Icon, { name: "clock" }), "Sin movimientos registrados"),

          // Historial de pagos
          React.createElement("div", { className: "field__label" }, "Historial de pagos"),
          (emp.pagos && emp.pagos.length)
            ? React.createElement("div", { className: "card", style: { padding: 6, marginBottom: 18 } },
                emp.pagos.map((h, i) => {
                  const esAd = h.tipo === "adelanto";
                  return React.createElement("div", { key: h.id || i, className: "line", style: { padding: "9px 10px", alignItems: "center", borderBottom: i < emp.pagos.length - 1 ? "1px solid var(--border)" : "none" } },
                    React.createElement("div", { style: { flex: 1 } },
                      React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, esAd ? "Adelanto" : "Pago de sueldo"),
                      React.createElement("div", { className: "t3", style: { fontSize: 11 } }, h.fecha + " · " + h.metodo + (esAd ? "" : (" · base " + window.money0(h.sueldo) + (h.bonif ? " · +" + window.money0(h.bonif) : "") + (h.desc ? " · −" + window.money0(h.desc) : "") + (h.adelanto ? " · adel −" + window.money0(h.adelanto) : ""))))),
                    React.createElement("b", { className: "num", style: { fontSize: 13.5, color: esAd ? "var(--warn)" : "var(--ok)" } }, (esAd ? "−" : "") + window.money0(Math.abs(h.total))));
                }))
            : React.createElement("div", { className: "empty", style: { padding: 18, marginBottom: 18 } }, React.createElement(window.Icon, { name: "clock" }), "Sin pagos registrados"),

          // Acción retirar / reincorporar
          inactivo
            ? React.createElement("button", { className: "btn btn--ghost btn--lg btn--block", onClick: () => { reactivarEmpleado(emp.id); onClose(); } },
                React.createElement(window.Icon, { name: "check" }), "Reincorporar empleado")
            : (confirm
                ? React.createElement("div", { className: "card", style: { padding: 14, borderColor: "var(--danger)" } },
                    React.createElement("div", { className: "t2", style: { fontSize: 13, marginBottom: 12 } }, "¿Retirar a " + emp.nombre.split(" ")[0] + "? Se conserva la ficha e historial."),
                    React.createElement("div", { className: "row gap8" },
                      React.createElement("button", { className: "btn btn--ghost btn--sm", style: { flex: 1 }, onClick: () => setConfirm(false) }, "Cancelar"),
                      React.createElement("button", { className: "btn btn--danger btn--sm", style: { flex: 1 }, onClick: () => { retirarEmpleado(emp.id); onClose(); } }, "Sí, retirar")))
                : React.createElement("button", { className: "btn btn--danger btn--lg btn--block", onClick: () => setConfirm(true) },
                    React.createElement(window.Icon, { name: "logout" }), "Retirar empleado"))))),
        pagar && React.createElement(window.PagarEmpleadoModal, { emp, onClose: () => setPagar(false) }),
        adel && React.createElement(window.AdelantoEmpleadoModal, { emp, onClose: () => setAdel(false) })
  );
}
window.EmpleadoDetalleModal = EmpleadoDetalleModal;

/* ============================================================
   PAGAR EMPLEADO — método, sueldo, bonif/desc, adelanto → caja
   ============================================================ */
function PagarEmpleadoModal({ emp, onClose }) {
  const { pagarEmpleado, cajaAbierta, setView } = window.useStore();
  const [metodo, setMetodo] = _pS("Efectivo");
  const [bonif, setBonif] = _pS("");
  const [descu, setDescu] = _pS("");
  const pendiente = emp.adelantoPendiente || 0;
  const [adelanto, setAdelanto] = _pS(pendiente > 0 ? String(pendiente) : "");

  const b = Math.max(0, parseFloat(bonif) || 0);
  const d = Math.max(0, parseFloat(descu) || 0);
  const adv = Math.max(0, Math.min(parseFloat(adelanto) || 0, pendiente));
  const total = Math.max(0, emp.sueldo + b - d - adv);
  const periodo = window.proximaFechaPago(emp);

  const numField = (label, val, set, props) => React.createElement("label", { className: "field", style: { flex: 1 } },
    React.createElement("span", { className: "field__label" }, label),
    React.createElement("input", Object.assign({ className: "input", type: "number", value: val, onChange: e => set(e.target.value), placeholder: "0" }, props || {})));

  const confirmar = () => {
    const r = pagarEmpleado(emp.id, { metodo, bonif: b, desc: d, adelanto: adv, periodo });
    if (r) onClose();
  };
  const boleta = () => window.exportarBoletaEmpleado(emp, { periodo, base: emp.sueldo, bonos: b, descuentos: d, adelanto: adv, metodo, total });

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 100 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(460px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Pago de sueldo · " + emp.nombre),
          React.createElement("div", { className: "num", style: { fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: "var(--accent)" } }, window.money(total)),
          React.createElement("div", { className: "t3", style: { fontSize: 12, marginBottom: 16 } }, emp.cargo + " · " + (emp.frecuencia || "mensual") + " · periodo al " + periodo),

          !cajaAbierta && React.createElement("div", { className: "card", style: { padding: 12, marginBottom: 16, borderColor: "var(--border-accent)", display: "flex", gap: 10, alignItems: "center" } },
            React.createElement(window.Icon, { name: "alert", style: { width: 18, height: 18, color: "var(--warn)" } }),
            React.createElement("div", { style: { flex: 1, fontSize: 12.5 } }, "La caja no está aperturada. Ábrela para registrar el pago."),
            React.createElement("button", { className: "btn btn--sm btn--accent", onClick: () => { onClose(); setView("caja"); } }, "Ir a Caja")),

          // Bonificación / descuento
          React.createElement("div", { className: "row gap10", style: { marginBottom: 12 } },
            numField("Bonificación (S/)", bonif, setBonif),
            numField("Descuento (S/)", descu, setDescu)),

          // Adelanto
          React.createElement("div", { style: { marginBottom: 14 } },
            numField("Adelanto a descontar (S/)", adelanto, setAdelanto, { max: pendiente || undefined, disabled: pendiente <= 0 }),
            React.createElement("div", { className: "t3", style: { fontSize: 11.5, marginTop: 6 } },
              pendiente > 0
                ? ("Saldo de adelantos pendiente: " + window.money(pendiente) + " · se descuenta automáticamente")
                : "Sin adelantos pendientes")),

          // Desglose
          React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 16 } },
            React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "Sueldo base"), React.createElement("span", { className: "num" }, window.money(emp.sueldo))),
            b > 0 && React.createElement("div", { className: "sumline" }, React.createElement("span", { style: { color: "var(--ok)" } }, "Bonificación"), React.createElement("span", { className: "num", style: { color: "var(--ok)" } }, "+ " + window.money(b))),
            d > 0 && React.createElement("div", { className: "sumline" }, React.createElement("span", { style: { color: "var(--danger)" } }, "Descuento"), React.createElement("span", { className: "num", style: { color: "var(--danger)" } }, "− " + window.money(d))),
            adv > 0 && React.createElement("div", { className: "sumline" }, React.createElement("span", { style: { color: "var(--danger)" } }, "Adelanto entregado"), React.createElement("span", { className: "num", style: { color: "var(--danger)" } }, "− " + window.money(adv))),
            React.createElement("div", { className: "sumline total" }, React.createElement("span", null, "Total a pagar"), React.createElement("b", { className: "num", style: { fontSize: 22, color: "var(--ok)" } }, window.money(total)))),

          // Método de pago (efectivo o Yape)
          React.createElement("div", { className: "field__label" }, "Método de pago"),
          React.createElement("div", { className: "pay-method", style: { gridTemplateColumns: "1fr 1fr", marginBottom: 16 } },
            [["Efectivo", "cash"], ["Yape", "yape"]].map(([m, ic]) =>
              React.createElement("button", { key: m, className: metodo === m ? "is-active" : "", onClick: () => setMetodo(m) }, React.createElement(window.Icon, { name: ic }), React.createElement("span", null, m)))),

          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", disabled: !cajaAbierta, onClick: confirmar },
            React.createElement(window.Icon, { name: "check" }), "Confirmar pago · " + window.money(total)),
          React.createElement("button", { className: "btn btn--ghost btn--block", style: { marginTop: 8 }, onClick: boleta },
            React.createElement(window.Icon, { name: "down" }), "Vista previa de boleta"),
          React.createElement("div", { className: "t3", style: { fontSize: 11, textAlign: "center", marginTop: 12, lineHeight: 1.5 } },
            "Al confirmar se descuenta de la caja (" + metodo.toLowerCase() + "),", React.createElement("br", null), "se guarda en el historial y se agenda la próxima fecha de pago.")))));
}
window.PagarEmpleadoModal = PagarEmpleadoModal;

/* ============================================================
   ADELANTO — entrega dinero antes del pago (saldo pendiente)
   ============================================================ */
function AdelantoEmpleadoModal({ emp, onClose }) {
  const { registrarAdelanto, cajaAbierta, setView } = window.useStore();
  const [metodo, setMetodo] = _pS("Efectivo");
  const [monto, setMonto] = _pS("");
  const m = Math.max(0, parseFloat(monto) || 0);
  const pendiente = emp.adelantoPendiente || 0;

  const confirmar = () => {
    const r = registrarAdelanto(emp.id, { metodo, monto: m });
    if (r) onClose();
  };

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 100 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(420px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Adelanto de sueldo · " + emp.nombre),
          React.createElement("h2", { style: { margin: "0 0 6px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700 } }, "Registrar adelanto"),
          React.createElement("p", { className: "t2", style: { marginTop: 0, marginBottom: 16, fontSize: 13 } }, "El monto sale de la caja ahora y se descuenta automáticamente en el próximo pago."),

          pendiente > 0 && React.createElement("div", { className: "card", style: { padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", { className: "t2", style: { fontSize: 12.5 } }, "Saldo de adelantos actual"),
            React.createElement("b", { className: "num", style: { color: "var(--warn)" } }, window.money(pendiente))),

          !cajaAbierta && React.createElement("div", { className: "card", style: { padding: 12, marginBottom: 16, borderColor: "var(--border-accent)", display: "flex", gap: 10, alignItems: "center" } },
            React.createElement(window.Icon, { name: "alert", style: { width: 18, height: 18, color: "var(--warn)" } }),
            React.createElement("div", { style: { flex: 1, fontSize: 12.5 } }, "La caja no está aperturada."),
            React.createElement("button", { className: "btn btn--sm btn--accent", onClick: () => { onClose(); setView("caja"); } }, "Ir a Caja")),

          React.createElement("label", { className: "field", style: { display: "block", marginBottom: 14 } },
            React.createElement("span", { className: "field__label" }, "Monto del adelanto (S/)"),
            React.createElement("input", { className: "input", type: "number", value: monto, onChange: e => setMonto(e.target.value), placeholder: "0" })),

          React.createElement("div", { className: "field__label" }, "Método"),
          React.createElement("div", { className: "pay-method", style: { gridTemplateColumns: "1fr 1fr", marginBottom: 16 } },
            [["Efectivo", "cash"], ["Yape", "yape"]].map(([mm, ic]) =>
              React.createElement("button", { key: mm, className: metodo === mm ? "is-active" : "", onClick: () => setMetodo(mm) }, React.createElement(window.Icon, { name: ic }), React.createElement("span", null, mm)))),

          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", disabled: !cajaAbierta || m <= 0, onClick: confirmar },
            React.createElement(window.Icon, { name: "check" }), "Registrar adelanto · " + window.money(m))))));
}
window.AdelantoEmpleadoModal = AdelantoEmpleadoModal;
