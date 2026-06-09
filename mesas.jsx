/* ============================================================
   TALISMÁN — Módulo MESAS + Comanda + Cobro
   ============================================================ */
const { useState: _uS, useMemo: _uM } = React;

/* ---------- KPIs de mesas ---------- */
function MesasKpis() {
  const { resumenMesas: r } = window.useStore();
  const items = [
    { k: "libre", label: "Libres", cls: "ok" },
    { k: "ocupada", label: "Ocupadas", cls: "busy" },
    { k: "reservada", label: "Reservadas", cls: "resv" },
    { k: "cuenta", label: "Piden cuenta", cls: "warn" },
  ];
  return React.createElement("div", { className: "row gap10 wrap", style: { marginBottom: 16 } },
    items.map(it => React.createElement("div", { key: it.k, className: "card", style: { padding: "11px 15px", display: "flex", alignItems: "center", gap: 11, minWidth: 132 } },
      React.createElement("span", { className: "badge badge--" + it.cls, style: { height: 26, width: 26, padding: 0, justifyContent: "center", borderRadius: 8 } },
        React.createElement("i", { className: "dot", style: { width: 8, height: 8 } })),
      React.createElement("div", null,
        React.createElement("div", { className: "num", style: { fontSize: 21, fontWeight: 700, lineHeight: 1 } }, r[it.k] || 0),
        React.createElement("div", { className: "t3", style: { fontSize: 11, marginTop: 2 } }, it.label))
    )),
    React.createElement("div", { className: "card", style: { padding: "11px 15px", marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 } },
      React.createElement("div", null,
        React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" } }, "Comensales"),
        React.createElement("div", { className: "num", style: { fontSize: 19, fontWeight: 700 } }, r.comensales)),
      React.createElement("div", { style: { width: 1, height: 32, background: "var(--border)" } }),
      React.createElement("div", null,
        React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" } }, "Venta abierta"),
        React.createElement("div", { className: "num", style: { fontSize: 19, fontWeight: 700, color: "var(--accent)" } }, window.money0(r.ventaAbierta)))
    )
  );
}

/* ---------- Popup con la información de la reserva ---------- */
function ReservaInfoModal({ mesa, onClose }) {
  const { liberarReserva, toast } = window.useStore();
  const rv = mesa.reserva || {};
  const fila = (label, valor, icon) => React.createElement("div", { className: "row gap10", style: { alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border)" } },
    React.createElement("span", { className: "badge badge--resv", style: { width: 34, height: 34, borderRadius: 10, padding: 0, justifyContent: "center", flex: "0 0 auto" } }, React.createElement(window.Icon, { name: icon, style: { width: 16, height: 16 } })),
    React.createElement("div", { style: { flex: 1 } },
      React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" } }, label),
      React.createElement("div", { style: { fontWeight: 600, fontSize: 14, marginTop: 1 } }, valor || "—")));
  const liberar = () => { liberarReserva(mesa.id); toast("Reserva liberada · Mesa " + mesa.num); onClose(); };
  const stop = ev => ev.stopPropagation();
  return ReactDOM.createPortal(React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: ev => { ev.stopPropagation(); onClose(); } }),
    React.createElement("div", { className: "modal-wrap", onClick: stop },
      React.createElement("div", { className: "modal", style: { width: "min(420px,96vw)" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "row gap10", style: { alignItems: "center", marginBottom: 16 } },
            React.createElement("span", { className: "badge badge--resv", style: { width: 46, height: 46, borderRadius: 13, padding: 0, justifyContent: "center" } }, React.createElement(window.Icon, { name: "hourglass", style: { width: 20, height: 20 } })),
            React.createElement("div", null,
              React.createElement("div", { className: "kicker", style: { margin: 0 } }, "Mesa " + String(mesa.num).padStart(2, "0") + " · " + mesa.zona + " · " + mesa.cap + " sillas"),
              React.createElement("h2", { style: { margin: "2px 0 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 } }, "Reserva"))),
          fila("Nombre o familia", rv.cliente, "user"),
          fila("Celular", rv.celular, "personal"),
          fila("Hora de la reserva", rv.hora, "hourglass"),
          fila("N° de personas", rv.personas ? rv.personas + " personas" : null, "grid"),
          rv.notas ? React.createElement("div", { style: { paddingTop: 12 } },
            React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 } }, "Notas"),
            React.createElement("div", { className: "t2", style: { fontSize: 13.5, lineHeight: 1.5 } }, rv.notas)) : null,
          React.createElement("button", { className: "btn btn--ghost btn--block", style: { marginTop: 18 }, onClick: liberar },
            React.createElement(window.Icon, { name: "x", style: { width: 15, height: 15 } }), "Liberar reserva"))))
  ), document.body);
}

/* ---------- Alerta: mesa reservada, ¿agregar comanda? ---------- */
function ConfirmComandaModal({ mesa, onConfirm, onCancel }) {
  const rv = mesa.reserva || {};
  return ReactDOM.createPortal(React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: ev => { ev.stopPropagation(); onCancel(); } }),
    React.createElement("div", { className: "modal-wrap", onClick: ev => ev.stopPropagation() },
      React.createElement("div", { className: "modal", style: { width: "min(400px,94vw)" } },
        React.createElement("div", { className: "modal__pad", style: { textAlign: "center" } },
          React.createElement("span", { className: "badge badge--resv", style: { width: 48, height: 48, borderRadius: 14, padding: 0, justifyContent: "center", marginBottom: 10 } }, React.createElement(window.Icon, { name: "hourglass", style: { width: 22, height: 22 } })),
          React.createElement("h2", { style: { margin: "4px 0 6px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 } }, "Mesa " + mesa.num + " reservada"),
          React.createElement("p", { className: "t2", style: { margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.5 } },
            "Esta mesa está reservada" + (rv.cliente ? " a nombre de " + rv.cliente : "") + (rv.hora ? " · " + rv.hora : "") + ". ¿Deseas agregar una comanda?"),
          React.createElement("div", { className: "row gap8", style: { width: "100%" } },
            React.createElement("button", { className: "btn btn--ghost", style: { flex: 1 }, onClick: onCancel }, "Cancelar"),
            React.createElement("button", { className: "btn btn--accent", style: { flex: 1.3 }, onClick: onConfirm },
              React.createElement(window.Icon, { name: "receipt", style: { width: 15, height: 15 } }), "Agregar comanda"))))))
  , document.body);
}

/* ---------- Tarjeta de mesa (cuadrícula) ---------- */
function MesaCard({ mesa }) {
  const { setDrawerMesa, mesaTotal, mesaItems } = window.useStore();
  const [verReserva, setVerReserva] = _uS(false);
  const [confirmComanda, setConfirmComanda] = _uS(false);
  const e = window.ESTADO[mesa.estado];
  const total = mesaTotal(mesa);
  const esReservada = mesa.estado === "reservada";
  const rv = mesa.reserva;
  const abrir = () => { if (esReservada) setConfirmComanda(true); else setDrawerMesa(mesa.id); };
  return React.createElement("div", { className: "mesa " + e.dotCls, role: "button", tabIndex: 0, onClick: abrir },
    React.createElement("div", { className: "mesa__top" },
      React.createElement("div", null,
        React.createElement("div", { className: "mesa__id" }, String(mesa.num).padStart(2, "0")),
        React.createElement("div", { className: "mesa__zone" }, mesa.zona + " · " + mesa.cap + " sillas")),
      React.createElement(window.Badge, { kind: e.cls }, e.label)),
    React.createElement("div", { className: "mesa__meta" },
      React.createElement("div", { className: "mesa__metric" },
        React.createElement("b", null, mesa.comensales || "—"),
        React.createElement("span", null, "Comensales")),
      React.createElement("div", { className: "mesa__metric" },
        React.createElement("b", null, window.fmtMin(mesa.minAbierta)),
        React.createElement("span", null, "Tiempo")),
      React.createElement("div", { className: "mesa__metric" },
        React.createElement("b", null, mesaItems(mesa) || "—"),
        React.createElement("span", null, "Ítems"))),
    React.createElement("div", { className: "mesa__total" },
      React.createElement("span", { className: "t3", style: { fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" } }, mesa.mozo ? "Mozo " + mesa.mozo : "Sin asignar"),
      React.createElement("b", { style: { color: total ? "var(--text)" : "var(--text-3)" } }, window.money0(total))),
    /* Botón para ver la información de la reserva */
    esReservada && React.createElement("div", { className: "mesa__resv-actions" },
      React.createElement("button", { className: "btn btn--ghost btn--sm btn--block", onClick: ev => { ev.stopPropagation(); setVerReserva(true); } },
        React.createElement(window.Icon, { name: "receipt", style: { width: 14, height: 14 } }), "Ver reserva")),
    verReserva && React.createElement(ReservaInfoModal, { mesa: mesa, onClose: () => setVerReserva(false) }),
    confirmComanda && React.createElement(ConfirmComandaModal, {
      mesa: mesa,
      onCancel: () => setConfirmComanda(false),
      onConfirm: () => { setConfirmComanda(false); setDrawerMesa(mesa.id); }
    })
  );
}

/* ---------- Vista CUADRÍCULA ---------- */
function VistaGrid({ mesas }) {
  return React.createElement("div", { className: "mesa-grid stagger" },
    mesas.map(m => React.createElement(MesaCard, { key: m.id, mesa: m })));
}

/* ---------- Vista PLANO DEL SALÓN ---------- */
function VistaPlano({ mesas }) {
  const { setDrawerMesa, mesaTotal, D } = window.useStore();
  return React.createElement("div", null,
    React.createElement("div", { className: "floor fade-up" },
      D.zonas.map(z => React.createElement("div", {
        key: z.nombre, className: "floor__zone",
        style: { left: z.x + "%", top: z.y + "%", width: z.w + "%", height: z.h + "%" }
      }, z.nombre)),
      mesas.map(m => {
        const e = window.ESTADO[m.estado];
        const sz = m.cap >= 6 ? 78 : m.cap >= 4 ? 66 : m.cap <= 1 ? 46 : 56;
        return React.createElement("button", {
          key: m.id, className: "ftable " + (m.shape === "round" ? "round " : "") + e.dotCls,
          style: { left: m.pos.x + "%", top: m.pos.y + "%", width: sz, height: m.shape === "round" ? sz : sz * 0.74, fontSize: m.cap <= 1 ? 13 : 16 },
          onClick: () => setDrawerMesa(m.id),
          title: `Mesa ${m.num} · ${e.label}`
        },
          String(m.num).padStart(2, "0"),
          m.estado !== "libre" && m.estado !== "reservada" &&
            React.createElement("small", null, window.money0(mesaTotal(m)))
        );
      })
    ),
    React.createElement("div", { className: "row gap16 wrap", style: { marginTop: 14, justifyContent: "center" } },
      Object.entries(window.ESTADO).map(([k, e]) =>
        React.createElement("div", { key: k, className: "row gap8", style: { fontSize: 12 } },
          React.createElement("span", { className: "badge badge--" + e.cls, style: { width: 14, height: 14, padding: 0, borderRadius: 5 } },
            React.createElement("i", { className: "dot" })),
          React.createElement("span", { className: "t2" }, e.label))))
  );
}

/* ---------- Vista LISTA ---------- */
function VistaLista({ mesas }) {
  const { setDrawerMesa, mesaTotal, mesaItems } = window.useStore();
  return React.createElement("div", { className: "card fade-up", style: { overflow: "hidden" } },
    React.createElement("table", { className: "tbl" },
      React.createElement("thead", null, React.createElement("tr", null,
        ["Mesa", "Zona", "Estado", "Comensales", "Tiempo", "Ítems", "Mozo", "Total", ""].map((h, i) =>
          React.createElement("th", { key: i, style: i >= 7 ? { textAlign: "right" } : null }, h)))),
      React.createElement("tbody", null,
        mesas.map(m => {
          const e = window.ESTADO[m.estado];
          return React.createElement("tr", { key: m.id, style: { cursor: "pointer" }, onClick: () => setDrawerMesa(m.id) },
            React.createElement("td", null, React.createElement("b", { className: "num", style: { fontSize: 15 } }, String(m.num).padStart(2, "0"))),
            React.createElement("td", { className: "t2" }, m.zona),
            React.createElement("td", null, React.createElement(window.Badge, { kind: e.cls }, e.label)),
            React.createElement("td", { className: "num" }, m.comensales || "—"),
            React.createElement("td", { className: "num t2" }, window.fmtMin(m.minAbierta)),
            React.createElement("td", { className: "num" }, mesaItems(m) || "—"),
            React.createElement("td", { className: "t2" }, m.mozo || "—"),
            React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, color: mesaTotal(m) ? "var(--text)" : "var(--text-3)" } }, window.money0(mesaTotal(m))),
            React.createElement("td", { style: { textAlign: "right", color: "var(--text-3)" } }, React.createElement(window.Icon, { name: "chevR", style: { width: 16, height: 16 } })));
        }))
    ));
}

/* ---------- VISTA PRINCIPAL MESAS ---------- */
function MesasView() {
  const { mesas, setDrawerMesa, D } = window.useStore();
  const [layout, setLayout] = _uS("grid");
  const [zona, setZona] = _uS("Todas");
  const [admin, setAdmin] = _uS(false);
  const [nuevaOrden, setNuevaOrden] = _uS(false);
  const zonasList = ["Todas", ...D.zonas.map(z => z.nombre)];
  const activas = _uM(() => mesas.filter(m => m.activa !== false && !m.llevar), [mesas]);
  const filtered = _uM(() => zona === "Todas" ? activas : activas.filter(m => m.zona === zona), [activas, zona]);

  return React.createElement("div", { className: "view" },
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, "Operación en piso"),
        React.createElement("h1", { className: "page-title" }, "Mesas"),
        React.createElement("p", { className: "page-sub" }, "Toca una mesa para abrir su comanda, agregar productos o cobrar.")),
      React.createElement("div", { className: "row gap8" },
        React.createElement("button", { className: "btn btn--ghost", onClick: () => setAdmin(true) },
          React.createElement(window.Icon, { name: "grid" }), "Administrar mesas"),
        React.createElement("button", { className: "btn btn--accent", onClick: () => setNuevaOrden(true) },
          React.createElement(window.Icon, { name: "receipt" }), "Nueva orden"))),

    React.createElement(MesasKpis, null),

    React.createElement("div", { className: "row gap12 wrap", style: { marginBottom: 18, justifyContent: "space-between" } },
      React.createElement("div", { className: "row gap8 wrap" },
        zonasList.map(z => React.createElement("button", {
          key: z, className: "chip" + (zona === z ? " is-active" : ""), onClick: () => setZona(z)
        }, z))),
      React.createElement("div", { className: "seg" },
        [["grid", "Cuadrícula", "grid"], ["plano", "Plano", "map"], ["lista", "Lista", "list"]].map(([id, lbl, ic]) =>
          React.createElement("button", { key: id, className: layout === id ? "is-active" : "", onClick: () => setLayout(id) },
            React.createElement(window.Icon, { name: ic }), lbl)))),

    layout === "grid" && React.createElement(VistaGrid, { mesas: filtered }),
    layout === "plano" && React.createElement(VistaPlano, { mesas: filtered }),
    layout === "lista" && React.createElement(VistaLista, { mesas: filtered }),

    admin && React.createElement(AdminMesasModal, { onClose: () => setAdmin(false) }),
    nuevaOrden && React.createElement(NuevaOrdenModal, { onClose: () => setNuevaOrden(false) })
  );
}
window.MesasView = MesasView;

/* ---------- Formulario de reserva (selección directa) ---------- */
function ReservaFormCard({ mesa, onConfirm, onCancel }) {
  const r = mesa.reserva || {};
  const [cliente, setCliente] = _uS(r.cliente || "");
  const [celular, setCelular] = _uS(r.celular || "");
  const [personas, setPersonas] = _uS(r.personas || "");
  const [hora, setHora] = _uS(r.hora || "");
  const [notas, setNotas] = _uS(r.notas || "");
  const { toast } = window.useStore();
  const guardar = () => {
    if (!cliente.trim()) { toast("Escribe el nombre de la reserva", "warn"); return; }
    if (!hora) { toast("Indica la hora de la reserva", "warn"); return; }
    onConfirm({
      cliente: cliente.trim(),
      celular: celular.trim() || null,
      personas: personas ? parseInt(personas, 10) : null,
      hora,
      notas: notas.trim() || null,
    });
  };
  const field = (label, input) => React.createElement("label", { className: "field", style: { marginBottom: 0, flex: 1 } },
    React.createElement("span", { className: "field__label" }, label), input);
  return React.createElement("div", { className: "confirm-over" },
    React.createElement("div", { className: "confirm-card", style: { width: "min(460px,94%)", alignItems: "stretch", textAlign: "left", maxHeight: "86vh", overflowY: "auto" } },
      React.createElement("div", { className: "row gap10", style: { alignItems: "center", marginBottom: 4 } },
        React.createElement("span", { className: "badge badge--resv", style: { width: 42, height: 42, borderRadius: 12, padding: 0, justifyContent: "center" } }, React.createElement(window.Icon, { name: "hourglass", style: { width: 19, height: 19 } })),
        React.createElement("div", null,
          React.createElement("div", { className: "kicker", style: { margin: 0 } }, "Mesa " + String(mesa.num).padStart(2, "0") + " · " + mesa.zona + " · " + mesa.cap + " sillas"),
          React.createElement("h3", { style: { margin: "2px 0 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 18 } }, "Datos de la reserva"))),
      React.createElement("label", { className: "field", style: { marginTop: 14, marginBottom: 12 } },
        React.createElement("span", { className: "field__label" }, "Nombre o familia que reserva"),
        React.createElement("input", { className: "input", placeholder: "Ej: Familia Torres", value: cliente, onChange: e => setCliente(e.target.value), autoFocus: true })),
      React.createElement("div", { className: "row gap8", style: { marginBottom: 12 } },
        field("Celular", React.createElement("input", { className: "input", type: "tel", placeholder: "9XX XXX XXX", value: celular, onChange: e => setCelular(e.target.value) })),
        field("N° de personas", React.createElement("input", { className: "input", type: "number", min: "1", placeholder: "—", value: personas, onChange: e => setPersonas(e.target.value) }))),
      React.createElement("div", { className: "row gap8", style: { marginBottom: 12 } },
        field("Hora de la reserva", React.createElement("input", { className: "input", type: "time", value: hora, onChange: e => setHora(e.target.value) }))),
      React.createElement("label", { className: "field", style: { marginBottom: 16 } },
        React.createElement("span", { className: "field__label" }, "Notas (opcional)"),
        React.createElement("textarea", { className: "input", rows: 2, placeholder: "Cumpleaños, ubicación preferida, alergias…", value: notas, onChange: e => setNotas(e.target.value), style: { resize: "vertical", minHeight: 56, fontFamily: "inherit" } })),
      React.createElement("div", { className: "row gap8", style: { width: "100%" } },
        React.createElement("button", { className: "btn btn--ghost", style: { flex: 1 }, onClick: onCancel }, "Cancelar"),
        React.createElement("button", { className: "btn btn--accent", style: { flex: 1.4 }, onClick: guardar }, React.createElement(window.Icon, { name: "check" }), "Confirmar reserva"))));
}

/* ---------- ADMINISTRAR MESAS (agregar / inactivar) ---------- */
function AdminMesasModal({ onClose }) {
  const { mesas, nuevaMesa, inactivarMesa, reservar, liberarReserva, toast, D } = window.useStore();
  const [tab, setTab] = _uS("agregar");
  const [cap, setCap] = _uS(4);
  const [zona, setZona] = _uS("Salón");
  const [confirm, setConfirm] = _uS(null); // mesa a inactivar
  const [reservaForm, setReservaForm] = _uS(null); // mesa a reservar (form abierto)
  const activas = mesas.filter(m => m.activa !== false && !m.llevar);
  const proxNum = Math.max(0, ...mesas.filter(m => !m.llevar).map(m => m.num)) + 1;

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(560px, 96vw)" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Gestión de piso"),
          React.createElement("h2", { style: { margin: "0 0 16px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 } }, "Administrar mesas"),
          React.createElement("div", { className: "seg", style: { marginBottom: 18 } },
            [["agregar", "Agregar mesa", "plus"], ["eliminar", "Eliminar mesa", "trash"], ["reservar", "Reservar mesa", "hourglass"]].map(([k, l, ic]) =>
              React.createElement("button", { key: k, className: tab === k ? "is-active" : "", onClick: () => setTab(k) }, React.createElement(window.Icon, { name: ic }), l))),

          tab === "agregar" && React.createElement("div", null,
            React.createElement("div", { className: "field__label" }, "Cantidad de sillas"),
            React.createElement("div", { className: "row gap8 wrap", style: { marginBottom: 16 } },
              [1, 2, 4, 6, 8].map(n => React.createElement("button", { key: n, className: "chip" + (cap === n ? " is-active" : ""), onClick: () => setCap(n) }, n + " sillas"))),
            React.createElement("div", { className: "field__label" }, "Ubicación"),
            React.createElement("div", { className: "row gap8 wrap", style: { marginBottom: 18 } },
              D.zonas.map(z => React.createElement("button", { key: z.nombre, className: "chip" + (zona === z.nombre ? " is-active" : ""), onClick: () => setZona(z.nombre) }, z.nombre))),
            React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 } },
              React.createElement("div", { style: { display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 12, background: "var(--accent-soft)", color: "var(--accent)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 } }, String(proxNum).padStart(2, "0")),
              React.createElement("div", null,
                React.createElement("div", { style: { fontWeight: 600 } }, "Mesa " + proxNum + " · numeración automática"),
                React.createElement("div", { className: "t3", style: { fontSize: 12 } }, zona + " · " + cap + " sillas"))),
            React.createElement("button", { className: "btn btn--accent btn--lg btn--block", onClick: () => { nuevaMesa({ cap, zona }); onClose(); } },
              React.createElement(window.Icon, { name: "plus" }), "Agregar mesa " + proxNum)),

          tab === "eliminar" && React.createElement("div", null,
            React.createElement("p", { className: "t2", style: { marginTop: -4, marginBottom: 14, fontSize: 13 } }, "Selecciona la mesa a retirar del piso. No se borra el historial: la mesa queda marcada como inactiva."),
            React.createElement("div", { className: "mesa-grid", style: { gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", maxHeight: 320, overflowY: "auto", paddingRight: 4 } },
              activas.map(m => React.createElement("button", { key: m.id, className: "mesa s-" + m.estado, style: { padding: 12 }, onClick: () => setConfirm(m) },
                React.createElement("div", { className: "mesa__id", style: { fontSize: 20 } }, String(m.num).padStart(2, "0")),
                React.createElement("div", { className: "mesa__zone" }, m.zona + " · " + m.cap + " sillas"),
                React.createElement("div", { style: { marginTop: 10 } }, React.createElement(window.Badge, { kind: window.ESTADO[m.estado].cls }, window.ESTADO[m.estado].label)))))),

          tab === "reservar" && React.createElement("div", null,
            React.createElement("p", { className: "t2", style: { marginTop: -4, marginBottom: 14, fontSize: 13 } }, "Selecciona una mesa libre para llenar los datos de la reserva. Si ya está reservada, vuelve a tocarla para liberar la reserva."),
            React.createElement("div", { className: "mesa-grid", style: { gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", maxHeight: 320, overflowY: "auto", paddingRight: 4 } },
              activas.map(m => {
                const esResv = m.estado === "reservada";
                const click = () => {
                  if (esResv) { liberarReserva(m.id); toast("Reserva liberada · Mesa " + m.num); }
                  else { setReservaForm(m); }
                };
                return React.createElement("button", { key: m.id, className: "mesa s-" + m.estado, style: { padding: 12 }, onClick: click },
                  React.createElement("div", { className: "mesa__id", style: { fontSize: 20 } }, String(m.num).padStart(2, "0")),
                  React.createElement("div", { className: "mesa__zone" }, m.zona + " · " + m.cap + " sillas"),
                  React.createElement("div", { style: { marginTop: 10 } }, React.createElement(window.Badge, { kind: window.ESTADO[m.estado].cls }, window.ESTADO[m.estado].label)));
              }))),

          reservaForm && React.createElement(ReservaFormCard, {
            mesa: reservaForm,
            onCancel: () => setReservaForm(null),
            onConfirm: (info) => { reservar(reservaForm.id, info); toast("Mesa " + reservaForm.num + " reservada · " + info.cliente); setReservaForm(null); }
          }),

          confirm && React.createElement("div", { className: "confirm-over" },
            React.createElement("div", { className: "confirm-card" },
              React.createElement("span", { className: "badge badge--danger", style: { width: 44, height: 44, borderRadius: 13, padding: 0, justifyContent: "center", marginBottom: 4 } }, React.createElement(window.Icon, { name: "trash", style: { width: 20, height: 20 } })),
              React.createElement("h3", { style: { margin: "8px 0 4px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 18 } }, "¿Inactivar Mesa " + confirm.num + "?"),
              React.createElement("p", { className: "t2", style: { margin: 0, fontSize: 13 } }, confirm.estado !== "libre" ? "La mesa tiene servicio activo. Se cerrará sin cobrar." : "Dejará de aparecer en el piso. Su historial se conserva."),
              React.createElement("div", { className: "row gap8", style: { marginTop: 18, width: "100%" } },
                React.createElement("button", { className: "btn btn--ghost", style: { flex: 1 }, onClick: () => setConfirm(null) }, "Cancelar"),
                React.createElement("button", { className: "btn btn--danger", style: { flex: 1 }, onClick: () => { inactivarMesa(confirm.id); setConfirm(null); } }, "Sí, inactivar")))))))
  );
}

/* ---------- NUEVA ORDEN (seleccionar mesa) ---------- */
function NuevaOrdenModal({ onClose }) {
  const { mesas, setDrawerMesa, mesaTotal } = window.useStore();
  const activas = mesas.filter(m => m.activa !== false && !m.llevar);
  const llevar = mesas.find(m => m.llevar);
  const elegir = (m) => { setDrawerMesa(m.id); onClose(); };

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(620px, 96vw)" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Nueva orden"),
          React.createElement("h2", { style: { margin: "0 0 6px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 } }, "Selecciona una mesa"),
          React.createElement("p", { className: "t2", style: { marginTop: 0, marginBottom: 16, fontSize: 13 } }, "Si la mesa ya tiene comanda, continúas sobre ella; si está libre, inicias una nueva orden."),
          React.createElement("div", { className: "mesa-grid", style: { gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", maxHeight: 380, overflowY: "auto", paddingRight: 4 } },
            llevar && (() => { const t = mesaTotal(llevar); return React.createElement("button", { key: "llevar", className: "mesa s-" + llevar.estado, style: { padding: 13, borderColor: "var(--border-accent)", background: "var(--accent-soft)" }, onClick: () => elegir(llevar) },
              React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "flex-start" } },
                React.createElement("span", { style: { display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 11, background: "var(--accent)", color: "#fff" } }, React.createElement(window.Icon, { name: "receipt", style: { width: 19, height: 19 } })),
                React.createElement(window.Badge, { kind: t > 0 ? "ok" : "resv" }, t > 0 ? "Continuar" : "Mostrador")),
              React.createElement("div", { className: "mesa__id", style: { fontSize: 19, marginTop: 8, letterSpacing: "0" } }, "Para llevar"),
              React.createElement("div", { style: { marginTop: 6, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: t ? "var(--accent)" : "var(--text-3)" } }, t > 0 ? window.money0(t) : "Nueva")); })(),
            activas.map(m => {
              const e = window.ESTADO[m.estado]; const t = mesaTotal(m);
              return React.createElement("button", { key: m.id, className: "mesa s-" + m.estado, style: { padding: 13 }, onClick: () => elegir(m) },
                React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "flex-start" } },
                  React.createElement("div", { className: "mesa__id", style: { fontSize: 22 } }, String(m.num).padStart(2, "0")),
                  React.createElement(window.Badge, { kind: e.cls }, t > 0 ? "Continuar" : e.label)),
                React.createElement("div", { className: "mesa__zone", style: { marginTop: 4 } }, m.zona + " · " + m.cap + " sillas"),
                React.createElement("div", { style: { marginTop: 10, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: t ? "var(--accent)" : "var(--text-3)" } }, t > 0 ? window.money0(t) : "Nueva"));
            }))))
    )
  );
}

/* ============================================================
   COMANDA DRAWER (detalle de mesa)
   ============================================================ */
function ComandaDrawer() {
  const S = window.useStore();
  const { drawerMesa, setDrawerMesa, mesas, productos, prodById, insumoById, addItem, changeQty, removeItem, mesaTotal, setComensales, pedirCuenta, enviarComanda, setPayMesa, reservar, descartables, descById, setDescQty, toast, usuario, registrarCuenta } = S;
  const mesa = mesas.find(m => m.id === drawerMesa);
  const [cat, setCat] = _uS("comida");
  const [sub, setSub] = _uS("Todas");
  const [q, setQ] = _uS("");
  const [descOpen, setDescOpen] = _uS(false);
  const [obs, setObs] = _uS("");
  const [tickMenu, setTickMenu] = _uS(false);
  if (!mesa) return null;

  const e = window.ESTADO[mesa.estado];
  const total = mesaTotal(mesa);
  const subs = ["Todas", ...Array.from(new Set(productos.filter(p => p.cat === cat).map(p => p.sub)))];
  const lista = productos.filter(p => p.cat === cat && (sub === "Todas" || p.sub === sub) &&
    (!q || p.nombre.toLowerCase().includes(q.toLowerCase())));

  const lowProd = (p) => p.receta.some(([id]) => { const i = insumoById[id]; return i && i.stock <= i.min; });
  const close = () => setDrawerMesa(null);

  // Imprime una o varias comandas (barra / cocina / mesero) SOLO con lo pendiente.
  // Lo ya enviado a cocina no se reimprime: al agregar platos se imprime solo lo nuevo.
  const enviar = (tipos) => {
    const ahora = Date.now();
    // estado_impresion "pendiente" = unidades aún no enviadas (qty - enviado).
    const pedidoPend = mesa.pedido.map(p => [p[0], p[1] - (p[2] || 0)]).filter(x => x[1] > 0);
    const descPend = (mesa.desc || []).map(d => [d[0], d[1] - (d[2] || 0)]).filter(x => x[1] > 0);

    // Estaciones que realmente reciben algo nuevo.
    const hayComida = pedidoPend.some(([pid]) => (prodById[pid] || {}).cat === "comida");
    const hayBebida = pedidoPend.some(([pid]) => (prodById[pid] || {}).cat === "bebida");
    const hayBar = pedidoPend.some(([pid]) => { const pr = prodById[pid]; return pr && pr.cat === "bebida" && /c[oó]ctel|refresco/i.test(pr.sub || ""); });
    const hayDesc = descPend.length > 0;
    const sirve = (t) => t === "cocina" ? (hayComida || hayDesc) : t === "bar" ? hayBar : (hayComida || hayBebida || hayDesc);
    const tiposUtiles = tipos.filter(sirve);

    if (!tiposUtiles.length) {
      toast && toast("No hay productos nuevos para enviar", "warn");
      setTickMenu(false);
      return;
    }

    // ¿Es un agregado sobre una comanda ya impresa? → mostramos la diferencia de horas.
    const esAgregado = !!mesa.primerEnvioTs;
    const minDesde = esAgregado ? Math.max(0, Math.round((ahora - mesa.primerEnvioTs) / 60000)) : 0;
    const horaInicial = esAgregado ? new Date(mesa.primerEnvioTs).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false }) : null;

    const base = { mesa: mesa.num, llevar: mesa.llevar, mozo: mesa.mozo, comensales: mesa.comensales,
      pedido: pedidoPend, desc: descPend, obs: obs, id: "cm" + ahora,
      nro: mesa.comandaNro || ("C-" + String(Math.floor(1000 + Math.random() * 8999))),
      esAgregado, horaInicial, minDesde };

    if (tiposUtiles.length > 1 && window.imprimirComandas) window.imprimirComandas(base, prodById, descById, tiposUtiles);
    else if (window.imprimirComanda) window.imprimirComanda({ ...base, tipo: tiposUtiles[0] }, prodById, descById);

    // Marca como enviado lo que salió impreso y fija el código único de la mesa.
    enviarComanda(mesa.id, tiposUtiles, ahora, base.nro);

    const nombres = { bar: "barra", cocina: "cocina", mesero: "mesero" };
    const lugar = mesa.llevar ? "Para llevar" : "Mesa " + mesa.num;
    const etiqueta = esAgregado ? "agregado impreso" : "comanda impresa";
    toast && toast(lugar + " · " + (tiposUtiles.length > 1
      ? etiqueta + " (" + tiposUtiles.map(t => nombres[t]).join(" · ") + ")"
      : (esAgregado ? "agregado" : "comanda") + " de " + nombres[tiposUtiles[0]] + " impreso"));
    setTickMenu(false);
  };

  // MOZO: "Pedir cuenta" — imprime la cuenta del mesero con TODO el consumo
  // (agregados + anteriores) CON precios, código coordinado, hora de cierre y mozo.
  // Sirve de control de las mesas atendidas por cada mesero.
  const pedirCuentaMesero = () => {
    const ahora = Date.now();
    const horaCierre = new Date(ahora).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
    const nro = mesa.comandaNro || ("C-" + String(620 + (mesa.num || 0)).padStart(4, "0"));
    const mozo = mesa.mozo || (usuario && usuario.nombre) || "—";
    const base = {
      mesa: mesa.num, llevar: mesa.llevar, mozo: mozo, comensales: mesa.comensales,
      pedido: mesa.pedido.map(p => [p[0], p[1]]),   // TODO el consumo (no solo lo pendiente)
      desc: (mesa.desc || []).map(d => [d[0], d[1]]),
      obs: obs, id: "cta" + ahora, nro: nro, horaCierre: horaCierre, tipo: "cuenta",
    };
    if (window.imprimirComanda) window.imprimirComanda(base, prodById, descById);
    pedirCuenta(mesa.id);   // marca la mesa como "pide cuenta" + guarda hora/código
    // Registra la cuenta en el cierre por mozo (mesa atendida, con todo el detalle)
    registrarCuenta && registrarCuenta({
      nro: nro, mesaNum: mesa.num, zona: mesa.zona, mozo: mozo,
      comensales: mesa.comensales, ts: ahora,
      pedido: mesa.pedido.map(p => [p[0], p[1]]), desc: (mesa.desc || []).map(d => [d[0], d[1]]),
      obs: obs, estado: "pendiente",
    });
    const lugar = mesa.llevar ? "Para llevar" : "Mesa " + mesa.num;
    toast && toast(lugar + " · cuenta del mesero impresa (" + nro + ")");
    setTickMenu(false);
  };

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", onClick: close }),
    React.createElement("div", { className: "drawer" },
      /* head */
      React.createElement("div", { className: "drawer__head" },
        React.createElement("div", { style: { display: "grid", placeItems: "center", width: 52, height: 52, borderRadius: 13, background: mesa.llevar ? "var(--accent)" : "var(--surface)", border: "1px solid var(--border)", color: mesa.llevar ? "#fff" : "var(--text)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22 } }, mesa.llevar ? React.createElement(window.Icon, { name: "receipt", style: { width: 24, height: 24 } }) : String(mesa.num).padStart(2, "0")),
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("div", { className: "row gap8", style: { alignItems: "center" } },
            React.createElement("span", { style: { fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" } }, mesa.llevar ? "Para llevar" : "Mesa " + mesa.num),
            React.createElement(window.Badge, { kind: e.cls }, e.label)),
          React.createElement("div", { className: "t3", style: { fontSize: 12, marginTop: 2 } },
            mesa.llevar
              ? ("Orden de mostrador" + (mesa.mozo ? " · " + mesa.mozo : ""))
              : (mesa.zona + " · " + mesa.cap + " sillas · " + (mesa.mozo ? "Mozo " + mesa.mozo : "sin mozo") + (mesa.minAbierta ? " · " + window.fmtMin(mesa.minAbierta) : "")))),
        !mesa.llevar && React.createElement("div", { className: "row gap8", style: { alignItems: "center", marginRight: 6 } },
          React.createElement("span", { className: "t3", style: { fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" } }, "Comensales"),
          React.createElement("div", { className: "qty" },
            React.createElement("button", { onClick: () => setComensales(mesa.id, mesa.comensales - 1) }, React.createElement(window.Icon, { name: "minus", style: { width: 14, height: 14 } })),
            React.createElement("b", null, mesa.comensales),
            React.createElement("button", { onClick: () => setComensales(mesa.id, mesa.comensales + 1) }, React.createElement(window.Icon, { name: "plus", style: { width: 14, height: 14 } })))),
        React.createElement("button", { className: "iconbtn", onClick: close }, React.createElement(window.Icon, { name: "x" }))),

      /* body */
      React.createElement("div", { className: "drawer__body" },
        /* ----- productos ----- */
        React.createElement("div", { className: "drawer__cat" },
          React.createElement("div", { style: { padding: "14px 18px 0" } },
            React.createElement("div", { className: "row gap8", style: { justifyContent: "space-between", marginBottom: 12 } },
              React.createElement("div", { className: "seg" },
                [["comida", "Comida", "utensils"], ["bebida", "Bebidas", "coffee"]].map(([id, lbl, ic]) =>
                  React.createElement("button", { key: id, className: cat === id ? "is-active" : "", onClick: () => { setCat(id); setSub("Todas"); } },
                    React.createElement(window.Icon, { name: ic }), lbl))),
              React.createElement("div", { className: "search", style: { width: 170 } },
                React.createElement(window.Icon, { name: "search" }),
                React.createElement("input", { className: "input", placeholder: "Buscar…", value: q, onChange: ev => setQ(ev.target.value) }))),
            React.createElement("div", { className: "row gap6 wrap", style: { marginBottom: 4 } },
              subs.map(s => React.createElement("button", { key: s, className: "chip btn--sm" + (sub === s ? " is-active" : ""), style: { height: 28 }, onClick: () => setSub(s) }, s)))),
          React.createElement("div", { className: "drawer__scroll" },
            React.createElement("div", { className: "prod-grid" },
              lista.map(p => React.createElement("button", { key: p.id, className: "prod" + (lowProd(p) ? " low" : ""), onClick: () => addItem(mesa.id, p.id) },
                React.createElement("div", { className: "prod__name" }, p.nombre),
                React.createElement("div", { className: "prod__row" },
                  React.createElement("span", { className: "prod__price" }, window.money(p.precio)),
                  React.createElement("span", { className: "prod__add" }, React.createElement(window.Icon, { name: "plus" }))),
                lowProd(p) && React.createElement("div", { className: "prod__warn" }, "● insumo bajo")))))),

        /* ----- orden ----- */
        React.createElement("div", { className: "drawer__order" },
          React.createElement("div", { style: { padding: "14px 18px 12px", borderBottom: "1px solid var(--border)" } },
            React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 10 } },
              React.createElement("span", { style: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13 } }, "Comanda"),
              React.createElement(window.Badge, { kind: mesa.estado === "cuenta" ? "warn" : (total > 0 ? "ok" : "muted") }, total > 0 ? (mesa.estado === "cuenta" ? "Listo para cobrar" : "En consumo") : "Sin consumo")),
            React.createElement("div", { className: "row gap8", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr" } },
              [["Productos", mesa.pedido.reduce((s, [, q]) => s + q, 0)], ["Acumulado", window.money0(total)], ["Tiempo", window.fmtMin(mesa.minAbierta)]].map(([l, v], i) =>
                React.createElement("div", { key: i, style: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 10px" } },
                  React.createElement("div", { className: "t3", style: { fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif" } }, l),
                  React.createElement("div", { className: "num", style: { fontWeight: 700, fontSize: 14, marginTop: 1 } }, v))))),
          React.createElement("div", { className: "drawer__scroll", style: { paddingTop: 4 } },
            mesa.pedido.length === 0
              ? React.createElement("div", { className: "empty" }, React.createElement(window.Icon, { name: "receipt" }), React.createElement("div", null, "Comanda vacía"), React.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, "Agrega productos desde la izquierda"))
              : mesa.pedido.map(([pid, qty, enviado], li) => {
                  const p = prodById[pid];
                  const mins = Math.max(1, (mesa.minAbierta || 1) - li * 3);
                  const hora = (() => { const d = new Date(2026, 5, 5, 0, 0); d.setHours(20); d.setMinutes(d.getMinutes() - mins); return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false }); })();
                  const pend = qty - (enviado || 0);
                  const chipBase = { display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 8, padding: "1px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: ".05em", textTransform: "uppercase", verticalAlign: "middle", whiteSpace: "nowrap" };
                  const estadoChip = pend > 0
                    ? React.createElement("span", { title: "Aún no enviado a cocina", style: { ...chipBase, color: "var(--busy)", background: "var(--busy-soft)" } }, "● ", (enviado || 0) > 0 ? ("+" + pend + " pendiente") : "Pendiente")
                    : React.createElement("span", { title: "Ya enviado a cocina", style: { ...chipBase, color: "var(--ok)", background: "var(--ok-soft)" } }, "✓ Enviado");
                  return React.createElement("div", { className: "line", key: pid },
                    React.createElement("div", { className: "line__name" }, p.nombre, estadoChip, React.createElement("span", null, window.money(p.precio) + " · " + p.sub + " · " + hora)),
                    React.createElement("div", { className: "qty" },
                      React.createElement("button", { onClick: () => changeQty(mesa.id, pid, -1) }, React.createElement(window.Icon, { name: "minus", style: { width: 14, height: 14 } })),
                      React.createElement("b", null, qty),
                      React.createElement("button", { onClick: () => changeQty(mesa.id, pid, 1) }, React.createElement(window.Icon, { name: "plus", style: { width: 14, height: 14 } }))),
                    React.createElement("div", { className: "line__sub" }, window.money(p.precio * qty)),
                    React.createElement("button", { className: "iconbtn", style: { width: 30, height: 30 }, onClick: () => removeItem(mesa.id, pid) }, React.createElement(window.Icon, { name: "trash", style: { width: 15, height: 15 } })));
                }),
            /* extras: descartables + observaciones para cocina (viajan con la comanda) */
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginTop: mesa.pedido.length ? 16 : 2 } },
              (() => {
                const lineas = mesa.desc || [];
                const totalDesc = lineas.reduce((s, [did, q]) => s + ((descById[did] || {}).precio || 0) * q, 0);
                const unidades = lineas.reduce((s, [, q]) => s + q, 0);
                return React.createElement("button", { className: "btn btn--ghost btn--block", onClick: () => setDescOpen(true), style: { justifyContent: "space-between" } },
                  React.createElement("span", { className: "row gap8", style: { alignItems: "center" } },
                    React.createElement(window.Icon, { name: "box", style: { width: 15, height: 15, color: "var(--text-3)" } }), mesa.llevar ? "Descartables" : "Descartables / para llevar"),
                  unidades > 0
                    ? React.createElement("span", { className: "badge badge--ok" }, unidades + " · " + window.money0(totalDesc))
                    : React.createElement(window.Icon, { name: "chevR", style: { width: 16, height: 16, opacity: .6 } }));
              })(),
              React.createElement("label", { className: "field", style: { display: "block" } },
                React.createElement("span", { className: "field__label row gap6", style: { alignItems: "center", marginBottom: 6 } },
                  React.createElement(window.Icon, { name: "edit", style: { width: 13, height: 13, color: "var(--text-3)" } }), "Observaciones para cocina"),
                React.createElement("textarea", { className: "input", rows: 2, placeholder: "Ej: sin cebolla · término medio · ají aparte",
                  value: obs, onChange: e => setObs(e.target.value), style: { resize: "vertical", minHeight: 42, lineHeight: 1.45, fontFamily: "inherit", padding: "8px 11px" } })))),
          /* foot — totales + acciones (siempre visibles) */
          React.createElement("div", { className: "order-foot" },
            React.createElement("div", { className: "sumline" }, React.createElement("span", null, "Subtotal"), React.createElement("span", { className: "num" }, window.money(total / 1.18))),
            React.createElement("div", { className: "sumline" }, React.createElement("span", null, "IGV 18%"), React.createElement("span", { className: "num" }, window.money(total - total / 1.18))),
            React.createElement("div", { className: "sumline total" }, React.createElement("span", null, "Total"), React.createElement("b", { className: "num" }, window.money(total))),
            React.createElement("div", { className: "row gap8", style: { marginTop: 14, position: "relative" } },
              tickMenu && React.createElement(React.Fragment, null,
                React.createElement("div", { onClick: () => setTickMenu(false), style: { position: "fixed", inset: 0, zIndex: 40 } }),
                React.createElement("div", { className: "card tick-menu", style: { position: "absolute", left: 0, right: 0, bottom: "calc(100% + 10px)", zIndex: 41, padding: 6 } },
                  React.createElement("div", { className: "field__label", style: { padding: "8px 10px 6px", marginBottom: 0 } }, "Imprimir — solo lo pendiente"),
                  [["bar", "coffee", "Barra", "Cócteles y refrescos · sin precios ni observaciones"],
                   ["cocina", "utensils", "Cocina", "Comida y descartables · con observaciones"],
                   ["mesero", "receipt", "Mesero", "Comanda completa · sin precios"]].map(([t, ic, title, sub]) =>
                    React.createElement("button", { key: t, className: "tick-opt", onClick: () => enviar([t]) },
                      React.createElement("span", { className: "tick-opt__ic" }, React.createElement(window.Icon, { name: ic })),
                      React.createElement("span", { style: { flex: 1, minWidth: 0 } },
                        React.createElement("span", { style: { display: "block", fontWeight: 600, fontSize: 13 } }, title),
                        React.createElement("span", { className: "t3", style: { fontSize: 11 } }, sub)))),
                  React.createElement("div", { style: { height: 1, background: "var(--border)", margin: "5px 8px" } }),
                  React.createElement("button", { className: "tick-opt", onClick: () => enviar(["bar", "cocina", "mesero"]) },
                    React.createElement("span", { className: "tick-opt__ic", style: { color: "var(--text)" } }, React.createElement(window.Icon, { name: "layers" })),
                    React.createElement("span", { style: { flex: 1, minWidth: 0 } },
                      React.createElement("span", { style: { display: "block", fontWeight: 600, fontSize: 13 } }, "Imprimir las 3"),
                      React.createElement("span", { className: "t3", style: { fontSize: 11 } }, "Un rollo con líneas de corte"))))),
              React.createElement("button", { className: "btn btn--ghost" + (tickMenu ? " is-active" : ""), style: { flex: 1 }, disabled: !total, onClick: () => setTickMenu(v => !v) },
                React.createElement(window.Icon, { name: "receipt" }), "Imprimir comanda"),
              (usuario && usuario.rol === "Mozo")
                ? React.createElement("button", { className: "btn btn--accent", style: { flex: 1.4 }, disabled: !total, onClick: pedirCuentaMesero },
                    React.createElement(window.Icon, { name: "receipt" }), "Pedir cuenta · " + window.money0(total))
                : React.createElement("button", { className: "btn btn--accent", style: { flex: 1.4 }, disabled: !total, onClick: () => setPayMesa(mesa.id) },
                    React.createElement(window.Icon, { name: "cash" }), "Cobrar · " + window.money0(total)))))
      )
    ),
    descOpen && React.createElement(DescartablesModal, { mesa: mesa, onClose: () => setDescOpen(false) })
  );
}
window.ComandaDrawer = ComandaDrawer;

/* ---------- Modal de descartables (pantalla completa) ---------- */
function DescartablesModal({ mesa, onClose }) {
  const { descartables, descById, setDescQty } = window.useStore();
  const lineas = mesa.desc || [];
  const totalDesc = lineas.reduce((s, [did, q]) => s + ((descById[did] || {}).precio || 0) * q, 0);
  const unidades = lineas.reduce((s, [, q]) => s + q, 0);
  return ReactDOM.createPortal(React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 120 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap", style: { zIndex: 121 } },
      React.createElement("div", { className: "modal", style: { width: "min(540px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, (mesa.llevar ? "Para llevar" : "Mesa " + mesa.num) + " · empaques"),
          React.createElement("h2", { style: { margin: "0 0 4px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 } }, "Descartables"),
          React.createElement("p", { className: "t2", style: { marginTop: 0, marginBottom: 16, fontSize: 13 } }, "Escribe cuántos necesitas. El precio y el stock vienen de Inventario y se descuentan al cobrar."),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            (descartables || []).map(d => {
              const cur = lineas.find(x => x[0] === d.id);
              const qty = cur ? cur[1] : 0;
              const bajo = d.stock <= d.min;
              const set = (n) => setDescQty(mesa.id, d.id, n);
              return React.createElement("div", { key: d.id, className: "row", style: { justifyContent: "space-between", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 11, background: "var(--surface)", border: "1px solid " + (qty ? "var(--border-accent)" : "var(--border)") } },
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                  React.createElement("div", { style: { fontSize: 14, fontWeight: 600 } }, d.nombre),
                  React.createElement("div", { className: "t3", style: { fontSize: 11.5, color: bajo ? "var(--danger)" : "var(--text-3)" } }, window.money(d.precio) + " · stock " + d.stock + (bajo ? " · bajo" : ""))),
                React.createElement("div", { className: "qty" },
                  React.createElement("button", { onClick: () => set(qty - 1) }, React.createElement(window.Icon, { name: "minus", style: { width: 14, height: 14 } })),
                  React.createElement("input", { className: "cell-input", type: "number", min: "0", value: qty || "", placeholder: "0", style: { width: 52, textAlign: "center", border: "none", background: "transparent", fontWeight: 700 }, onChange: ev => set(ev.target.value) }),
                  React.createElement("button", { onClick: () => set(qty + 1) }, React.createElement(window.Icon, { name: "plus", style: { width: 14, height: 14 } }))),
                React.createElement("b", { className: "num", style: { width: 66, textAlign: "right", color: qty ? "var(--accent)" : "var(--text-3)" } }, window.money0(d.precio * qty)));
            })),
          React.createElement("div", { className: "sumline total", style: { marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" } },
            React.createElement("span", null, unidades + " descartable" + (unidades === 1 ? "" : "s")),
            React.createElement("b", { className: "num" }, window.money0(totalDesc))),
          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", style: { marginTop: 16 }, onClick: onClose },
            React.createElement(window.Icon, { name: "check" }), "Listo"))))
  ), document.body);
}

/* ============================================================
   COBRO MODAL
   ============================================================ */
function ClienteQuickModal({ docNum, docTipo, onClose, onSaved }) {
  const { addCliente, buscarCliente, toast } = window.useStore();
  const esEmpresa = docTipo === "Factura";
  const [f, setF] = _uS({ nombre: "", doc: docNum || "", celular: "" });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const guardar = () => {
    if (!f.nombre.trim()) return toast("Ingresa el " + (esEmpresa ? "razón social" : "nombre"), "warn");
    if (!f.doc.trim()) return toast("Ingresa el " + (esEmpresa ? "RUC" : "DNI"), "warn");
    if (!f.celular.trim()) return toast("El celular es obligatorio", "warn");
    if (buscarCliente(f.doc)) return toast("Ya existe un cliente con ese documento", "warn");
    const nuevo = addCliente({ tipo: esEmpresa ? "empresa" : "persona", nombre: f.nombre.trim(), doc: f.doc.trim(), celular: f.celular.trim() });
    onSaved(nuevo);
  };
  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 101 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap", style: { zIndex: 102 } },
      React.createElement("div", { className: "modal", style: { width: "min(420px,96vw)" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Nuevo cliente"),
          React.createElement("h2", { style: { margin: "0 0 14px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 } }, esEmpresa ? "Registrar empresa" : "Registrar persona"),
          React.createElement("label", { className: "field", style: { marginBottom: 11 } }, React.createElement("span", { className: "field__label" }, esEmpresa ? "Razón social" : "Nombre completo"),
            React.createElement("input", { className: "input", value: f.nombre, onChange: e => set("nombre", e.target.value) })),
          React.createElement("label", { className: "field", style: { marginBottom: 11 } }, React.createElement("span", { className: "field__label" }, esEmpresa ? "RUC" : "DNI"),
            React.createElement("input", { className: "input", value: f.doc, onChange: e => set("doc", e.target.value) })),
          React.createElement("label", { className: "field", style: { marginBottom: 16 } }, React.createElement("span", { className: "field__label" }, "Celular (obligatorio)"),
            React.createElement("input", { className: "input", value: f.celular, onChange: e => set("celular", e.target.value), placeholder: "9XX XXX XXX" })),
          React.createElement("button", { className: "btn btn--accent btn--block btn--lg", onClick: guardar }, React.createElement(window.Icon, { name: "check" }), "Guardar cliente"))))
  );
}

function ClientesListModal({ onClose, onSelect, onNuevo }) {
  const { clientes } = window.useStore();
  const [q, setQ] = _uS("");
  const lista = clientes.filter(c => !q || c.nombre.toLowerCase().includes(q.toLowerCase()) || c.doc.includes(q) || (c.celular || "").includes(q));
  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 101 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap", style: { zIndex: 102 } },
      React.createElement("div", { className: "modal", style: { width: "min(480px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Cartera · " + clientes.length + " clientes"),
          React.createElement("h2", { style: { margin: "0 0 14px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700 } }, "Clientes registrados"),
          React.createElement("div", { className: "row gap8", style: { marginBottom: 14 } },
            React.createElement("div", { className: "search", style: { flex: 1 } }, React.createElement(window.Icon, { name: "search" }),
              React.createElement("input", { className: "input", placeholder: "Buscar por nombre, DNI/RUC o celular", value: q, onChange: e => setQ(e.target.value) })),
            React.createElement("button", { className: "btn btn--accent", onClick: onNuevo }, React.createElement(window.Icon, { name: "plus" }), "Nuevo")),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
            lista.length === 0
              ? React.createElement("div", { className: "empty" }, React.createElement(window.Icon, { name: "personal" }), "Sin coincidencias")
              : lista.map(c => React.createElement("button", { key: c.id, className: "user-pick__item", onClick: () => onSelect(c) },
                  React.createElement("div", { className: "avatar", style: { width: 38, height: 38, borderRadius: 11, background: c.tipo === "empresa" ? "var(--resv-soft)" : "var(--accent-soft)", color: c.tipo === "empresa" ? "var(--resv)" : "var(--accent)" } },
                    React.createElement(window.Icon, { name: c.tipo === "empresa" ? "datos" : "user", style: { width: 18, height: 18 } })),
                  React.createElement("div", { className: "user-pick__meta" },
                    React.createElement("div", { className: "user-pick__name" }, c.nombre),
                    React.createElement("div", { className: "user-pick__role" }, (c.tipo === "empresa" ? "RUC " : "DNI ") + c.doc + " · " + c.celular)),
                  React.createElement("span", { className: "user-pick__check" }, React.createElement(window.Icon, { name: "chevR" })))))))));
}

function CobroModal() {
  const S = window.useStore();
  const { payMesa, setPayMesa, mesas, mesaTotal, cobrar, prodById, descById, cajaAbierta, setView, recargoOn, recargoPct, buscarCliente, validarCupon, calcDescuentoCupon } = S;
  const [metodo, setMetodo] = _uS("Efectivo");
  const [recibido, setRecibido] = _uS("");
  const [split, setSplit] = _uS(false);
  const [montos, setMontos] = _uS({ Efectivo: "", Tarjeta: "", Yape: "" });
  const [docTipo, setDocTipo] = _uS("Boleta");
  const [docNum, setDocNum] = _uS("");
  const [cliente, setCliente] = _uS(null);
  const [showReg, setShowReg] = _uS(false);
  const [showList, setShowList] = _uS(false);
  const [cuponCode, setCuponCode] = _uS("");
  const [cupon, setCupon] = _uS(null);
  const [cuponMsg, setCuponMsg] = _uS(null);
  const [confirmando, setConfirmando] = _uS(false);
  const [imprimirTk, setImprimirTk] = _uS(true);
  const mesa = mesas.find(m => m.id === payMesa);
  if (!mesa) return null;
  const subtotal = mesaTotal(mesa);
  const comida = mesa.pedido.reduce((s, [pid, q]) => s + (prodById[pid].cat === "comida" ? prodById[pid].precio * q : 0), 0);
  const descLineas = mesa.desc || [];
  const descTotal = descLineas.reduce((s, [did, q]) => s + ((descById[did] || {}).precio || 0) * q, 0);
  const bebida = subtotal - comida - descTotal;
  const descuento = cupon ? calcDescuentoCupon(cupon, subtotal) : 0;
  const base = Math.max(0, subtotal - descuento); // monto a repartir entre métodos (sin recargo)
  // Montos asignados a cada método en pago dividido (en base, sin recargo)
  const efeB = parseFloat(montos.Efectivo) || 0;
  const tarB = parseFloat(montos.Tarjeta) || 0;
  const yapB = parseFloat(montos.Yape) || 0;
  const asignado = Math.round((efeB + tarB + yapB) * 100) / 100;
  const restante = Math.round((base - asignado) * 100) / 100;
  const cubierto = Math.abs(restante) < 0.01 && asignado > 0;
  // El recargo de tarjeta se aplica SOLO sobre la parte que pasa por tarjeta
  const cardBase = split ? tarB : (metodo === "Tarjeta" ? base : 0);
  const recargo = (recargoOn && recargoPct) ? Math.round(cardBase * recargoPct) / 100 : 0;
  const total = Math.max(0, base + recargo);
  const cambio = (!split && metodo === "Efectivo" && recibido) ? Math.max(0, parseFloat(recibido) - total) : null;
  const close = () => setPayMesa(null);

  const buscar = (val) => {
    setDocNum(val);
    if (val.trim().length >= 8) { const c = buscarCliente(val); setCliente(c || null); }
    else setCliente(null);
  };
  const aplicarCupon = () => {
    const r = validarCupon(cuponCode);
    if (!r.ok) {
      // Código inválido/vencido/inactivo/sin usos: no descarta un cupón válido ya aplicado
      setCuponMsg({ ok: false, txt: r.error });
      return;
    }
    // Solo 1 cupón por venta: el cupón válido REEMPLAZA a cualquiera previo (nunca se acumulan)
    const reemplaza = cupon && cupon.codigo !== r.cupon.codigo;
    setCupon(r.cupon);
    setCuponMsg({ ok: true, txt: r.cupon.desc + (reemplaza ? " · reemplaza al cupón anterior" : "") });
  };
  const confirmar = () => {
    let v;
    if (split) v = cobrar(mesa.id, { cupon, cliente, documento: docTipo, pagos: [
      { metodo: "Efectivo", base: efeB }, { metodo: "Tarjeta", base: tarB }, { metodo: "Yape", base: yapB } ] });
    else v = cobrar(mesa.id, { metodo, cupon, cliente, documento: docTipo });
    // Imprimir ticket térmico (80 mm) automáticamente al cobrar
    if (v && imprimirTk && window.imprimirTicket) {
      const cli = cliente || {};
      window.imprimirTicket(
        { ...v, mozo: mesa.mozo, docCliente: cli.doc || null },
        prodById, descById,
        { recibido: (!split && metodo === "Efectivo") ? recibido : null }
      );
    }
  };
  const setMonto = (m, v) => setMontos(s => ({ ...s, [m]: v }));

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: close }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(480px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: close }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Cobro · Mesa " + mesa.num),
          React.createElement("div", { className: "num", style: { fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: "var(--accent)" } }, window.money(total)),
          React.createElement("div", { className: "t3", style: { fontSize: 12, marginBottom: 16 } }, mesa.pedido.reduce((s, [, q]) => s + q, 0) + " ítems · " + mesa.comensales + " comensales · " + (mesa.mozo || "—")),

          !cajaAbierta && React.createElement("div", { className: "card", style: { padding: 12, marginBottom: 16, borderColor: "var(--border-accent)", display: "flex", gap: 10, alignItems: "center" } },
            React.createElement(window.Icon, { name: "alert", style: { width: 18, height: 18, color: "var(--warn)" } }),
            React.createElement("div", { style: { flex: 1, fontSize: 12.5 } }, "La caja no está aperturada. Ábrela para poder cobrar."),
            React.createElement("button", { className: "btn btn--sm btn--accent", onClick: () => { close(); setView("caja"); } }, "Ir a Caja")),

          // Desglose
          React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 16 } },
            React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "row gap8" }, React.createElement(window.Icon, { name: "utensils", style: { width: 15, height: 15, color: "var(--text-3)" } }), "Comida"), React.createElement("span", { className: "num" }, window.money(comida))),
            React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "row gap8" }, React.createElement(window.Icon, { name: "coffee", style: { width: 15, height: 15, color: "var(--text-3)" } }), "Bebidas"), React.createElement("span", { className: "num" }, window.money(bebida))),
            descTotal > 0 && React.createElement(React.Fragment, null,
              React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "row gap8" }, React.createElement(window.Icon, { name: "receipt", style: { width: 15, height: 15, color: "var(--text-3)" } }), "Descartables"), React.createElement("span", { className: "num" }, window.money(descTotal))),
              descLineas.map(([did, q]) => { const d = descById[did]; if (!d) return null; return React.createElement("div", { key: did, className: "sumline", style: { paddingLeft: 23 } }, React.createElement("span", { className: "t3", style: { fontSize: 11.5 } }, q + " × " + d.nombre), React.createElement("span", { className: "num t3", style: { fontSize: 11.5 } }, window.money(d.precio * q))); })),
            React.createElement("div", { className: "sumline", style: { borderTop: "1px dashed var(--border-2)", marginTop: 6, paddingTop: 8 } }, React.createElement("span", null, "Total original"), React.createElement("span", { className: "num" }, window.money(subtotal))),
            recargo > 0 && React.createElement("div", { className: "sumline" }, React.createElement("span", null, "Recargo tarjeta (" + recargoPct + "%)"), React.createElement("span", { className: "num" }, "+ " + window.money(recargo))),
            descuento > 0 && React.createElement("div", { className: "sumline" }, React.createElement("span", { style: { color: "var(--ok)" } }, "Descuento cupón"), React.createElement("span", { className: "num", style: { color: "var(--ok)" } }, "− " + window.money(descuento))),
            React.createElement("div", { className: "sumline total" }, React.createElement("span", null, "Total a cobrar"), React.createElement("b", { className: "num", style: { fontSize: 22, color: "var(--ok)" } }, window.money(total)))),

          // Documento
          React.createElement("div", { className: "field__label" }, "Comprobante"),
          React.createElement("div", { className: "seg", style: { display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 10, width: "100%" } },
            [["Boleta", "DNI"], ["Factura", "RUC"]].map(([d]) => React.createElement("button", { key: d, className: docTipo === d ? "is-active" : "", style: { justifyContent: "center" }, onClick: () => { setDocTipo(d); setCliente(null); setDocNum(""); } }, d))),
          React.createElement("div", { className: "row gap8", style: { marginBottom: 6 } },
            React.createElement("div", { className: "search", style: { flex: 1 } }, React.createElement(window.Icon, { name: "user" }),
              React.createElement("input", { className: "input", placeholder: docTipo === "Factura" ? "RUC del cliente" : "DNI del cliente", value: docNum, onChange: e => buscar(e.target.value) })),
            React.createElement("button", { className: "btn btn--ghost", onClick: () => setShowList(true) }, React.createElement(window.Icon, { name: "personal" }), "Ver clientes"),
            React.createElement("button", { className: "btn btn--ghost", onClick: () => setShowReg(true) }, React.createElement(window.Icon, { name: "plus" }), "Nuevo")),
          cliente
            ? React.createElement("div", { className: "row gap8", style: { marginBottom: 16, alignItems: "center" } }, React.createElement("span", { className: "badge badge--ok" }, React.createElement("i", { className: "dot" }), "Cliente registrado"), React.createElement("span", { className: "t2", style: { fontSize: 12.5 } }, cliente.nombre + " · " + cliente.celular))
            : (docNum.trim().length >= 8 ? React.createElement("div", { className: "t3", style: { fontSize: 12, marginBottom: 16 } }, "No registrado. Usa “Nuevo” para crearlo.") : React.createElement("div", { style: { marginBottom: 16 } })),

          // Cupón
          React.createElement("div", { className: "field__label" }, "Cupón de descuento"),
          React.createElement("div", { className: "row gap8", style: { marginBottom: 6 } },
            React.createElement("input", { className: "input", placeholder: "Código (ej: TALIS10)", value: cuponCode, onChange: e => setCuponCode(e.target.value), style: { textTransform: "uppercase" } }),
            React.createElement("button", { className: "btn btn--ghost", onClick: aplicarCupon }, "Aplicar")),
          cuponMsg && React.createElement("div", { className: "row gap6", style: { marginBottom: 16, fontSize: 12.5, color: cuponMsg.ok ? "var(--ok)" : "var(--danger)" } },
            React.createElement(window.Icon, { name: cuponMsg.ok ? "check" : "x", style: { width: 14, height: 14 } }), cuponMsg.txt),
          !cuponMsg && React.createElement("div", { style: { marginBottom: 16 } }),

          // Método de pago
          React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
            React.createElement("span", { className: "field__label", style: { marginBottom: 0 } }, "Método de pago"),
            React.createElement("div", { className: "seg" },
              [["", "Simple"], ["x", "Dividido"]].map(([k, l]) =>
                React.createElement("button", { key: l, className: (split === !!k) ? "is-active" : "", onClick: () => setSplit(!!k) }, l)))),

          !split && React.createElement(React.Fragment, null,
            React.createElement("div", { className: "pay-method", style: { marginBottom: 14 } },
              [["Efectivo", "cash"], ["Tarjeta", "card"], ["Yape", "yape"]].map(([m, ic]) =>
                React.createElement("button", { key: m, className: metodo === m ? "is-active" : "", onClick: () => setMetodo(m) }, React.createElement(window.Icon, { name: ic }), React.createElement("span", null, m)))),
            metodo === "Efectivo" && React.createElement("div", { style: { marginBottom: 16 } },
              React.createElement("div", { className: "field__label" }, "Monto recibido"),
              React.createElement("input", { className: "input", type: "number", placeholder: "0.00", value: recibido, onChange: e => setRecibido(e.target.value) }),
              cambio != null && React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginTop: 8, fontSize: 13 } }, React.createElement("span", { className: "t2" }, "Vuelto"), React.createElement("b", { className: "num", style: { color: "var(--ok)" } }, window.money(cambio))))),

          split && React.createElement("div", { style: { marginBottom: 16 } },
            React.createElement("p", { className: "t3", style: { fontSize: 11.5, margin: "0 0 10px", lineHeight: 1.5 } }, "Reparte " + window.money(base) + " entre los métodos. El recargo de tarjeta se cobra solo sobre lo que pase por tarjeta."),
            [["Efectivo", "cash"], ["Tarjeta", "card"], ["Yape", "yape"]].map(([m, ic]) =>
              React.createElement(React.Fragment, { key: m },
                React.createElement("div", { className: "row gap8", style: { alignItems: "center", marginBottom: (m === "Tarjeta" && recargo > 0) ? 2 : 8 } },
                  React.createElement("span", { className: "row gap8", style: { width: 110, alignItems: "center", fontSize: 13 } }, React.createElement(window.Icon, { name: ic, style: { width: 16, height: 16, color: "var(--text-3)" } }), m),
                  React.createElement("input", { className: "input", type: "number", placeholder: "0.00", value: montos[m], onChange: e => setMonto(m, e.target.value), style: { flex: 1 } }),
                  React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => { const otros = asignado - (parseFloat(montos[m]) || 0); setMonto(m, String(Math.max(0, Math.round((base - otros) * 100) / 100))); } }, "Resto")),
                m === "Tarjeta" && recargo > 0 && React.createElement("div", { className: "t3", style: { fontSize: 11, textAlign: "right", marginBottom: 8 } }, "+ recargo " + recargoPct + "% → se cobra " + window.money(tarB + recargo) + " a la tarjeta"))),
            React.createElement("div", { className: "card", style: { padding: 12, marginTop: 4, background: "var(--bg-2)" } },
              React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "A repartir"), React.createElement("span", { className: "num" }, window.money(base))),
              React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "Asignado"), React.createElement("span", { className: "num" }, window.money(asignado))),
              recargo > 0 && React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "Recargo tarjeta"), React.createElement("span", { className: "num" }, "+ " + window.money(recargo))),
              React.createElement("div", { className: "sumline", style: { borderTop: "1px dashed var(--border-2)", marginTop: 6, paddingTop: 8 } },
                React.createElement("span", null, cubierto ? "Total a cobrar" : (restante > 0 ? "Falta asignar" : "Excede en")),
                React.createElement("b", { className: "num", style: { color: cubierto ? "var(--ok)" : "var(--warn)" } }, cubierto ? window.money(total) : window.money(Math.abs(restante)))))),

          confirmando
            ? React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 12 } },
                React.createElement("div", { style: { fontWeight: 700, marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" } }, "Confirmar cobro"),
                React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "Comprobante"), React.createElement("span", null, docTipo + (cliente ? " · " + cliente.nombre : " · varios"))),
                split
                  ? [["Efectivo", efeB], ["Tarjeta", Math.round((tarB + recargo) * 100) / 100], ["Yape", yapB]].filter(([, v]) => v > 0).map(([m, v]) =>
                      React.createElement("div", { key: m, className: "sumline" }, React.createElement("span", { className: "t2" }, m), React.createElement("span", { className: "num" }, window.money(v))))
                  : React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "Método"), React.createElement("span", null, metodo)),
                cupon && React.createElement("div", { className: "sumline" }, React.createElement("span", { className: "t2" }, "Cupón"), React.createElement("span", { style: { color: "var(--ok)" } }, cupon.codigo)),
                React.createElement("div", { className: "sumline total" }, React.createElement("span", null, "Total"), React.createElement("b", { className: "num" }, window.money(total))),
                React.createElement("label", { className: "row gap8", style: { alignItems: "center", marginTop: 12, cursor: "pointer", fontSize: 12.5 } },
                  React.createElement("input", { type: "checkbox", checked: imprimirTk, onChange: e => setImprimirTk(e.target.checked), style: { width: 16, height: 16, accentColor: "var(--accent)" } }),
                  React.createElement(window.Icon, { name: "receipt", style: { width: 15, height: 15, color: "var(--text-3)" } }),
                  React.createElement("span", null, "Imprimir ticket al cobrar (80 mm)")),
                React.createElement("div", { className: "row gap8", style: { marginTop: 12 } },
                  React.createElement("button", { className: "btn btn--ghost", style: { flex: 1 }, onClick: () => setConfirmando(false) }, "Volver"),
                  React.createElement("button", { className: "btn btn--accent", style: { flex: 1.4 }, onClick: confirmar }, React.createElement(window.Icon, { name: "check" }), "Cobrar " + window.money(total))))
            : React.createElement("button", { className: "btn btn--accent btn--lg btn--block", disabled: !cajaAbierta || (split && !cubierto), onClick: () => setConfirmando(true) },
                React.createElement(window.Icon, { name: "cash" }), split && !cubierto ? (restante > 0 ? "Falta asignar " + window.money(restante) : "Excede en " + window.money(Math.abs(restante))) : "Cobrar · " + window.money(total)),
          React.createElement("div", { className: "t3", style: { fontSize: 11, textAlign: "center", marginTop: 12, lineHeight: 1.5 } },
            "Al confirmar se descuenta inventario, se registra en Caja,", React.createElement("br", null), "se emite el comprobante y se libera la mesa."),

          showReg && React.createElement(ClienteQuickModal, { docNum, docTipo, onClose: () => setShowReg(false), onSaved: (c) => { setCliente(c); setDocNum(c.doc); setShowReg(false); } }),
          showList && React.createElement(ClientesListModal, { onClose: () => setShowList(false),
            onNuevo: () => { setShowList(false); setShowReg(true); },
            onSelect: (c) => { setCliente(c); setDocNum(c.doc); setDocTipo(c.tipo === "empresa" ? "Factura" : "Boleta"); setShowList(false); } })
        ))
    )
  );
}
window.CobroModal = CobroModal;
