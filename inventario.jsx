/* ============================================================
   TALISMÁN — Módulo INVENTARIO (insumos + activos + carta)
   ============================================================ */
function nivelInsumo(i) {
  if (i.stock <= i.min) return "danger";
  if (i.stock <= i.min * 1.5) return "warn";
  return "ok";
}

/* ---- Fila de insumo (editable) ---- */
function InsumoRow({ i }) {
  const { updateInsumo, toast } = window.useStore();
  const [edit, setEdit] = React.useState(false);
  const [f, setF] = React.useState({ stock: i.stock, min: i.min, costo: i.costo });
  React.useEffect(() => { if (!edit) setF({ stock: i.stock, min: i.min, costo: i.costo }); }, [i, edit]);

  const niv = nivelInsumo(i); const pct = Math.min(100, Math.round((i.stock / i.ideal) * 100));
  const badge = niv === "danger" ? "danger" : niv === "warn" ? "warn" : "ok";
  const label = niv === "danger" ? "Crítico" : niv === "warn" ? "Bajo" : "Óptimo";
  const guardar = () => { updateInsumo(i.id, { stock: parseFloat(f.stock) || 0, min: parseFloat(f.min) || 0, costo: parseFloat(f.costo) || 0 }); setEdit(false); toast("Insumo actualizado: " + i.nombre); };
  const num = (k, props = {}) => React.createElement("input", Object.assign({ className: "cell-input", type: "number", value: f[k], onChange: e => setF(s => ({ ...s, [k]: e.target.value })) }, props));

  return React.createElement("tr", { className: edit ? "is-editing" : "" },
    React.createElement("td", null, React.createElement("b", { style: { fontWeight: 600 } }, i.nombre),
      edit ? React.createElement("div", { className: "row gap6", style: { marginTop: 6, alignItems: "center" } }, React.createElement("span", { className: "t3", style: { fontSize: 11 } }, "Costo "), num("costo", { style: { maxWidth: 78 } }), React.createElement("span", { className: "t3", style: { fontSize: 11 } }, "/" + i.unidad))
        : React.createElement("div", { className: "t3", style: { fontSize: 11 } }, "Costo " + window.money(i.costo) + "/" + i.unidad)),
    React.createElement("td", null, React.createElement(window.Badge, { kind: badge }, label)),
    React.createElement("td", null, React.createElement("div", { className: "meter " + (niv === "ok" ? "ok" : niv) }, React.createElement("i", { style: { width: pct + "%" } })), React.createElement("div", { className: "t3 num", style: { fontSize: 10, marginTop: 4 } }, pct + "% del nivel ideal (" + i.ideal + i.unidad + ")")),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, fontSize: 15, color: niv === "danger" ? "var(--danger)" : "var(--text)" } },
      edit ? num("stock") : React.createElement(React.Fragment, null, i.stock + " ", React.createElement("small", { className: "t3" }, i.unidad))),
    React.createElement("td", { className: "num t2", style: { textAlign: "right" } },
      edit ? num("min") : (i.min + " " + i.unidad)),
    React.createElement("td", { className: "num", style: { textAlign: "right" } }, window.money0(i.stock * i.costo)),
    React.createElement("td", { style: { textAlign: "right" } },
      edit
        ? React.createElement("div", { className: "row-actions" },
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(false) }, "Cancelar"),
            React.createElement("button", { className: "btn btn--accent btn--sm", onClick: guardar }, React.createElement(window.Icon, { name: "check", style: { width: 14, height: 14 } }), "Guardar"))
        : React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(true) }, React.createElement(window.Icon, { name: "edit", style: { width: 14, height: 14 } }), "Editar")));
}

/* ---- Fila de producto / carta (editable: precio + receta) ---- */
function ProductoRow({ p, insumoById, onReceta }) {
  const { updateProducto, costoProducto, toast } = window.useStore();
  const [edit, setEdit] = React.useState(false);
  const [precio, setPrecio] = React.useState(p.precio);
  const [tiempo, setTiempo] = React.useState(p.tiempo || 0);
  React.useEffect(() => { if (!edit) { setPrecio(p.precio); setTiempo(p.tiempo || 0); } }, [p, edit]);
  const guardar = () => { updateProducto(p.id, { precio: parseFloat(precio) || 0, tiempo: parseInt(tiempo, 10) || 0 }); setEdit(false); toast("Producto actualizado: " + p.nombre); };
  const precioNum = edit ? (parseFloat(precio) || 0) : p.precio;
  const costo = costoProducto(p);
  const ganancia = precioNum - costo;
  const margen = precioNum ? Math.round(ganancia / precioNum * 100) : 0;

  return React.createElement("tr", { className: edit ? "is-editing" : "" },
    React.createElement("td", null, React.createElement("b", { style: { fontWeight: 600 } }, p.nombre)),
    React.createElement("td", null, React.createElement(window.Badge, { kind: p.cat === "comida" ? "busy" : "resv" }, p.cat === "comida" ? "Comida" : "Bebida")),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, color: "var(--accent)" } },
      edit
        ? React.createElement("input", { className: "cell-input", type: "number", value: precio, style: { maxWidth: 90, marginLeft: "auto", display: "block", textAlign: "right" }, onChange: e => setPrecio(e.target.value) })
        : window.money(p.precio)),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 600 } },
      edit
        ? React.createElement("div", { className: "row gap6", style: { justifyContent: "flex-end", alignItems: "center" } },
            React.createElement("input", { className: "cell-input", type: "number", min: "0", value: tiempo, style: { maxWidth: 72, textAlign: "right" }, onChange: e => setTiempo(e.target.value) }),
            React.createElement("span", { className: "t3", style: { fontSize: 12 } }, "min"))
        : (p.tiempo ? p.tiempo + " min" : React.createElement("span", { className: "t3", style: { fontSize: 12 } }, "—"))),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, color: ganancia >= 0 ? "var(--ok)" : "var(--danger)" } },
      window.money(ganancia),
      costo > 0 && React.createElement("div", { className: "t3", style: { fontSize: 10 } }, margen + "% margen")),
    React.createElement("td", null, p.receta.length === 0
      ? React.createElement("span", { className: "t3", style: { fontSize: 12 } }, "— sin receta")
      : React.createElement("div", { className: "row gap6 wrap" }, p.receta.map(([id, cant]) =>
          React.createElement("span", { key: id, className: "badge badge--muted" }, (insumoById[id] ? insumoById[id].nombre : id) + " · " + cant + (insumoById[id] ? insumoById[id].unidad : ""))))),
    React.createElement("td", { style: { textAlign: "right" } },
      edit
        ? React.createElement("div", { className: "row-actions" },
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(false) }, "Cancelar"),
            React.createElement("button", { className: "btn btn--accent btn--sm", onClick: guardar }, React.createElement(window.Icon, { name: "check", style: { width: 14, height: 14 } }), "Guardar"))
        : React.createElement("div", { className: "row-actions" },
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => onReceta(p) }, React.createElement(window.Icon, { name: "link", style: { width: 14, height: 14 } }), "Receta"),
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(true) }, React.createElement(window.Icon, { name: "edit", style: { width: 14, height: 14 } }), "Editar"))));
}

/* ---- Fila de bebida (stock embotellado + ganancia) ---- */
function BebidaRow({ b }) {
  const { updateProducto, toast } = window.useStore();
  const [edit, setEdit] = React.useState(false);
  const [f, setF] = React.useState({ stock: b.stock || 0, costo: b.costo || 0, precio: b.precio });
  React.useEffect(() => { if (!edit) setF({ stock: b.stock || 0, costo: b.costo || 0, precio: b.precio }); }, [b, edit]);
  const guardar = () => { updateProducto(b.id, { stock: parseFloat(f.stock) || 0, costo: parseFloat(f.costo) || 0, precio: parseFloat(f.precio) || 0 }); setEdit(false); toast("Bebida actualizada: " + b.nombre); };
  const num = (k, props = {}) => React.createElement("input", Object.assign({ className: "cell-input", type: "number", value: f[k], onChange: e => setF(s => ({ ...s, [k]: e.target.value })), style: { maxWidth: 80, marginLeft: "auto", display: "block", textAlign: "right" } }, props));
  const ganancia = (b.precio - (b.costo || 0));
  const margen = b.precio ? Math.round(ganancia / b.precio * 100) : 0;
  const bajo = (b.stock || 0) <= (b.min || 0);

  return React.createElement("tr", { className: edit ? "is-editing" : "" },
    React.createElement("td", null, React.createElement("b", { style: { fontWeight: 600 } }, b.nombre), React.createElement("div", { className: "t3", style: { fontSize: 11 } }, b.sub)),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, fontSize: 15, color: bajo ? "var(--danger)" : "var(--text)" } },
      edit ? num("stock") : React.createElement(React.Fragment, null, (b.stock || 0) + " ", React.createElement("small", { className: "t3" }, "u"))),
    React.createElement("td", null, React.createElement(window.Badge, { kind: bajo ? "danger" : "ok" }, bajo ? "Bajo" : "OK")),
    React.createElement("td", { className: "num t2", style: { textAlign: "right" } }, edit ? num("costo") : window.money(b.costo || 0)),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, color: "var(--accent)" } }, edit ? num("precio") : window.money(b.precio)),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, color: "var(--ok)" } }, window.money(ganancia), React.createElement("div", { className: "t3", style: { fontSize: 10 } }, margen + "% margen")),
    React.createElement("td", { style: { textAlign: "right" } },
      edit
        ? React.createElement("div", { className: "row-actions" },
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(false) }, "Cancelar"),
            React.createElement("button", { className: "btn btn--accent btn--sm", onClick: guardar }, React.createElement(window.Icon, { name: "check", style: { width: 14, height: 14 } }), "Guardar"))
        : React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(true) }, React.createElement(window.Icon, { name: "edit", style: { width: 14, height: 14 } }), "Editar")));
}

function Inventario() {
  const { insumos, activos, productos, insumoById, descartables } = window.useStore();
  const [tab, setTab] = React.useState("insumos");
  const [compra, setCompra] = React.useState(false);
  const [nuevoActivo, setNuevoActivo] = React.useState(false);
  const [nuevoProducto, setNuevoProducto] = React.useState(false);
  const [nuevoDescartable, setNuevoDescartable] = React.useState(false);
  const [receta, setReceta] = React.useState(null);

  const valorInsumos = insumos.reduce((s, i) => s + i.stock * i.costo, 0);
  const bajos = insumos.filter(i => i.stock <= i.min).length;
  // Bebidas (sección) = SOLO embotelladas: tienen stock propio, sin receta de insumos
  const bebidas = productos.filter(p => p.cat === "bebida" && p.stock != null);
  // Carta = comida + bebidas preparadas (sin stock embotellado): funcionan con receta de insumos
  const platos = productos.filter(p => p.stock == null);
  const bebidasBajas = bebidas.filter(b => (b.stock || 0) <= (b.min || 0)).length;

  return React.createElement("div", { className: "view" },
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, "Almacén y stock"),
        React.createElement("h1", { className: "page-title" }, "Inventario"),
        React.createElement("p", { className: "page-sub" }, "Los insumos y bebidas bajan automáticamente con cada venta. Los activos son control visual.")),
      React.createElement("div", { className: "seg" },
        [["insumos", "Insumos", "box"], ["bebidas", "Bebidas", "coffee"], ["activos", "Activos", "layers"], ["carta", "Carta", "utensils"], ["descartables", "Descartables", "receipt"]].map(([k, l, ic]) =>
          React.createElement("button", { key: k, className: tab === k ? "is-active" : "", onClick: () => setTab(k) },
            React.createElement(window.Icon, { name: ic }), l)))),

    /* ===== INSUMOS ===== */
    tab === "insumos" && React.createElement("div", { className: "fade-up" },
      React.createElement("div", { className: "row gap12 wrap", style: { marginBottom: 16 } },
        React.createElement("div", { className: "card", style: { padding: "12px 16px" } },
          React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" } }, "Valor en almacén"),
          React.createElement("div", { className: "num", style: { fontSize: 20, fontWeight: 700, marginTop: 3 } }, window.money0(valorInsumos))),
        React.createElement("div", { className: "card", style: { padding: "12px 16px" } },
          React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" } }, "Insumos bajo mínimo"),
          React.createElement("div", { className: "num", style: { fontSize: 20, fontWeight: 700, marginTop: 3, color: bajos ? "var(--danger)" : "var(--ok)" } }, bajos)),
        React.createElement("div", { style: { marginLeft: "auto" } }, React.createElement("button", { className: "btn btn--accent", onClick: () => setCompra(true) }, React.createElement(window.Icon, { name: "plus" }), "Registrar compra"))),
      React.createElement("div", { className: "card", style: { overflow: "hidden" } },
        React.createElement("table", { className: "tbl" },
          React.createElement("thead", null, React.createElement("tr", null,
            React.createElement("th", null, "Insumo"), React.createElement("th", null, "Estado"),
            React.createElement("th", { style: { width: 220 } }, "Nivel de stock"),
            React.createElement("th", { style: { textAlign: "right" } }, "Disponible"),
            React.createElement("th", { style: { textAlign: "right" } }, "Mínimo"),
            React.createElement("th", { style: { textAlign: "right" } }, "Valor"),
            React.createElement("th", { style: { textAlign: "right", width: 150 } }, "Acciones"))),
          React.createElement("tbody", null,
            insumos.map(i => React.createElement(InsumoRow, { key: i.id, i: i }))))),
      React.createElement("p", { className: "t3", style: { fontSize: 12, marginTop: 12, display: "flex", gap: 8, alignItems: "center" } },
        React.createElement(window.Icon, { name: "link", style: { width: 15, height: 15, color: "var(--accent)" } }),
        "Cada cobro descuenta estos insumos según la receta del producto. Ajusta el stock manual con “Editar” o suma con “Registrar compra”.")),

    /* ===== BEBIDAS ===== */
    tab === "bebidas" && React.createElement("div", { className: "fade-up" },
      React.createElement("div", { className: "row gap12 wrap", style: { marginBottom: 16 } },
        React.createElement("div", { className: "card", style: { padding: "12px 16px" } },
          React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" } }, "Bebidas en carta"),
          React.createElement("div", { className: "num", style: { fontSize: 20, fontWeight: 700, marginTop: 3 } }, bebidas.length)),
        React.createElement("div", { className: "card", style: { padding: "12px 16px" } },
          React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" } }, "Stock bajo"),
          React.createElement("div", { className: "num", style: { fontSize: 20, fontWeight: 700, marginTop: 3, color: bebidasBajas ? "var(--danger)" : "var(--ok)" } }, bebidasBajas)),
        React.createElement("div", { style: { marginLeft: "auto" } }, React.createElement("button", { className: "btn btn--accent", onClick: () => setCompra(true) }, React.createElement(window.Icon, { name: "plus" }), "Registrar compra"))),
      React.createElement("div", { className: "card", style: { overflow: "hidden" } },
        React.createElement("table", { className: "tbl" },
          React.createElement("thead", null, React.createElement("tr", null,
            React.createElement("th", null, "Bebida"),
            React.createElement("th", { style: { textAlign: "right" } }, "Stock"),
            React.createElement("th", null, "Estado"),
            React.createElement("th", { style: { textAlign: "right" } }, "Costo"),
            React.createElement("th", { style: { textAlign: "right" } }, "Precio"),
            React.createElement("th", { style: { textAlign: "right" } }, "Ganancia"),
            React.createElement("th", { style: { textAlign: "right", width: 150 } }, "Acciones"))),
          React.createElement("tbody", null,
            bebidas.map(b => React.createElement(BebidaRow, { key: b.id, b: b }))))),
      React.createElement("p", { className: "t3", style: { fontSize: 12, marginTop: 12, display: "flex", gap: 8, alignItems: "center" } },
        React.createElement(window.Icon, { name: "coffee", style: { width: 15, height: 15, color: "var(--accent)" } }),
        "Productos embotellados con stock propio: cada venta descuenta una unidad. La ganancia se calcula automática (precio − costo).")),

    /* ===== ACTIVOS ===== */
    tab === "activos" && React.createElement("div", { className: "fade-up" },
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" } },
        React.createElement("p", { className: "t2", style: { margin: 0, fontSize: 13, flex: 1, minWidth: 240 } }, "Vajilla y utensilios. No cambian con las ventas — se controlan por conteo visual."),
        React.createElement("button", { className: "btn btn--accent", onClick: () => setNuevoActivo(true) }, React.createElement(window.Icon, { name: "plus" }), "Agregar activo")),
      React.createElement("div", { style: { display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))" } },
        activos.map(a => React.createElement(ActivoCard, { key: a.id, a: a }))) ),

    /* ===== CARTA / PRODUCTOS ===== */
    tab === "carta" && React.createElement("div", { className: "fade-up" },
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" } },
        React.createElement("p", { className: "t2", style: { margin: 0, fontSize: 13, flex: 1, minWidth: 240 } }, "Los platos vendibles y la receta que conecta cada venta con el inventario. Pulsa “Receta” para asignar insumos y cantidades exactas."),
        React.createElement("button", { className: "btn btn--accent", onClick: () => setNuevoProducto(true) }, React.createElement(window.Icon, { name: "plus" }), "Agregar producto")),
      React.createElement("div", { className: "card", style: { overflow: "hidden" } },
        React.createElement("table", { className: "tbl" },
          React.createElement("thead", null, React.createElement("tr", null,
            React.createElement("th", null, "Producto"), React.createElement("th", null, "Categoría"),
            React.createElement("th", { style: { textAlign: "right" } }, "Precio"),
            React.createElement("th", { style: { textAlign: "right" } }, "Tiempo"),
            React.createElement("th", { style: { textAlign: "right" } }, "Ganancia"),
            React.createElement("th", null, "Insumos que descuenta"),
            React.createElement("th", { style: { textAlign: "right", width: 180 } }, "Acciones"))),
          React.createElement("tbody", null,
            platos.map(function (p) { return React.createElement(ProductoRow, { key: p.id, p: p, insumoById: insumoById, onReceta: setReceta }); }))
        )
      )
    ),

    /* ===== DESCARTABLES ===== */
    tab === "descartables" && React.createElement("div", { className: "fade-up" },
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" } },
        React.createElement("p", { className: "t2", style: { margin: 0, fontSize: 13, flex: 1, minWidth: 240 } }, "Empaques para pedidos “Para llevar” (táppers, bolsas, cubiertos). Su precio y stock se usan en la orden de mostrador y bajan al cobrar."),
        React.createElement("button", { className: "btn btn--accent", onClick: () => setNuevoDescartable(true) }, React.createElement(window.Icon, { name: "plus" }), "Agregar descartable")),
      React.createElement("div", { className: "card", style: { overflow: "hidden" } },
        React.createElement("table", { className: "tbl" },
          React.createElement("thead", null, React.createElement("tr", null,
            React.createElement("th", null, "Descartable"),
            React.createElement("th", { style: { textAlign: "right" } }, "Precio"),
            React.createElement("th", { style: { textAlign: "right" } }, "Stock"),
            React.createElement("th", { style: { textAlign: "right" } }, "Mínimo"),
            React.createElement("th", null, "Estado"),
            React.createElement("th", { style: { textAlign: "right", width: 150 } }, "Acciones"))),
          React.createElement("tbody", null,
            (descartables || []).map(function (d) { return React.createElement(DescartableRow, { key: d.id, d: d }); }))
        )
      )
    ),

    compra && React.createElement(window.RegistrarCompraModal, { modo: tab, onClose: () => setCompra(false) }),
    nuevoActivo && React.createElement(window.AgregarActivoModal, { onClose: () => setNuevoActivo(false) }),
    nuevoProducto && React.createElement(window.AgregarProductoModal, { onClose: () => setNuevoProducto(false) }),
    nuevoDescartable && React.createElement(window.AgregarDescartableModal, { onClose: () => setNuevoDescartable(false) }),
    receta && React.createElement(window.RecetaModal, { producto: receta, onClose: () => setReceta(null) })
  );
}
window.Inventario = Inventario;

/* ---- Fila de descartable (precio + stock editables) ---- */
function DescartableRow({ d }) {
  const { updateDescartable, toast } = window.useStore();
  const [edit, setEdit] = React.useState(false);
  const [f, setF] = React.useState({ precio: d.precio, stock: d.stock, min: d.min });
  React.useEffect(() => { if (!edit) setF({ precio: d.precio, stock: d.stock, min: d.min }); }, [d, edit]);
  const bajo = (d.stock || 0) <= (d.min || 0);
  const guardar = () => { updateDescartable(d.id, { precio: parseFloat(f.precio) || 0, stock: parseInt(f.stock, 10) || 0, min: parseInt(f.min, 10) || 0 }); setEdit(false); toast("Descartable actualizado: " + d.nombre); };
  const num = (k, props = {}) => React.createElement("input", Object.assign({ className: "cell-input", type: "number", value: f[k], onChange: e => setF(s => ({ ...s, [k]: e.target.value })), style: { maxWidth: 84, marginLeft: "auto", display: "block", textAlign: "right" } }, props));
  return React.createElement("tr", { className: edit ? "is-editing" : "" },
    React.createElement("td", null, React.createElement("b", { style: { fontWeight: 600 } }, d.nombre), React.createElement("div", { className: "t3", style: { fontSize: 11 } }, "Empaque para llevar")),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, color: "var(--accent)" } }, edit ? num("precio") : window.money(d.precio)),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700, fontSize: 15, color: bajo ? "var(--danger)" : "var(--text)" } }, edit ? num("stock") : ((d.stock || 0) + " u")),
    React.createElement("td", { className: "num t2", style: { textAlign: "right" } }, edit ? num("min") : ((d.min || 0) + " u")),
    React.createElement("td", null, React.createElement(window.Badge, { kind: bajo ? "danger" : "ok" }, bajo ? "Bajo" : "OK")),
    React.createElement("td", { style: { textAlign: "right" } },
      edit
        ? React.createElement("div", { className: "row-actions" },
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(false) }, "Cancelar"),
            React.createElement("button", { className: "btn btn--accent btn--sm", onClick: guardar }, React.createElement(window.Icon, { name: "check", style: { width: 14, height: 14 } }), "Guardar"))
        : React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(true) }, React.createElement(window.Icon, { name: "edit", style: { width: 14, height: 14 } }), "Editar")));
}
window.DescartableRow = DescartableRow;

/* ---- Tarjeta de activo (tipo mesa, editable) ---- */
function ActivoCard({ a }) {
  const { updateActivo, toast } = window.useStore();
  const [edit, setEdit] = React.useState(false);
  const [total, setTotal] = React.useState(a.total);
  const [enUso, setEnUso] = React.useState(a.enUso);
  React.useEffect(() => { if (!edit) { setTotal(a.total); setEnUso(a.enUso); } }, [a, edit]);
  const disp = a.total - a.enUso; const pct = a.total ? Math.round((a.enUso / a.total) * 100) : 0;
  const guardar = () => { updateActivo(a.id, { total: parseInt(total) || 0, enUso: Math.min(parseInt(enUso) || 0, parseInt(total) || 0) }); setEdit(false); toast("Activo actualizado: " + a.nombre); };

  return React.createElement("div", { className: "card card-pad" },
    React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginBottom: 14 } },
      React.createElement("span", { style: { display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 11, background: "var(--surface-2)", color: "var(--accent)" } }, React.createElement(window.Icon, { name: "layers" })),
      React.createElement(window.Badge, { kind: a.estado === "warn" ? "warn" : "muted" }, a.estado === "warn" ? "Revisar" : "OK")),
    React.createElement("div", { style: { fontWeight: 600, fontSize: 14 } }, a.nombre),
    edit
      ? React.createElement("div", { style: { marginTop: 12 } },
          React.createElement("div", { className: "row gap8", style: { marginBottom: 8 } },
            React.createElement("label", { className: "field", style: { flex: 1 } }, React.createElement("span", { className: "field__label" }, "Total"), React.createElement("input", { className: "input", type: "number", value: total, onChange: e => setTotal(e.target.value), style: { height: 34 } })),
            React.createElement("label", { className: "field", style: { flex: 1 } }, React.createElement("span", { className: "field__label" }, "En uso"), React.createElement("input", { className: "input", type: "number", value: enUso, onChange: e => setEnUso(e.target.value), style: { height: 34 } }))),
          React.createElement("div", { className: "row gap6" },
            React.createElement("button", { className: "btn btn--ghost btn--sm", style: { flex: 1 }, onClick: () => setEdit(false) }, "Cancelar"),
            React.createElement("button", { className: "btn btn--accent btn--sm", style: { flex: 1 }, onClick: guardar }, "Guardar")))
      : React.createElement(React.Fragment, null,
          React.createElement("div", { className: "row", style: { justifyContent: "space-between", marginTop: 12, marginBottom: 8 } },
            React.createElement("span", null, React.createElement("b", { className: "num", style: { fontSize: 22 } }, disp), React.createElement("span", { className: "t3", style: { fontSize: 11 } }, " disp.")),
            React.createElement("span", { className: "t3 num", style: { fontSize: 12 } }, a.enUso + " en uso · " + a.total + " total")),
          React.createElement("div", { className: "meter " + (a.estado === "warn" ? "warn" : "") }, React.createElement("i", { style: { width: pct + "%" } })),
          React.createElement("button", { className: "btn btn--ghost btn--sm", style: { marginTop: 12, width: "100%" }, onClick: () => setEdit(true) }, React.createElement(window.Icon, { name: "edit", style: { width: 14, height: 14 } }), "Editar conteo")));
}
