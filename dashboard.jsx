/* ============================================================
   TALISMÁN — Módulo INICIO (Dashboard)
   ============================================================ */
function Dashboard() {
  const S = window.useStore();
  const { D, usuario, caja, resumenMesas: r, alertasInsumos, mesasEsperando, setView, setDrawerMesa, topProductos } = S;
  const ventasDia = caja.total;
  const ayer = D.ref.ventasAyer;
  const deltaDia = Math.round(((ventasDia - ayer) / ayer) * 100);
  const semana = D.ventasSemana.reduce((s, d) => s + d.v, 0) + ventasDia;
  const maxHora = Math.max(...D.ventasPorHora.map(h => h.v));

  const fecha = new Date(2026, 5, 3).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
  const top3 = topProductos.slice(0, 5);
  // Plato (comida) más vendido del día: primer producto de categoría comida en el ranking.
  const topPlato = topProductos.find(p => p.cat === "comida" && p.qty > 0);

  return React.createElement("div", { className: "view" },
    /* welcome */
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, fecha.charAt(0).toUpperCase() + fecha.slice(1)),
        React.createElement("h1", { className: "page-title" }, "Hola, ", React.createElement("span", { style: { color: "#ee7400" } }, usuario.nombre.split(" ")[0])),
        React.createElement("p", { className: "page-sub" }, "Resumen operativo del turno en tiempo real.")),
      React.createElement("div", { className: "row gap8" },
        React.createElement("button", { className: "btn btn--ghost", onClick: () => setView("caja") }, React.createElement(window.Icon, { name: "caja" }), "Ver caja"),
        React.createElement("button", { className: "btn btn--accent", onClick: () => setView("mesas") }, React.createElement(window.Icon, { name: "mesas" }), "Ir a mesas"))),

    /* KPI principales */
    React.createElement("div", { className: "stat-grid stagger", style: { marginBottom: 14 } },
      React.createElement(window.StatTile, { icon: "dollar", label: "Ventas del día", value: window.money0(ventasDia), delta: deltaDia, foot: "vs ayer " + window.money0(ayer), accent: true }),
      React.createElement(window.StatTile, { icon: "mesas", label: "Mesas atendidas hoy", value: caja.nTrans, foot: r.ocupada + " activas ahora · ticket " + window.money0(caja.ticket) }),
      React.createElement("div", { className: "card stat" },
        React.createElement("div", { className: "stat__label" }, React.createElement(window.Icon, { name: "flame" }), "Plato más vendido"),
        React.createElement("div", { className: "stat__val", style: { fontSize: 22, lineHeight: 1.12, letterSpacing: "-0.01em" } }, topPlato ? topPlato.nombre : "—"),
        React.createElement("div", { className: "stat__foot" }, topPlato ? (topPlato.qty + " platos · " + window.money0(topPlato.ingreso)) : "Sin ventas de comida aún")),
      React.createElement(window.StatTile, { icon: "personal", label: "Comensales activos", value: r.comensales, foot: r.ocupada + " mesas con servicio" })
    ),

    React.createElement("div", { style: { display: "grid", gap: 14, gridTemplateColumns: "1.6fr 1fr", alignItems: "start" } },
      /* ventas por hora */
      React.createElement("div", { className: "card card-pad fade-up" },
        React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 16 } },
          React.createElement("div", null,
            React.createElement("div", { className: "kicker", style: { marginBottom: 4 } }, "Hoy"),
            React.createElement("h3", { style: { margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } }, "Ventas por hora")),
          React.createElement("div", { className: "row gap16" },
            React.createElement("div", null, React.createElement("div", { className: "t3", style: { fontSize: 10, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap" } }, "Pico"),
              React.createElement("div", { className: "num", style: { fontWeight: 700, fontSize: 16 } }, "20:00 h")),
            React.createElement("div", null, React.createElement("div", { className: "t3", style: { fontSize: 10, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap" } }, "Día anterior"),
              React.createElement("div", { className: "num delta-up", style: { fontWeight: 700, fontSize: 16 } }, (deltaDia >= 0 ? "+" : "") + deltaDia + "%")))),
        React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 7, height: 150 } },
          D.ventasPorHora.map((h, i) => React.createElement("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 } },
            React.createElement("div", { style: { width: "100%", display: "flex", alignItems: "flex-end", height: 120 } },
              React.createElement("div", { title: window.money0(h.v), style: { width: "100%", height: Math.max(6, (h.v / maxHora) * 100) + "%", borderRadius: "5px 5px 0 0", background: h.v === maxHora ? "linear-gradient(180deg,var(--accent-2),var(--accent))" : "var(--surface-3)" } })),
            React.createElement("span", { className: "t3", style: { fontSize: 10, fontFamily: "'Space Grotesk', sans-serif" } }, h.h)))),
        React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--border)" } },
          React.createElement("span", { className: "t3", style: { fontSize: 11.5 } }, "Comida ", React.createElement("b", { className: "num", style: { color: "var(--text)" } }, window.money0(caja.comida))),
          React.createElement("span", { className: "t3", style: { fontSize: 11.5 } }, "Bebidas ", React.createElement("b", { className: "num", style: { color: "var(--text)" } }, window.money0(caja.bebida))),
          React.createElement("span", { className: "t3", style: { fontSize: 11.5 } }, "Ítems ", React.createElement("b", { className: "num", style: { color: "var(--text)" } }, caja.itemsComida + caja.itemsBebida)))),

      /* estado de mesas resumen */
      React.createElement("div", { className: "card card-pad fade-up" },
        React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 14 } },
          React.createElement("h3", { style: { margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } }, "Estado de mesas"),
          React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setView("mesas") }, "Ver todas")),
        [["libre", "Disponibles", "ok"], ["ocupada", "Ocupadas", "busy"], ["reservada", "Reservadas", "resv"], ["cuenta", "Piden cuenta", "warn"]].map(([k, lbl, cls]) => {
          const val = r[k] || 0; const pct = Math.round((val / r.total) * 100);
          return React.createElement("div", { key: k, style: { marginBottom: 14 } },
            React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 6 } },
              React.createElement("span", { className: "row gap8", style: { fontSize: 13 } },
                React.createElement("span", { className: "badge badge--" + cls, style: { width: 13, height: 13, padding: 0, borderRadius: 4 } }, React.createElement("i", { className: "dot" })), lbl),
              React.createElement("b", { className: "num", style: { fontSize: 14 } }, val)),
            React.createElement("div", { className: "meter " + (cls === "ok" ? "ok" : cls === "warn" ? "warn" : cls === "resv" ? "" : "") },
              React.createElement("i", { style: { width: pct + "%", background: cls === "ok" ? "var(--ok)" : cls === "busy" ? "var(--busy)" : cls === "resv" ? "var(--resv)" : "var(--warn)" } })));
        }),
        React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginTop: 4, paddingTop: 14, borderTop: "1px solid var(--border)" } },
          React.createElement("span", { className: "t3", style: { fontSize: 12 } }, "Total de mesas"),
          React.createElement("b", { className: "num" }, r.total)))
    ),

    /* Alertas + top productos */
    React.createElement("div", { style: { display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr", marginTop: 14, alignItems: "start" } },
      /* alertas */
      React.createElement("div", { className: "card card-pad fade-up" },
        React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 12 } },
          React.createElement("h3", { className: "row gap8", style: { margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } },
            React.createElement(window.Icon, { name: "alert", style: { width: 17, height: 17, color: "var(--warn)" } }), "Alertas"),
          React.createElement("span", { className: "badge badge--warn" }, (alertasInsumos.length + mesasEsperando.length) + " activas")),
        mesasEsperando.map(m => React.createElement("div", { key: m.id, className: "row gap10", style: { padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }, onClick: () => { setView("mesas"); setDrawerMesa(m.id); } },
          React.createElement("span", { className: "badge badge--warn", style: { width: 30, height: 30, padding: 0, justifyContent: "center", borderRadius: 9 } }, React.createElement(window.Icon, { name: "hourglass", style: { width: 15, height: 15 } })),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, "Mesa " + m.num + " espera la cuenta"),
            React.createElement("div", { className: "t3", style: { fontSize: 11.5 } }, m.zona + " · " + window.fmtMin(m.minAbierta) + " activa")),
          React.createElement(window.Icon, { name: "chevR", style: { width: 16, height: 16, color: "var(--text-3)" } }))),
        alertasInsumos.map(i => React.createElement("div", { key: i.id, className: "row gap10", style: { padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }, onClick: () => setView("inventario") },
          React.createElement("span", { className: "badge badge--danger", style: { width: 30, height: 30, padding: 0, justifyContent: "center", borderRadius: 9 } }, React.createElement(window.Icon, { name: "box", style: { width: 15, height: 15 } })),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, i.nombre + " bajo"),
            React.createElement("div", { className: "t3", style: { fontSize: 11.5 } }, "Quedan " + i.stock + " " + i.unidad + " · mínimo " + i.min + " " + i.unidad)),
          React.createElement("span", { className: "num", style: { fontSize: 12, color: "var(--danger)", fontWeight: 700 } }, Math.round((i.stock / i.ideal) * 100) + "%"))),
        (alertasInsumos.length + mesasEsperando.length) === 0 && React.createElement("div", { className: "empty" }, React.createElement(window.Icon, { name: "check" }), "Todo en orden")),

      /* top productos */
      React.createElement("div", { className: "card card-pad fade-up" },
        React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 12 } },
          React.createElement("h3", { className: "row gap8", style: { margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } },
            React.createElement(window.Icon, { name: "flame", style: { width: 17, height: 17, color: "var(--accent)" } }), "Más vendidos hoy"),
          React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setView("stats") }, "Estadísticas")),
        top3.map((p, i) => React.createElement("div", { key: p.id, className: "row gap12", style: { padding: "9px 0", borderBottom: i < top3.length - 1 ? "1px solid var(--border)" : "none" } },
          React.createElement("span", { className: "num t3", style: { width: 18, fontWeight: 700 } }, "0" + (i + 1)),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, p.nombre),
            React.createElement("div", { className: "meter", style: { marginTop: 6 } }, React.createElement("i", { style: { width: (p.qty / top3[0].qty * 100) + "%" } }))),
          React.createElement("div", { style: { textAlign: "right" } },
            React.createElement("div", { className: "num", style: { fontWeight: 700, fontSize: 14 } }, p.qty),
            React.createElement("div", { className: "t3 num", style: { fontSize: 11 } }, window.money0(p.ingreso))))))
    )
  );
}
window.Dashboard = Dashboard;
