/* ============================================================
   TALISMÁN — Módulo CIERRE DE MESAS (control por mozo)
   ------------------------------------------------------------
   Continúa la lógica sembrada en el store (window.useStore):
     - `cuentas`  : una por mesa atendida, con detalle completo.
     - estado     : "abierta"   → en consumo, aún sin pedir cuenta
                    "pendiente" → pidió la cuenta, falta cobrar
                    "cobrada"   → ya pagada en caja
   Esta vista agrupa esas cuentas por mozo para el cierre del turno:
   cuántas mesas atendió cada uno, lo facturado y lo que falta cobrar.
   Rol Mozo  → "Mi cierre" (solo sus mesas).
   Admin/Cajero → todos los mozos + acción de cobro de pendientes.
   ============================================================ */
const { useState: _cuS, useMemo: _cuM } = React;

/* Estado visual de cada cuenta */
const ESTADO_CUENTA = {
  abierta:   { label: "En consumo", cls: "busy", ic: "clock" },
  pendiente: { label: "Por cobrar", cls: "warn", ic: "hourglass" },
  cobrada:   { label: "Cobrada",    cls: "ok",   ic: "check" },
};
window.ESTADO_CUENTA = ESTADO_CUENTA;

/* Primer nombre (las cuentas guardan el mozo por su primer nombre) */
const _primerNombre = (s) => String(s || "").trim().split(/\s+/)[0] || "";
/* Hora corta desde un timestamp */
const _horaTs = (ts) => ts ? new Date(ts).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—";

/* ---------- Detalle de una cuenta (modal) ---------- */
function CierreDetalleModal({ cuenta, onClose }) {
  const { prodById, descById } = window.useStore();
  const est = ESTADO_CUENTA[cuenta.estado] || ESTADO_CUENTA.abierta;

  const lineas = (cuenta.pedido || []).map(([pid, q]) => {
    const p = prodById[pid]; if (!p) return null;
    return { nombre: p.nombre, sub: p.sub, cat: p.cat, precio: p.precio, qty: q, total: p.precio * q };
  }).filter(Boolean);
  const comidas = lineas.filter(l => l.cat === "comida");
  const bebidas = lineas.filter(l => l.cat === "bebida");
  const descs = (cuenta.desc || []).map(([did, q]) => {
    const d = descById[did]; if (!d) return null;
    return { nombre: d.nombre, precio: d.precio, qty: q, total: d.precio * q };
  }).filter(Boolean);
  const total = lineas.reduce((s, l) => s + l.total, 0) + descs.reduce((s, d) => s + d.total, 0);
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

  return ReactDOM.createPortal(React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(440px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "row gap8", style: { alignItems: "center", marginBottom: 2 } },
            React.createElement("div", { className: "kicker", style: { margin: 0 } }, (cuenta.nro || "—") + " · " + _horaTs(cuenta.ts)),
            React.createElement(window.Badge, { kind: est.cls }, est.label)),
          React.createElement("h2", { style: { margin: "2px 0 14px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700 } }, cuenta.mesaNum ? "Mesa " + cuenta.mesaNum : "Para llevar"),

          React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 14, background: "var(--bg-2)" } },
            React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center" } },
              React.createElement("div", { className: "row gap8", style: { alignItems: "center", minWidth: 0 } },
                React.createElement(window.Icon, { name: "user", style: { width: 16, height: 16, color: "var(--text-3)" } }),
                React.createElement("div", { style: { minWidth: 0 } },
                  React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600 } }, "Mozo " + (cuenta.mozo || "—")),
                  React.createElement("div", { className: "t3", style: { fontSize: 11 } }, (cuenta.zona || "—") + " · " + (cuenta.comensales || 0) + " comensales"))),
              React.createElement("span", { className: "num", style: { fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" } }, window.money0(total)))),

          sinDetalle
            ? React.createElement("div", { className: "empty", style: { padding: 18, marginBottom: 14, fontSize: 12.5 } }, "Esta cuenta no tiene productos registrados.")
            : React.createElement("div", { className: "card", style: { padding: "10px 14px", marginBottom: 14 } },
                grupo("Comida", "utensils", comidas),
                grupo("Bebidas", "coffee", bebidas),
                descs.length > 0 && grupo("Para llevar", "box", descs)),

          cuenta.obs ? React.createElement("div", { className: "card", style: { padding: "11px 14px", marginBottom: 14 } },
            React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 } }, "Observaciones"),
            React.createElement("div", { className: "t2", style: { fontSize: 13, lineHeight: 1.5 } }, cuenta.obs)) : null,

          React.createElement("div", { className: "card", style: { padding: 14, background: "var(--bg-2)" } },
            React.createElement("div", { className: "sumline total" }, React.createElement("span", null, "Total de la mesa"), React.createElement("b", { className: "num" }, window.money(total))))))
  )), document.body);
}

/* ---------- Tabla de cuentas de un mozo ---------- */
function CuentasTabla({ cuentas, cuentaTotal, onVer, onCobrar, onIr, puedeCobrar }) {
  if (!cuentas.length) return React.createElement("div", { className: "empty", style: { padding: 26, fontSize: 13 } },
    React.createElement(window.Icon, { name: "cierre" }), React.createElement("div", null, "Sin mesas en este filtro"));
  return React.createElement("table", { className: "tbl" },
    React.createElement("thead", null, React.createElement("tr", null,
      ["Mesa", "Estado", "Comensales", "Ítems", "Hora", "Total", ""].map((h, i) =>
        React.createElement("th", { key: i, style: i >= 5 ? { textAlign: "right" } : null }, h)))),
    React.createElement("tbody", null,
      cuentas.map(c => {
        const est = ESTADO_CUENTA[c.estado] || ESTADO_CUENTA.abierta;
        const items = (c.pedido || []).reduce((s, [, q]) => s + q, 0);
        const cobrable = c.estado !== "cobrada";
        return React.createElement("tr", { key: c.id, style: { cursor: "pointer" }, onClick: () => onVer(c) },
          React.createElement("td", null,
            React.createElement("b", { className: "num", style: { fontSize: 15 } }, c.mesaNum ? "Mesa " + String(c.mesaNum).padStart(2, "0") : "Llevar"),
            React.createElement("div", { className: "t3", style: { fontSize: 11 } }, (c.nro || "—") + " · " + (c.zona || "—"))),
          React.createElement("td", null, React.createElement(window.Badge, { kind: est.cls }, est.label)),
          React.createElement("td", { className: "num" }, c.comensales || "—"),
          React.createElement("td", { className: "num" }, items || "—"),
          React.createElement("td", { className: "num t2", style: { fontSize: 12 } }, _horaTs(c.ts)),
          React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700 } }, window.money0(cuentaTotal(c))),
          React.createElement("td", { style: { textAlign: "right", width: 1, whiteSpace: "nowrap" } },
            React.createElement("div", { className: "row-actions", style: { justifyContent: "flex-end" } },
              puedeCobrar && cobrable
                ? React.createElement("button", { className: "btn btn--accent btn--sm", onClick: (e) => { e.stopPropagation(); onCobrar(c); } },
                    React.createElement(window.Icon, { name: "cash", style: { width: 14, height: 14 } }), "Cobrar")
                : (!puedeCobrar && cobrable
                  ? React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: (e) => { e.stopPropagation(); onIr(c); } },
                      React.createElement(window.Icon, { name: "chevR", style: { width: 14, height: 14 } }), "Ir a la mesa")
                  : null),
              React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: (e) => { e.stopPropagation(); onVer(c); } },
                React.createElement(window.Icon, { name: "receipt", style: { width: 14, height: 14 } }), "Ver"))));
      })));
}

/* ---------- Tarjeta-resumen de un mozo (con su tabla) ---------- */
function MozoBloque({ mozo, iniciales, rol, todas, cuentas, cuentaTotal, onVer, onCobrar, onIr, puedeCobrar }) {
  const facturado = todas.filter(c => c.estado === "cobrada").reduce((s, c) => s + cuentaTotal(c), 0);
  const porCobrar = todas.filter(c => c.estado !== "cobrada").reduce((s, c) => s + cuentaTotal(c), 0);
  const nPend = todas.filter(c => c.estado !== "cobrada").length;
  const stat = (l, v, color) => React.createElement("div", { style: { textAlign: "right", minWidth: 78 } },
    React.createElement("div", { className: "t3", style: { fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif", whiteSpace: "nowrap" } }, l),
    React.createElement("div", { className: "num", style: { fontSize: 16, fontWeight: 700, marginTop: 2, color: color || "var(--text)", whiteSpace: "nowrap" } }, v));
  return React.createElement("div", { className: "card fade-up", style: { overflow: "hidden", marginBottom: 16 } },
    React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "15px 18px", borderBottom: "1px solid var(--border)" } },
      React.createElement("div", { className: "row gap10", style: { alignItems: "center" } },
        React.createElement("div", { className: "avatar" }, iniciales),
        React.createElement("div", null,
          React.createElement("div", { style: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 } }, mozo),
          React.createElement("div", { className: "t3", style: { fontSize: 11.5 } }, (rol || "Mozo") + " · " + todas.length + " mesas atendidas"))),
      React.createElement("div", { style: { display: "flex", gap: 24, alignItems: "center" } },
        stat("Mesas", todas.length),
        React.createElement("div", { style: { width: 1, height: 30, background: "var(--border)" } }),
        stat("Por cobrar", (nPend ? nPend + " · " : "") + window.money0(porCobrar), nPend ? "var(--warn)" : "var(--text-3)"),
        React.createElement("div", { style: { width: 1, height: 30, background: "var(--border)" } }),
        stat("Facturado", window.money0(facturado), "var(--accent)"))),
    React.createElement(CuentasTabla, { cuentas, cuentaTotal, onVer, onCobrar, onIr, puedeCobrar }));
}

/* ---------- VISTA PRINCIPAL: CIERRE DE MESAS ---------- */
function CierreView() {
  const S = window.useStore();
  const { cuentas, prodById, descById, usuario, personal, usuarios, mesas, setPayMesa, setDrawerMesa, toast } = S;
  const [verCuenta, setVerCuenta] = _cuS(null);
  const [fEstado, setFEstado] = _cuS("todos");   // todos | pendiente | cobrada
  const [fMozo, setFMozo] = _cuS("Todos");

  const esMozo = usuario && usuario.rol === "Mozo";
  const puedeCobrar = !esMozo; // caja/admin cobran; el mozo solo revisa

  const cuentaTotal = (c) =>
    (c.pedido || []).reduce((s, [pid, q]) => s + ((prodById[pid] || {}).precio || 0) * q, 0)
    + (c.desc || []).reduce((s, [did, q]) => s + ((descById[did] || {}).precio || 0) * q, 0);

  /* Iniciales y rol de un mozo (busca en personal / usuarios) */
  const infoMozo = (nombre) => {
    const u = (usuarios || []).find(x => _primerNombre(x.nombre) === nombre);
    const p = (personal || []).find(x => _primerNombre(x.nombre) === nombre);
    return {
      iniciales: (u && u.iniciales) || (p ? p.nombre.split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase() : nombre.slice(0, 2).toUpperCase()),
      rol: (u && u.rol) || (p && p.cargo) || "Mozo",
    };
  };

  /* Alcance por rol: el mozo solo ve sus mesas */
  const miNombre = esMozo ? _primerNombre(usuario.nombre) : null;
  const scoped = _cuM(() => (cuentas || []).filter(c => !esMozo || c.mozo === miNombre), [cuentas, esMozo, miNombre]);

  /* KPIs (sobre el alcance, antes de filtrar la lista) */
  const k = _cuM(() => {
    const r = { mesas: scoped.length, cobradas: 0, pend: 0, facturado: 0, porCobrar: 0, comensales: 0, nMozos: 0 };
    const setM = new Set();
    scoped.forEach(c => {
      const t = cuentaTotal(c);
      r.comensales += c.comensales || 0;
      setM.add(c.mozo);
      if (c.estado === "cobrada") { r.cobradas++; r.facturado += t; }
      else { r.pend++; r.porCobrar += t; }
    });
    r.nMozos = setM.size;
    r.ticket = r.cobradas ? r.facturado / r.cobradas : 0;
    return r;
  }, [scoped]);

  /* Filtro de estado para la lista */
  const matchEstado = (c) => fEstado === "todos" ? true : (fEstado === "cobrada" ? c.estado === "cobrada" : c.estado !== "cobrada");

  /* Mozos presentes (para el filtro y el agrupamiento) */
  const mozos = _cuM(() => Array.from(new Set(scoped.map(c => c.mozo))).filter(Boolean).sort(), [scoped]);
  const mozosFiltrados = (esMozo ? mozos : (fMozo === "Todos" ? mozos : mozos.filter(m => m === fMozo)));

  /* Acciones */
  const irCobrar = (c) => {
    const m = mesas.find(x => x.num === c.mesaNum && !x.llevar);
    if (m && m.pedido && m.pedido.length) { setPayMesa(m.id); }
    else { toast && toast("La mesa " + c.mesaNum + " ya no tiene consumo abierto", "warn"); }
  };
  const irMesa = (c) => {
    const m = mesas.find(x => x.num === c.mesaNum && !x.llevar);
    if (m) setDrawerMesa(m.id);
    else toast && toast("La mesa " + c.mesaNum + " ya fue cerrada", "warn");
  };

  /* Imprimir el cierre del turno (reporte interno) */
  const imprimir = () => {
    const M = window.money0;
    const kpis = `<div class="kpis">
      <div class="kpi"><div class="l">Mesas atendidas</div><div class="v">${k.mesas}</div></div>
      <div class="kpi"><div class="l">Facturado (cobrado)</div><div class="v o">${M(k.facturado)}</div></div>
      <div class="kpi"><div class="l">Por cobrar</div><div class="v">${M(k.porCobrar)}</div></div>
      <div class="kpi"><div class="l">Comensales</div><div class="v">${k.comensales}</div></div>
    </div>`;
    const secciones = mozosFiltrados.map(mz => {
      const lista = scoped.filter(c => c.mozo === mz);
      const fac = lista.filter(c => c.estado === "cobrada").reduce((s, c) => s + cuentaTotal(c), 0);
      const filas = lista.map(c => {
        const est = (ESTADO_CUENTA[c.estado] || {}).label || c.estado;
        return `<tr><td>${c.mesaNum ? "Mesa " + c.mesaNum : "Llevar"}</td><td>${c.zona || "—"}</td><td>${est}</td><td class="r">${c.comensales || 0}</td><td class="r">${_horaTs(c.ts)}</td><td class="r">${M(cuentaTotal(c))}</td></tr>`;
      }).join("");
      return `<h1>${mz} · ${lista.length} mesas · facturado ${M(fac)}</h1>
        <table><thead><tr><th>Mesa</th><th>Zona</th><th>Estado</th><th class="r">Pax</th><th class="r">Hora</th><th class="r">Total</th></tr></thead>
        <tbody>${filas}</tbody></table>`;
    }).join("");
    const titulo = esMozo ? "Mi cierre · " + miNombre : "Cierre de mesas por mozo";
    window.printReporte && window.printReporte(titulo, `<h1>Resumen del turno</h1>${kpis}${secciones}`);
  };

  const fechaHoy = new Date().toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" });

  /* KPI card helper */
  const kpiCard = (icon, label, value, color, foot) => React.createElement("div", { className: "card stat fade-up" },
    React.createElement("div", { className: "stat__label" }, React.createElement(window.Icon, { name: icon }), label),
    React.createElement("div", { className: "stat__val", style: color ? { color } : null }, value),
    foot && React.createElement("div", { className: "stat__foot" }, foot));

  return React.createElement("div", { className: "view" },
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, (esMozo ? "Mi cierre" : "Cierre de turno") + " · " + fechaHoy),
        React.createElement("h1", { className: "page-title" }, esMozo ? "Mis mesas" : "Cierre de mesas"),
        React.createElement("p", { className: "page-sub" }, esMozo
          ? "Las mesas que atendiste hoy, lo cobrado y lo que falta cerrar antes de entregar el turno."
          : "Control por mozo: mesas atendidas, lo facturado y las cuentas que aún faltan cobrar.")),
      React.createElement("div", { className: "row gap8" },
        React.createElement("button", { className: "btn btn--ghost", onClick: imprimir },
          React.createElement(window.Icon, { name: "receipt" }), "Imprimir cierre"))),

    /* KPIs */
    React.createElement("div", { style: { display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", marginBottom: 16 } },
      kpiCard("cierre", esMozo ? "Mesas atendidas" : "Mesas del turno", k.mesas, null, esMozo ? null : k.nMozos + " mozos en piso"),
      kpiCard("dollar", "Facturado", window.money0(k.facturado), "var(--accent)", k.cobradas + " mesas cobradas"),
      kpiCard("hourglass", "Por cobrar", window.money0(k.porCobrar), k.pend ? "var(--warn)" : "var(--text-3)", k.pend + " cuentas abiertas"),
      kpiCard("personal", "Comensales", k.comensales, null, "Ticket prom. " + window.money0(k.ticket))),

    /* Filtros */
    React.createElement("div", { className: "row gap12 wrap", style: { marginBottom: 16, justifyContent: "space-between" } },
      !esMozo && mozos.length > 1
        ? React.createElement("div", { className: "row gap8 wrap" },
            ["Todos", ...mozos].map(m => React.createElement("button", { key: m, className: "chip" + (fMozo === m ? " is-active" : ""), onClick: () => setFMozo(m) }, m)))
        : React.createElement("div", null),
      React.createElement("div", { className: "seg" },
        [["todos", "Todas"], ["pendiente", "Por cobrar"], ["cobrada", "Cobradas"]].map(([id, lbl]) =>
          React.createElement("button", { key: id, className: fEstado === id ? "is-active" : "", onClick: () => setFEstado(id) }, lbl)))),

    /* Bloques por mozo */
    scoped.length === 0
      ? React.createElement("div", { className: "card", style: { padding: 0 } },
          React.createElement("div", { className: "empty", style: { padding: 48 } },
            React.createElement(window.Icon, { name: "cierre" }),
            React.createElement("div", null, esMozo ? "Aún no atiendes mesas hoy" : "Sin mesas atendidas en el turno"),
            React.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, "Las cuentas aparecen aquí cuando se abre o cobra una mesa.")))
      : (() => {
          const bloques = mozosFiltrados.map(mz => {
            const todasMozo = scoped.filter(c => c.mozo === mz);
            const lista = todasMozo.filter(matchEstado).sort((a, b) => (b.ts || 0) - (a.ts || 0));
            if (!lista.length && fEstado !== "todos") return null; // oculta bloques vacíos bajo filtro
            const info = infoMozo(mz);
            return React.createElement(MozoBloque, {
              key: mz, mozo: mz, iniciales: info.iniciales, rol: info.rol,
              todas: todasMozo, cuentas: lista, cuentaTotal, puedeCobrar,
              onVer: setVerCuenta, onCobrar: irCobrar, onIr: irMesa,
            });
          }).filter(Boolean);
          return bloques.length ? bloques
            : React.createElement("div", { className: "card", style: { padding: 0 } },
                React.createElement("div", { className: "empty", style: { padding: 48 } },
                  React.createElement(window.Icon, { name: "check" }),
                  React.createElement("div", null, fEstado === "cobrada" ? "Ninguna mesa cobrada todavía" : "No hay cuentas por cobrar"),
                  React.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, "Cambia el filtro para ver el resto de mesas.")));
        })(),

    verCuenta && React.createElement(CierreDetalleModal, { cuenta: verCuenta, onClose: () => setVerCuenta(null) })
  );
}
window.CierreView = CierreView;
