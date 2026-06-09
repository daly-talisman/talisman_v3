/* ============================================================
   TALISMÁN — Vista CARTA (carta visual · modo tablet / admin)
   Consume los productos de Inventario > Carta (no duplica datos).
   Gestión de imágenes SOLO aquí y SOLO para ADMIN.
   ============================================================ */

/* ¿El producto está AGOTADO? Cálculo AUTOMÁTICO basado en inventario:
   agotado = algún insumo de su receta no tiene stock suficiente.
   Se recalcula solo al cambiar stock / vender / registrar compra
   (deriva de productos+insumos del store). Sin estado manual. */
function _insumosFaltantes(p, insumoById) {
  if (!insumoById || !p.receta || !p.receta.length) return [];
  return p.receta.filter(([id, cant]) => {
    const ins = insumoById[id];
    return ins && (ins.stock || 0) < cant; // necesita más de lo que hay
  }).map(([id]) => insumoById[id]);
}
function _cartaAgotado(p, insumoById) {
  // Embotellado sin receta: agotado si su stock llega a 0
  if (p.stock != null) return p.stock <= 0;
  return _insumosFaltantes(p, insumoById).length > 0;
}

/* ---- Placeholder cuando no hay imagen ---- */
function CartaPlaceholder({ label }) {
  return React.createElement("div", { className: "carta-card__ph" },
    React.createElement(window.Icon, { name: "image", style: { width: 30, height: 30, opacity: .5 } }),
    React.createElement("span", { className: "carta-card__ph-txt" }, label || "sin imagen"));
}

/* ---- Modal: detalles del plato ----
   ADMIN ve todo (precio, tiempo, ganancia, receta, margen).
   MOZO/otros ven la ficha completa (precio, tiempo, receta, disponibilidad
   y estadística) — SOLO se ocultan la ganancia y el margen de ganancia. */
function DetallesPlatoModal({ p, insumoById, esAdmin, stat, onClose }) {
  const { costoProducto } = window.useStore();
  const esBebida = p.cat === "bebida";
  const costo = costoProducto ? costoProducto(p) : 0;
  const ganancia = p.precio - costo;
  const margen = p.precio ? Math.round(ganancia / p.precio * 100) : 0;
  const agotado = _cartaAgotado(p, insumoById);
  const dato = (label, valor, color) => React.createElement("div", { style: { flex: 1 } },
    React.createElement("div", { className: "t3", style: { fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" } }, label),
    React.createElement("div", { style: { fontWeight: 700, fontSize: 16, marginTop: 2, color: color || "var(--text)" } }, valor));
  return ReactDOM.createPortal(React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: { width: "min(460px,96vw)", maxHeight: "92vh", overflowY: "auto" } },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          React.createElement("div", { className: "row gap8", style: { alignItems: "center", marginBottom: 4 } },
            React.createElement(window.Badge, { kind: esBebida ? "resv" : "busy" }, esBebida ? "Bebida" : "Comida"),
            p.sub && React.createElement("span", { className: "t3", style: { fontSize: 12 } }, p.sub),
            agotado && React.createElement(window.Badge, { kind: "danger" }, "Agotado")),
          React.createElement("h2", { style: { margin: "4px 0 16px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 } }, p.nombre),

          /* ----- Bloque numérico: precio + tiempo siempre; 3ª celda según rol ----- */
          React.createElement("div", { className: "card", style: { padding: "13px 15px", marginBottom: 16, display: "flex", gap: 10 } },
            dato("Precio", window.money0(p.precio), "var(--accent)"),
            React.createElement("div", { style: { width: 1, background: "var(--border)" } }),
            dato("Tiempo estimado", p.tiempo ? p.tiempo + " min" : "—"),
            React.createElement("div", { style: { width: 1, background: "var(--border)" } }),
            esAdmin
              ? dato("Ganancia", window.money0(ganancia), ganancia >= 0 ? "var(--ok)" : "var(--danger)")
              : dato("Disponibilidad", agotado ? "Agotado" : "Disponible", agotado ? "var(--danger)" : "var(--ok)")),

          /* ----- Receta / insumos: visible para todos ----- */
          React.createElement(React.Fragment, null,
            React.createElement("div", { className: "field__label", style: { marginBottom: 8 } }, "Receta · insumos que descuenta"),
            (!p.receta || p.receta.length === 0)
              ? React.createElement("div", { className: "t3", style: { fontSize: 13, marginBottom: 4 } }, esBebida ? "Producto embotellado · sin receta de insumos." : "Sin receta asignada.")
              : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
                  p.receta.map(([id, cant]) => {
                    const ins = insumoById[id];
                    const falta = ins && (ins.stock || 0) < cant;
                    return React.createElement("div", { key: id, className: "row", style: { justifyContent: "space-between", alignItems: "center", padding: "8px 11px", borderRadius: 9, background: "var(--surface)", border: "1px solid var(--border)" } },
                      React.createElement("span", { style: { fontSize: 13.5, fontWeight: 500 } }, ins ? ins.nombre : id),
                      React.createElement("span", { className: "num t2", style: { fontSize: 13, color: falta ? "var(--danger)" : "var(--text-2)" } }, cant + (ins ? ins.unidad : "") + (falta ? " · bajo" : "")));
                  })),
            /* Costo + margen: SOLO admin (información de ganancia) */
            (esAdmin && margen) ? React.createElement("div", { className: "t3", style: { fontSize: 12, marginTop: 14 } }, "Costo de receta " + window.money(costo) + " · margen " + margen + "%") : null),

          /* ----- Estadística del plato: se mantiene para todos ----- */
          stat && React.createElement("div", { className: "card", style: { padding: "12px 15px", marginTop: 16, display: "flex", alignItems: "center", gap: 12, background: "var(--accent-soft, var(--surface))" } },
            React.createElement("span", { className: "notif__ic accent", style: { flex: "0 0 auto" } }, React.createElement(window.Icon, { name: "star" })),
            React.createElement("div", { style: { flex: 1 } },
              React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, stat.rank ? "Top #" + stat.rank + " más pedido hoy" : (stat.qty > 0 ? "Pedido " + stat.qty + " vez" + (stat.qty > 1 ? "es" : "") + " hoy" : "Aún sin pedidos hoy")),
              React.createElement("div", { className: "t3", style: { fontSize: 12, marginTop: 2 } }, stat.qty > 0 ? stat.qty + " unidad" + (stat.qty > 1 ? "es" : "") + " vendida" + (stat.qty > 1 ? "s" : "") + " en el día" : "Sé el primero en recomendarlo"))))))
  ), document.body);
}

/* ---- Tarjeta de producto ---- */
function CartaCard({ p, esAdmin, insumoById, stat, onAgregar }) {
  const { updateProducto, toast } = window.useStore();
  const fileRef = React.useRef(null);
  const [detalles, setDetalles] = React.useState(false);
  const agotado = _cartaAgotado(p, insumoById);
  const esBebida = p.cat === "bebida";

  const pedirImagen = () => { if (fileRef.current) { fileRef.current.value = ""; fileRef.current.click(); } };
  const onArchivo = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Solo se permiten imágenes", "warn"); return; }
    if (file.size > 4 * 1024 * 1024) { toast("La imagen supera el máximo de 4 MB", "warn"); return; }
    const reader = new FileReader();
    reader.onload = () => { updateProducto(p.id, { img: reader.result }); toast("Imagen actualizada · " + p.nombre); };
    reader.onerror = () => toast("Error al cargar la imagen, intenta de nuevo", "warn");
    reader.readAsDataURL(file);
  };

  return React.createElement("div", { className: "carta-card" + (agotado ? " is-out" : "") },
    /* ----- Imagen / placeholder ----- */
    React.createElement("div", { className: "carta-card__media" },
      p.img
        ? React.createElement("div", { className: "carta-card__img", style: { backgroundImage: "url(" + p.img + ")" } })
        : React.createElement(CartaPlaceholder, { label: esBebida ? "foto bebida" : "foto plato" }),
      agotado && React.createElement("span", { className: "carta-card__out" }, "Agotado"),
      esAdmin && React.createElement(React.Fragment, null,
        React.createElement("input", { ref: fileRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: onArchivo }),
        React.createElement("button", { className: "carta-card__imgbtn", onClick: pedirImagen },
          React.createElement(window.Icon, { name: p.img ? "edit" : "image", style: { width: 15, height: 15 } }),
          p.img ? "Cambiar imagen" : "Subir imagen"))),

    /* ----- Cuerpo ----- */
    React.createElement("div", { className: "carta-card__body" },
      React.createElement("div", { className: "carta-card__top" },
        React.createElement(window.Badge, { kind: esBebida ? "resv" : "busy" }, esBebida ? "Bebida" : "Comida"),
        React.createElement("span", { className: "carta-card__price num" }, window.money0(p.precio))),
      React.createElement("div", { className: "carta-card__name" }, p.nombre),

      React.createElement("div", { className: "carta-card__foot" },
        React.createElement("button", { className: "btn btn--ghost btn--sm", style: { flex: 1 }, onClick: () => setDetalles(true) },
          React.createElement(window.Icon, { name: "list", style: { width: 15, height: 15 } }), esAdmin ? "Detalles del plato" : "Ver plato")),
      detalles && React.createElement(DetallesPlatoModal, { p: p, insumoById: insumoById, esAdmin: esAdmin, stat: stat, onClose: () => setDetalles(false) })));
}

/* ---- Vista principal ---- */
function CartaView() {
  const { productos, insumoById, topProductos, usuario } = window.useStore();
  const [filtro, setFiltro] = React.useState("todos");

  const esAdmin = usuario && usuario.rol === "Administradora";

  // Carta = productos de Inventario > Carta (sin stock embotellado): comida + bebidas preparadas
  const carta = productos.filter(p => p.stock == null);
  const lista = carta.filter(p => filtro === "todos" || (filtro === "comida" && p.cat === "comida") || (filtro === "bebida" && p.cat === "bebida"));

  const agotadosN = carta.filter(p => _cartaAgotado(p, insumoById)).length;

  // Estadística por plato (vendidos hoy + ranking) — se mantiene visible para todos.
  const statById = React.useMemo(() => {
    const m = {};
    const conVentas = topProductos.filter(p => p.qty > 0);
    topProductos.forEach(p => { m[p.id] = { qty: p.qty || 0, rank: 0 }; });
    conVentas.slice(0, 5).forEach((p, i) => { if (m[p.id]) m[p.id].rank = i + 1; });
    return m;
  }, [topProductos]);

  // Más pedidos HOY: solo productos de Carta, con ventas del día, top 3 por cantidad.
  const masPedidos = topProductos.filter(p => p.stock == null && p.qty > 0).slice(0, 3);

  const filtros = [["todos", "Todos"], ["comida", "Comida"], ["bebida", "Bebida"]];

  return React.createElement("div", { className: "view" },
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, "Carta visual · modo tablet"),
        React.createElement("h1", { className: "page-title" }, "Carta"),
        React.createElement("p", { className: "page-sub" }, esAdmin ? "Los platos y bebidas preparadas de la casa. Las imágenes se gestionan aquí." : "Muéstrasela al cliente. Toca un plato para ver su ficha.")),
      React.createElement("div", { className: "carta-role " + (esAdmin ? "is-admin" : "is-view") },
        React.createElement(window.Icon, { name: esAdmin ? "key" : "user", style: { width: 15, height: 15 } }),
        React.createElement("span", null, esAdmin ? "Administrador · gestión de imágenes" : "Modo cliente · " + (usuario ? usuario.rol : "")))),

    /* Más pedidos hoy */
    masPedidos.length > 0 && React.createElement("div", { className: "carta-top" },
      React.createElement("div", { className: "carta-top__head" },
        React.createElement("span", { className: "carta-top__title" },
          React.createElement(window.Icon, { name: "star" }), "Más pedidos hoy"),
        React.createElement("span", { className: "carta-top__sub" }, "Top del día por cantidad vendida")),
      React.createElement("div", { className: "carta-top__grid" },
        masPedidos.map((p, i) => React.createElement("div", { key: p.id, className: "carta-top__card" + (i === 0 ? " is-1" : "") },
          React.createElement("div", { className: "carta-top__thumb" },
            p.img
              ? React.createElement("div", { className: "carta-top__thumb-img", style: { backgroundImage: "url(" + p.img + ")" } })
              : React.createElement("div", { className: "carta-top__thumb-ph" }, React.createElement(window.Icon, { name: "image", style: { width: 22, height: 22, opacity: .5 } })),
            React.createElement("span", { className: "carta-top__rank" }, i + 1)),
          React.createElement("div", { className: "carta-top__info" },
            React.createElement("div", { className: "carta-top__name" }, p.nombre),
            React.createElement("div", { className: "carta-top__meta" },
              React.createElement("span", { className: "carta-top__price num" }, window.money0(p.precio)),
              React.createElement("span", { className: "carta-top__qty" },
                React.createElement(window.Icon, { name: "check" }), p.qty + " vendido" + (p.qty > 1 ? "s" : ""))))))))
    ,

    /* Filtros */
    React.createElement("div", { className: "row gap6 wrap", style: { marginBottom: 18 } },
      filtros.map(([k, l]) =>
        React.createElement("button", { key: k, className: "chip" + (filtro === k ? " is-active" : ""), onClick: () => setFiltro(k) }, l)),
      agotadosN > 0 && React.createElement("span", { className: "carta-count" }, agotadosN + " agotado" + (agotadosN > 1 ? "s" : ""))),

    /* Grid de tarjetas */
    lista.length === 0
      ? React.createElement("div", { className: "card" }, React.createElement("div", { className: "empty" },
          React.createElement(window.Icon, { name: "utensils" }),
          "No hay productos en esta categoría. Créalos en Inventario › Carta."))
      : React.createElement("div", { className: "carta-grid" },
          lista.map(p => React.createElement(CartaCard, { key: p.id, p: p, esAdmin: esAdmin, insumoById: insumoById, stat: statById[p.id] }))));
}
window.CartaView = CartaView;
