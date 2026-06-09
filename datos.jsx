/* ============================================================
   TALISMÁN — Módulo MODELO DE DATOS (documentación Supabase)
   ============================================================ */
const SCHEMA = [
  { name: "usuarios", icon: "personal", desc: "Empleados y accesos", cols: [
    ["pk", "id", "uuid"], ["", "nombre", "text"], ["", "documento", "text"],
    ["", "rol", "text · enum"], ["", "sueldo", "numeric"], ["", "estado", "text"],
  ]},
  { name: "mesas", icon: "mesas", desc: "Mesas físicas del salón", cols: [
    ["pk", "id", "uuid"], ["", "numero", "int"], ["", "zona", "text"],
    ["", "capacidad", "int"], ["", "estado", "text · enum"], ["fk", "mozo_id", "→ usuarios"],
  ]},
  { name: "productos", icon: "utensils", desc: "La carta vendible", cols: [
    ["pk", "id", "uuid"], ["", "nombre", "text"], ["", "categoria", "comida|bebida"],
    ["", "subcategoria", "text"], ["", "precio", "numeric"], ["", "activo", "bool"],
  ]},
  { name: "insumos", icon: "box", desc: "Inventario dinámico", cols: [
    ["pk", "id", "uuid"], ["", "nombre", "text"], ["", "unidad", "text"],
    ["", "stock", "numeric"], ["", "minimo", "numeric"], ["", "costo", "numeric"],
  ]},
  { name: "producto_insumo", icon: "link", desc: "Receta: qué descuenta cada producto", cols: [
    ["pk", "id", "uuid"], ["fk", "producto_id", "→ productos"], ["fk", "insumo_id", "→ insumos"],
    ["", "cantidad", "numeric"],
  ]},
  { name: "activos", icon: "layers", desc: "Inventario estático (vajilla)", cols: [
    ["pk", "id", "uuid"], ["", "nombre", "text"], ["", "total", "int"],
    ["", "en_uso", "int"], ["", "estado", "text"],
  ]},
  { name: "pedidos", icon: "receipt", desc: "Una comanda por mesa abierta", cols: [
    ["pk", "id", "uuid"], ["fk", "mesa_id", "→ mesas"], ["fk", "usuario_id", "→ usuarios"],
    ["", "estado", "abierto|cobrado"], ["", "comensales", "int"], ["", "abierto_en", "timestamptz"],
  ]},
  { name: "detalle_pedido", icon: "list", desc: "Líneas de producto de cada pedido", cols: [
    ["pk", "id", "uuid"], ["fk", "pedido_id", "→ pedidos"], ["fk", "producto_id", "→ productos"],
    ["", "cantidad", "int"], ["", "precio_unit", "numeric"],
  ]},
  { name: "pagos", icon: "cash", desc: "Cobro que cierra el pedido", cols: [
    ["pk", "id", "uuid"], ["fk", "pedido_id", "→ pedidos"], ["", "metodo", "text · enum"],
    ["", "total", "numeric"], ["", "comida", "numeric"], ["", "bebida", "numeric"], ["", "creado_en", "timestamptz"],
  ]},
  { name: "cupones", icon: "star", desc: "Códigos de descuento aplicables al cobro", cols: [
    ["pk", "id", "uuid"], ["", "codigo", "text · unique"], ["", "tipo", "porcentaje|monto"],
    ["", "valor", "numeric"], ["", "activo", "bool"], ["", "fecha_expiracion", "date"],
    ["", "uso_maximo", "int · null"], ["", "usos_actuales", "int"],
  ]},
];

function FlowNode({ icon, label }) {
  return React.createElement("div", { className: "flow__node" }, React.createElement(window.Icon, { name: icon }), label);
}
function Arrow() {
  return React.createElement("span", { className: "flow__arrow" }, React.createElement(window.Icon, { name: "chevR" }));
}

function Datos() {
  const conexiones = [
    { de: "Mesas", a: "Pedidos", txt: "Abrir una mesa crea un pedido en estado abierto, ligado a la mesa y al mozo." },
    { de: "Pedidos", a: "Detalle", txt: "Cada producto agregado a la comanda inserta una fila en detalle_pedido con su precio." },
    { de: "Detalle", a: "Insumos", txt: "Al cobrar, por cada línea se lee producto_insumo y se descuenta el stock de insumos." },
    { de: "Pedidos", a: "Pagos", txt: "El cobro crea un registro en pagos, marca el pedido como cobrado y libera la mesa." },
    { de: "Pagos", a: "Caja / Stats", txt: "Caja y Estadísticas son vistas agregadas sobre pagos y detalle_pedido del día." },
  ];

  return React.createElement("div", { className: "view" },
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, "Listo para implementar · Supabase / Postgres"),
        React.createElement("h1", { className: "page-title" }, "Modelo de datos"),
        React.createElement("p", { className: "page-sub" }, "Las tablas y relaciones que sostienen toda la operación del sistema.")),
      React.createElement("button", { className: "btn btn--ghost" }, React.createElement(window.Icon, { name: "key" }), "RLS por rol")),

    /* Flujo del sistema */
    React.createElement("div", { className: "card card-pad fade-up", style: { marginBottom: 18 } },
      React.createElement("h3", { className: "row gap8", style: { margin: "0 0 16px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 } },
        React.createElement(window.Icon, { name: "link", style: { width: 17, height: 17, color: "var(--accent)" } }), "Flujo del sistema"),
      React.createElement("div", { className: "flow", style: { marginBottom: 6 } },
        React.createElement(FlowNode, { icon: "mesas", label: "Mesa" }), React.createElement(Arrow),
        React.createElement(FlowNode, { icon: "receipt", label: "Comanda" }), React.createElement(Arrow),
        React.createElement(FlowNode, { icon: "list", label: "Detalle" }), React.createElement(Arrow),
        React.createElement(FlowNode, { icon: "cash", label: "Cobro" }), React.createElement(Arrow),
        React.createElement(FlowNode, { icon: "box", label: "Inventario −" }), React.createElement(Arrow),
        React.createElement(FlowNode, { icon: "caja", label: "Caja" }), React.createElement(Arrow),
        React.createElement(FlowNode, { icon: "stats", label: "Estadísticas" }))),

    /* Conexiones explicadas */
    React.createElement("div", { style: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", marginBottom: 26 } },
      conexiones.map((c, i) => React.createElement("div", { key: i, className: "card card-pad fade-up" },
        React.createElement("div", { className: "row gap8", style: { marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700 } },
          React.createElement("span", { style: { color: "var(--accent)" } }, c.de), React.createElement(window.Icon, { name: "chevR", style: { width: 14, height: 14, color: "var(--text-3)" } }), React.createElement("span", { style: { color: "var(--resv)" } }, c.a)),
        React.createElement("p", { className: "t2", style: { margin: 0, fontSize: 12.5, lineHeight: 1.55 } }, c.txt)))),

    /* ERD */
    React.createElement("div", { className: "sec-head" },
      React.createElement("h3", null, React.createElement(window.Icon, { name: "datos" }), "Esquema de tablas"),
      React.createElement("span", { className: "t3", style: { fontSize: 12, fontFamily: "'Space Grotesk', sans-serif" } }, SCHEMA.length + " tablas")),
    React.createElement("div", { className: "erd stagger" },
      SCHEMA.map(t => React.createElement("div", { key: t.name, className: "tbl-card" },
        React.createElement("div", { className: "tbl-card__head" },
          React.createElement(window.Icon, { name: t.icon }),
          React.createElement("span", { className: "tbl-card__name" }, t.name),
          React.createElement("span", { className: "tbl-card__count" }, t.cols.length + " cols")),
        React.createElement("div", { style: { padding: "8px 15px 6px", borderBottom: "1px solid var(--border)" } },
          React.createElement("span", { className: "t3", style: { fontSize: 11 } }, t.desc)),
        t.cols.map((c, i) => React.createElement("div", { key: i, className: "col" },
          React.createElement("span", { className: "col__key " + c[0] }, c[0] ? c[0].toUpperCase() : ""),
          React.createElement("span", { className: "col__name" }, c[1]),
          React.createElement("span", { className: "col__type" }, c[2]))))))
  );
}
window.Datos = Datos;
