/* ============================================================
   TALISMÁN — Inventario · Modales (compra, activo, receta)
   ============================================================ */
const { useState: _iS, useMemo: _iM } = React;

/* ---------- REGISTRAR COMPRA (según pestaña activa) ---------- */
function RegistrarCompraModal({ onClose, modo }) {
  const { insumos, productos, registrarCompra, addInsumo, addBebida, toast } = window.useStore();
  // La pestaña activa decide SIEMPRE el destino: insumos → insumos, bebidas → bebidas
  const isBebida = modo === "bebidas";
  const destinoTab = isBebida ? "bebida" : "insumo";
  const bebidas = productos.filter(p => p.cat === "bebida");
  // El catálogo solo muestra los ítems de la pestaña activa (no se mezclan)
  const catalogo = _iM(() => isBebida
    ? bebidas.map(b => ({ destino: "bebida", id: b.id, nombre: b.nombre, unidad: "u", costo: b.costo || 0 }))
    : insumos.map(i => ({ destino: "insumo", id: i.id, nombre: i.nombre, unidad: i.unidad, costo: i.costo })),
  [insumos, productos, isBebida]);

  const [q, setQ] = _iS("");
  const [sel, setSel] = _iS(null);          // item del catálogo elegido
  const [crear, setCrear] = _iS(false);     // creando producto nuevo en la pestaña activa
  const [cant, setCant] = _iS("");
  const [unidad, setUnidad] = _iS(isBebida ? "u" : "kg");
  const [costo, setCosto] = _iS("");
  const [precio, setPrecio] = _iS("");
  const [nombreNuevo, setNombreNuevo] = _iS("");
  const fecha = "2026-06-05";

  const matches = q.trim() ? catalogo.filter(c => c.nombre.toLowerCase().includes(q.toLowerCase())) : catalogo;
  const existe = catalogo.find(c => c.nombre.toLowerCase() === q.trim().toLowerCase());

  const elegir = (c) => { setSel(c); setCrear(false); setQ(c.nombre); setUnidad(c.unidad); setCosto(String(c.costo || "")); };
  const iniciarCrear = () => { setCrear(true); setSel(null); setNombreNuevo(q); setUnidad(isBebida ? "u" : "kg"); };

  const guardar = () => {
    if (sel) {
      if (!cant) return toast("Ingresa la cantidad", "warn");
      // destino tomado del ítem seleccionado, que pertenece a la pestaña activa
      registrarCompra({ destino: sel.destino, id: sel.id, nombre: sel.nombre, cantidad: cant, unidad: sel.unidad, costo, fecha });
      onClose();
    } else if (crear && !isBebida) {
      if (!nombreNuevo.trim() || !cant) return toast("Completa nombre y cantidad", "warn");
      addInsumo({ nombre: nombreNuevo.trim(), unidad, cantidad: cant, costo, fecha });
      onClose();
    } else if (crear && isBebida) {
      if (!nombreNuevo.trim() || !cant) return toast("Completa nombre y cantidad", "warn");
      addBebida({ nombre: nombreNuevo.trim(), sub: "Gaseosas", precio, costo, cantidad: cant, fecha });
      onClose();
    } else {
      toast(isBebida ? "Selecciona o crea una bebida" : "Selecciona o crea un insumo", "warn");
    }
  };

  const field = (label, node) => React.createElement("label", { className: "field", style: { flex: 1 } }, React.createElement("span", { className: "field__label" }, label), node);
  const inp = (val, set, props = {}) => React.createElement("input", Object.assign({ className: "input", value: val, onChange: e => set(e.target.value) }, props));

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(520px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, isBebida ? "Movimiento de bebidas" : "Movimiento de almacén"),
          React.createElement("h2", { style: { margin: "0 0 16px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700 } }, isBebida ? "Registrar compra de bebida" : "Registrar compra"),

          React.createElement("div", { className: "field__label" }, isBebida ? "Bebida" : "Insumo"),
          React.createElement("div", { className: "search", style: { marginBottom: 8 } }, React.createElement(window.Icon, { name: "search" }),
            React.createElement("input", { className: "input", placeholder: isBebida ? "Buscar bebida…" : "Buscar insumo…", value: q, onChange: e => { setQ(e.target.value); setSel(null); setCrear(false); } })),

          // resultados de búsqueda (solo de la pestaña activa)
          !sel && !crear && React.createElement("div", { className: "card", style: { maxHeight: 180, overflowY: "auto", marginBottom: 12, padding: 4 } },
            matches.length > 0 && matches.slice(0, 30).map(c => React.createElement("button", { key: c.destino + c.id, className: "menu__item", style: { borderRadius: 8 }, onClick: () => elegir(c) },
              React.createElement(window.Icon, { name: isBebida ? "coffee" : "box" }),
              React.createElement("span", { style: { flex: 1 } }, c.nombre),
              React.createElement("span", { className: "badge badge--muted" }, isBebida ? "Bebida" : "Insumo"))),
            !existe && q.trim() && React.createElement("div", { style: { padding: 8, borderTop: matches.length ? "1px solid var(--border)" : "none" } },
              React.createElement("div", { className: "t3", style: { fontSize: 11.5, marginBottom: 8 } }, "“" + q + "” no existe. Crear como:"),
              React.createElement("div", { className: "row gap8" },
                React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: iniciarCrear },
                  React.createElement(window.Icon, { name: isBebida ? "coffee" : "box", style: { width: 14, height: 14 } }),
                  isBebida ? "Nueva bebida" : "Nuevo insumo")))),

          // estado: producto existente seleccionado
          sel && React.createElement("div", { className: "card", style: { padding: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 10, borderColor: "var(--border-accent)" } },
            React.createElement("span", { className: "badge badge--ok" }, React.createElement("i", { className: "dot" }), "Existente"),
            React.createElement("span", { style: { flex: 1, fontWeight: 600 } }, sel.nombre),
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => { setSel(null); setQ(""); } }, "Cambiar")),

          // estado: creando nuevo (en la pestaña activa)
          crear && React.createElement("div", { className: "card", style: { padding: 12, marginBottom: 12, borderColor: "var(--border-accent)" } },
            React.createElement("div", { className: "row gap8", style: { marginBottom: 10, alignItems: "center" } },
              React.createElement("span", { className: "badge badge--warn" }, "Nueva " + (isBebida ? "bebida" : "insumo")),
              React.createElement("button", { className: "btn btn--ghost btn--sm", style: { marginLeft: "auto" }, onClick: () => { setCrear(false); } }, "Cancelar")),
            field("Nombre", inp(nombreNuevo, setNombreNuevo, { placeholder: isBebida ? "Ej: Sprite 500ml" : "Ej: Camarón" }))),

          // campos de compra
          React.createElement("div", { className: "row gap10", style: { marginBottom: 12 } },
            field("Cantidad", inp(cant, setCant, { type: "number", placeholder: "0" })),
            !isBebida
              ? field("Unidad", React.createElement("select", { className: "select", value: unidad, onChange: e => setUnidad(e.target.value), disabled: !!sel },
                  ["kg", "u", "L", "g", "ml", "caja"].map(u => React.createElement("option", { key: u, value: u }, u))))
              : field("Unidad", inp("u", () => {}, { disabled: true }))),
          React.createElement("div", { className: "row gap10", style: { marginBottom: (crear && isBebida) ? 12 : 18 } },
            field("Costo unitario (S/)", inp(costo, setCosto, { type: "number", placeholder: "0.00" })),
            field("Fecha", inp(fecha, () => {}, { type: "date", defaultValue: fecha, disabled: true }))),
          crear && isBebida && React.createElement("div", { style: { marginBottom: 18 } },
            field("Precio de venta (S/)", inp(precio, setPrecio, { type: "number", placeholder: "0.00" }))),

          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", onClick: guardar },
            React.createElement(window.Icon, { name: "check" }), "Guardar y sumar stock"),
          React.createElement("div", { className: "t3", style: { fontSize: 11, textAlign: "center", marginTop: 10 } },
            isBebida ? "Suma el stock de la bebida y registra el movimiento." : "Suma el stock del insumo y registra el movimiento.")
        )))
  );
}
window.RegistrarCompraModal = RegistrarCompraModal;

/* ---------- AGREGAR ACTIVO ---------- */
function AgregarActivoModal({ onClose }) {
  const { addActivo, toast } = window.useStore();
  const [nombre, setNombre] = _iS("");
  const [total, setTotal] = _iS("");
  const guardar = () => {
    if (!nombre.trim() || !total) return toast("Completa nombre y cantidad", "warn");
    addActivo({ nombre: nombre.trim(), total }); onClose();
  };
  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(420px,96vw)" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Vajilla y utensilios"),
          React.createElement("h2", { style: { margin: "0 0 16px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 } }, "Agregar activo"),
          React.createElement("label", { className: "field", style: { marginBottom: 12 } }, React.createElement("span", { className: "field__label" }, "Nombre del activo"),
            React.createElement("input", { className: "input", placeholder: "Ej: Copas de vino", value: nombre, onChange: e => setNombre(e.target.value) })),
          React.createElement("label", { className: "field", style: { marginBottom: 18 } }, React.createElement("span", { className: "field__label" }, "Cantidad total"),
            React.createElement("input", { className: "input", type: "number", placeholder: "0", value: total, onChange: e => setTotal(e.target.value) })),
          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", onClick: guardar }, React.createElement(window.Icon, { name: "check" }), "Agregar activo"))))
  );
}
window.AgregarActivoModal = AgregarActivoModal;

/* ---------- AGREGAR DESCARTABLE ---------- */
function AgregarDescartableModal({ onClose }) {
  const { addDescartable, toast } = window.useStore();
  const [nombre, setNombre] = _iS("");
  const [precio, setPrecio] = _iS("");
  const [stock, setStock] = _iS("");
  const [min, setMin] = _iS("");
  const guardar = () => {
    if (!nombre.trim() || precio === "") return toast("Completa nombre y precio", "warn");
    addDescartable({ nombre: nombre.trim(), precio, stock, min }); onClose();
  };
  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(420px,96vw)" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Empaques para llevar"),
          React.createElement("h2", { style: { margin: "0 0 16px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 } }, "Agregar descartable"),
          React.createElement("label", { className: "field", style: { marginBottom: 12 } }, React.createElement("span", { className: "field__label" }, "Nombre"),
            React.createElement("input", { className: "input", placeholder: "Ej: Tápper chico, Sorbete", value: nombre, onChange: e => setNombre(e.target.value) })),
          React.createElement("label", { className: "field", style: { marginBottom: 12 } }, React.createElement("span", { className: "field__label" }, "Precio (S/)"),
            React.createElement("input", { className: "input", type: "number", step: "0.1", placeholder: "0.00", value: precio, onChange: e => setPrecio(e.target.value) })),
          React.createElement("div", { className: "row gap10", style: { marginBottom: 18 } },
            React.createElement("label", { className: "field", style: { flex: 1 } }, React.createElement("span", { className: "field__label" }, "Stock inicial"),
              React.createElement("input", { className: "input", type: "number", placeholder: "0", value: stock, onChange: e => setStock(e.target.value) })),
            React.createElement("label", { className: "field", style: { flex: 1 } }, React.createElement("span", { className: "field__label" }, "Stock mínimo"),
              React.createElement("input", { className: "input", type: "number", placeholder: "0", value: min, onChange: e => setMin(e.target.value) }))),
          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", onClick: guardar }, React.createElement(window.Icon, { name: "check" }), "Agregar descartable"))))
  );
}
window.AgregarDescartableModal = AgregarDescartableModal;

/* ---------- AGREGAR PRODUCTO (Carta) ---------- */
function AgregarProductoModal({ onClose }) {
  const { addProducto, toast } = window.useStore();
  const [nombre, setNombre] = _iS("");
  const [cat, setCat] = _iS("comida");
  const [precio, setPrecio] = _iS("");
  const guardar = () => {
    if (!nombre.trim()) return toast("Escribe el nombre del producto", "warn");
    if (!precio || parseFloat(precio) <= 0) return toast("Indica un precio de venta válido", "warn");
    addProducto({ nombre: nombre.trim(), cat, precio });
    onClose();
  };
  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(440px,96vw)" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Carta · platos y bebidas"),
          React.createElement("h2", { style: { margin: "0 0 16px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 } }, "Agregar producto"),
          React.createElement("label", { className: "field", style: { marginBottom: 12 } }, React.createElement("span", { className: "field__label" }, "Nombre del producto"),
            React.createElement("input", { className: "input", placeholder: "Ej: Ceviche clásico", value: nombre, onChange: e => setNombre(e.target.value) })),
          React.createElement("div", { className: "field", style: { marginBottom: 12 } }, React.createElement("span", { className: "field__label" }, "Categoría"),
            React.createElement("div", { className: "seg", style: { width: "100%" } },
              [["comida", "Comida", "utensils"], ["bebida", "Bebida", "coffee"]].map(([k, l, ic]) =>
                React.createElement("button", { key: k, type: "button", className: cat === k ? "is-active" : "", style: { flex: 1 }, onClick: () => setCat(k) },
                  React.createElement(window.Icon, { name: ic }), l)))),
          React.createElement("label", { className: "field", style: { marginBottom: 18 } }, React.createElement("span", { className: "field__label" }, "Precio de venta (S/)"),
            React.createElement("input", { className: "input", type: "number", min: "0", step: "0.5", placeholder: "0.00", value: precio, onChange: e => setPrecio(e.target.value) })),
          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", onClick: guardar }, React.createElement(window.Icon, { name: "check" }), "Guardar producto"))))
  );
}
window.AgregarProductoModal = AgregarProductoModal;

/* ---------- EDITOR DE RECETA (Carta) ---------- */
function RecetaModal({ producto, onClose }) {
  const { insumos, insumoById, setReceta, costoProducto } = window.useStore();
  const [receta, setRec] = _iS(() => producto.receta.map(r => [...r]));
  const [q, setQ] = _iS("");
  const enReceta = new Set(receta.map(r => r[0]));
  const disponibles = insumos.filter(i => !enReceta.has(i.id) && (!q || i.nombre.toLowerCase().includes(q.toLowerCase())));

  const setCant = (id, v) => setRec(rs => rs.map(r => r[0] === id ? [id, parseFloat(v) || 0] : r));
  const quitar = (id) => setRec(rs => rs.filter(r => r[0] !== id));
  const agregar = (id) => { setRec(rs => [...rs, [id, 0.1]]); setQ(""); };
  const costoEstimado = receta.reduce((s, [id, c]) => s + ((insumoById[id]?.costo || 0) * c), 0);

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(560px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "kicker" }, "Receta · " + producto.sub),
          React.createElement("h2", { style: { margin: "0 0 4px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700 } }, producto.nombre),
          React.createElement("p", { className: "t2", style: { marginTop: 0, marginBottom: 16, fontSize: 13 } }, "Asigna los insumos y cantidades exactas que se descontarán automáticamente al vender este plato."),

          React.createElement("div", { className: "field__label" }, "Insumos de la receta"),
          receta.length === 0
            ? React.createElement("div", { className: "empty", style: { padding: "20px" } }, React.createElement(window.Icon, { name: "utensils" }), "Sin insumos asignados aún")
            : React.createElement("div", { style: { marginBottom: 14 } }, receta.map(([id, cant]) => {
                const ins = insumoById[id];
                return React.createElement("div", { key: id, className: "line", style: { gap: 10 } },
                  React.createElement("div", { className: "line__name" }, ins ? ins.nombre : id, React.createElement("span", null, "Costo " + window.money((ins?.costo || 0) * cant))),
                  React.createElement("input", { className: "input", type: "number", step: "0.01", value: cant, onChange: e => setCant(id, e.target.value), style: { width: 90, height: 34 } }),
                  React.createElement("span", { className: "t3", style: { width: 28, fontSize: 12 } }, ins ? ins.unidad : ""),
                  React.createElement("button", { className: "iconbtn", style: { width: 30, height: 30 }, onClick: () => quitar(id) }, React.createElement(window.Icon, { name: "trash", style: { width: 15, height: 15 } })));
              })),

          React.createElement("div", { className: "field__label" }, "Agregar insumo"),
          React.createElement("div", { className: "search", style: { marginBottom: 8 } }, React.createElement(window.Icon, { name: "search" }),
            React.createElement("input", { className: "input", placeholder: "Buscar insumo…", value: q, onChange: e => setQ(e.target.value) })),
          React.createElement("div", { className: "row gap6 wrap", style: { marginBottom: 18, maxHeight: 110, overflowY: "auto" } },
            disponibles.slice(0, 12).map(i => React.createElement("button", { key: i.id, className: "chip", onClick: () => agregar(i.id) },
              React.createElement(window.Icon, { name: "plus", style: { width: 13, height: 13 } }), i.nombre))),

          React.createElement("div", { className: "card", style: { padding: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", { className: "t2", style: { fontSize: 13 } }, "Costo estimado del plato"),
            React.createElement("b", { className: "num", style: { fontSize: 17 } }, window.money(costoEstimado))),
          React.createElement("button", { className: "btn btn--accent btn--lg btn--block", onClick: () => { setReceta(producto.id, receta.filter(r => r[1] > 0)); onClose(); } },
            React.createElement(window.Icon, { name: "check" }), "Guardar receta"))))
  );
}
window.RecetaModal = RecetaModal;
