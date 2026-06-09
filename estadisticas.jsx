/* ============================================================
   TALISMÁN — Módulo ESTADÍSTICAS
   ============================================================ */
function StatBar({ data, fmt, max }) {
  return React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 10, height: 220 } },
    data.map((d, i) => React.createElement("div", {
      key: i,
      style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 9, height: "100%", justifyContent: "flex-end" }
    },
      React.createElement("span", { className: "num t2", style: { fontSize: 10.5, opacity: d.v ? 1 : .3 } }, d.v ? fmt(d.v).replace("S/ ", "") : "—"),
      React.createElement("div", {
        title: fmt(d.v),
        style: { width: "100%", maxWidth: 54, height: Math.max(2, (d.v / max) * 165) + "px", borderRadius: "6px 6px 0 0", background: d.v === max ? "linear-gradient(180deg,var(--accent-2),var(--accent))" : "var(--surface-3)", transition: "height .4s" }
      }),
      React.createElement("span", { className: "t3", style: { fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" } }, d.label)
    ))
  );
}

function TopRow({ p, i, top }) {
  return React.createElement("tr", { key: p.id },
    React.createElement("td", { style: { width: 36 } },
      React.createElement("span", { className: "num", style: { fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--text-3)" } }, "0" + (i + 1))),
    React.createElement("td", null,
      React.createElement("b", { style: { fontWeight: 600 } }, p.nombre),
      React.createElement("div", { className: "meter", style: { marginTop: 6, maxWidth: 240 } },
        React.createElement("i", { style: { width: (p.qty / top[0].qty * 100) + "%" } }))),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, fontSize: 15 } }, p.qty),
    React.createElement("td", { className: "num t2", style: { textAlign: "right" } }, window.money0(p.ingreso))
  );
}

function PerfRow({ label, value, icon }) {
  return React.createElement("div", { className: "row", style: { justifyContent: "space-between", padding: "11px 0", borderTop: "1px solid var(--border)" } },
    React.createElement("span", { className: "row gap8 t2", style: { fontSize: 13 } },
      React.createElement(window.Icon, { name: icon, style: { width: 15, height: 15, color: "var(--text-3)" } }), label),
    React.createElement("b", { className: "num", style: { fontSize: 15 } }, value)
  );
}

function Estadisticas() {
  const { D, caja, topProductos } = window.useStore();
  const [periodo, setPeriodo] = React.useState("semana");

  const series = {
    dia:    { data: D.ventasPorHora.map(d => ({ label: d.h + "h", v: d.v })), titulo: "Ventas por hora · hoy" },
    semana: { data: D.ventasSemana.map(d => ({ label: d.d, v: d.v })),       titulo: "Ventas por día · esta semana" },
    mes:    { data: D.ventasMes.map(d => ({ label: d.m, v: d.v })),           titulo: "Ventas por semana · este mes" },
    anio:   { data: D.ventasAnio.map(d => ({ label: d.m, v: d.v * 1000 })),   titulo: "Ventas por mes · 2026" },
  }[periodo];
  const fmt = window.money0;

  const total = series.data.reduce((s, d) => s + d.v, 0);
  const max = Math.max(...series.data.map(d => d.v), 1);
  const activos = series.data.filter(d => d.v > 0).length || 1;
  const prom = total / activos;
  const mejor = series.data.reduce((a, b) => b.v > a.v ? b : a, series.data[0]);
  const top = topProductos.filter(p => p.qty > 0).slice(0, 6);
  const totalQty = topProductos.reduce((s, p) => s + p.qty, 0);
  const crecimiento = Math.round((caja.total - D.ref.ventasAyer) / D.ref.ventasAyer * 100);

  return React.createElement("div", { className: "view" },
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, "Rendimiento del negocio"),
        React.createElement("h1", { className: "page-title" }, "Estadísticas"),
        React.createElement("p", { className: "page-sub" }, "Ventas y desempeño por período, alimentadas por la caja.")),
      React.createElement("div", { className: "seg" },
        [["dia", "Día"], ["semana", "Semana"], ["mes", "Mes"], ["anio", "Año"]].map(([k, l]) =>
          React.createElement("button", { key: k, className: periodo === k ? "is-active" : "", onClick: () => setPeriodo(k) }, l)))),

    React.createElement("div", { className: "stat-grid stagger", style: { marginBottom: 14 } },
      React.createElement(window.StatTile, { icon: "dollar", label: "Total del período", value: fmt(total), accent: true }),
      React.createElement(window.StatTile, { icon: "up", label: "Mejor punto", value: mejor.label, foot: fmt(mejor.v) }),
      React.createElement(window.StatTile, { icon: "layers", label: "Promedio", value: fmt(Math.round(prom)) }),
      React.createElement(window.StatTile, { icon: "flame", label: "Ítems vendidos hoy", value: totalQty, foot: top.length ? "Top: " + top[0].nombre : "" })),

    React.createElement("div", { className: "card card-pad fade-up", style: { marginBottom: 14 } },
      React.createElement("h3", { style: { margin: "0 0 20px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } }, series.titulo),
      React.createElement(StatBar, { data: series.data, fmt: fmt, max: max })),

    React.createElement("div", { style: { display: "grid", gap: 14, gridTemplateColumns: "1.3fr 1fr", alignItems: "start" } },
      React.createElement("div", { className: "card fade-up", style: { overflow: "hidden" } },
        React.createElement("h3", { className: "row gap8", style: { margin: 0, padding: "16px 18px 12px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } },
          React.createElement(window.Icon, { name: "flame", style: { width: 17, height: 17, color: "var(--accent)" } }), "Productos más vendidos"),
        React.createElement("table", { className: "tbl" },
          React.createElement("tbody", null,
            top.map((p, i) => React.createElement(TopRow, { key: p.id, p: p, i: i, top: top }))))),

      React.createElement("div", { className: "card card-pad fade-up" },
        React.createElement("h3", { style: { margin: "0 0 16px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } }, "Composición de ventas hoy"),
        React.createElement("div", { style: { display: "flex", height: 16, borderRadius: 99, overflow: "hidden", marginBottom: 16 } },
          React.createElement("div", { style: { width: (caja.comida / caja.total * 100) + "%", background: "var(--accent)" } }),
          React.createElement("div", { style: { width: (caja.bebida / caja.total * 100) + "%", background: "var(--resv)" } })),
        React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 18 } },
          React.createElement("span", { className: "row gap8", style: { fontSize: 13 } },
            React.createElement("span", { style: { width: 11, height: 11, borderRadius: 3, background: "var(--accent)" } }), "Comida ",
            React.createElement("b", { className: "num" }, Math.round(caja.comida / caja.total * 100) + "%")),
          React.createElement("span", { className: "row gap8", style: { fontSize: 13 } },
            React.createElement("span", { style: { width: 11, height: 11, borderRadius: 3, background: "var(--resv)" } }), "Bebidas ",
            React.createElement("b", { className: "num" }, Math.round(caja.bebida / caja.total * 100) + "%"))),
        React.createElement(PerfRow, { label: "Ticket promedio", value: fmt(caja.ticket), icon: "card" }),
        React.createElement(PerfRow, { label: "Transacciones hoy", value: caja.nTrans, icon: "receipt" }),
        React.createElement(PerfRow, { label: "Crecimiento vs ayer", value: (crecimiento >= 0 ? "+" : "") + crecimiento + "%", icon: "up" })))
  );
}
window.Estadisticas = Estadisticas;
