/* ============================================================
   TALISMÁN — Vista CONFIGURACIÓN general del sistema
   ============================================================ */
function Toggle({ on, onChange }) {
  return React.createElement("button", {
    className: "switch" + (on ? " is-on" : ""), role: "switch", "aria-checked": on,
    onClick: () => onChange(!on)
  }, React.createElement("span", { className: "switch__knob" }));
}
window.Toggle = Toggle;

function ConfigRow({ title, desc, control }) {
  return React.createElement("div", { className: "cfg-row" },
    React.createElement("div", { style: { flex: 1 } },
      React.createElement("div", { className: "cfg-row__title" }, title),
      desc && React.createElement("div", { className: "cfg-row__desc" }, desc)),
    React.createElement("div", { className: "cfg-row__ctrl" }, control));
}

/* ---------- Gestión de usuarios y accesos (solo admin) ---------- */
function UsuariosCard({ usuarios, addUsuario, removeUsuario, usuario, toast }) {
  const ROLES = ["Administradora", "Mozo", "Cajero", "Chef"];
  const accesoDe = (rol) => rol === "Administradora" ? "Acceso total" : rol === "Mozo" ? "Mesas y comandas (tablet)" : rol === "Cajero" ? "Caja y mesas" : "Cocina e inventario";
  const vacio = { nombre: "", rol: "Mozo", pin: "", email: "" };
  const [form, setForm] = React.useState(vacio);
  const [abrir, setAbrir] = React.useState(false);
  const [borrar, setBorrar] = React.useState(null); // usuario a confirmar eliminación
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const crear = () => {
    const nombre = form.nombre.trim();
    if (nombre.length < 3) { toast("Escribe el nombre completo", "warn"); return; }
    if (!/^\d{4}$/.test(form.pin)) { toast("La clave debe tener 4 dígitos", "warn"); return; }
    addUsuario({ nombre, rol: form.rol, pin: form.pin, email: form.email.trim(), acceso: accesoDe(form.rol) });
    toast("Usuario creado · " + nombre);
    setForm(vacio); setAbrir(false);
  };

  const badgeKind = (rol) => rol === "Administradora" ? "busy" : rol === "Mozo" ? "resv" : "muted";

  return React.createElement("div", { className: "card card-pad fade-up", style: { marginBottom: 16 } },
    React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center", marginBottom: 4 } },
      React.createElement("h3", { className: "cfg-sec", style: { margin: 0 } }, React.createElement(window.Icon, { name: "personal" }), "Usuarios y accesos"),
      React.createElement("button", { className: "btn btn--accent btn--sm", onClick: () => setAbrir(a => !a) },
        React.createElement(window.Icon, { name: abrir ? "x" : "plus", style: { width: 15, height: 15 } }), abrir ? "Cancelar" : "Nuevo usuario")),
    React.createElement("p", { className: "cfg-row__desc", style: { marginBottom: 14 } }, "El administrador ve todo. El mozo entra con su clave a una vista de tablet con solo Mesas y Carta."),

    /* Formulario de alta */
    abrir && React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 16, background: "var(--surface)" } },
      React.createElement("div", { style: { display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" } },
        React.createElement("label", { className: "field", style: { gridColumn: "1 / -1" } }, React.createElement("span", { className: "field__label" }, "Nombre completo"),
          React.createElement("input", { className: "input", value: form.nombre, placeholder: "Ej. Ana Torres", onChange: e => set("nombre", e.target.value) })),
        React.createElement("label", { className: "field" }, React.createElement("span", { className: "field__label" }, "Cargo"),
          React.createElement("select", { className: "select", value: form.rol, onChange: e => set("rol", e.target.value) },
            ROLES.map(r => React.createElement("option", { key: r, value: r }, r)))),
        React.createElement("label", { className: "field" }, React.createElement("span", { className: "field__label" }, "Clave (4 dígitos)"),
          React.createElement("input", { className: "input num", value: form.pin, inputMode: "numeric", maxLength: 4, placeholder: "••••",
            onChange: e => set("pin", e.target.value.replace(/\D/g, "").slice(0, 4)) })),
        React.createElement("label", { className: "field", style: { gridColumn: "1 / -1" } }, React.createElement("span", { className: "field__label" }, "Correo (opcional)"),
          React.createElement("input", { className: "input", value: form.email, type: "email", placeholder: "nombre@talisman.pe", onChange: e => set("email", e.target.value) }))),
      React.createElement("div", { className: "row", style: { justifyContent: "flex-end", marginTop: 12 } },
        React.createElement("span", { className: "t3", style: { fontSize: 11.5, flex: 1, alignSelf: "center" } }, "Acceso: " + accesoDe(form.rol)),
        React.createElement("button", { className: "btn btn--accent btn--sm", onClick: crear }, React.createElement(window.Icon, { name: "check", style: { width: 15, height: 15 } }), "Crear usuario"))),

    /* Lista de usuarios */
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
      usuarios.map(u => React.createElement("div", { key: u.id, className: "row", style: { justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" } },
        React.createElement("div", { className: "row gap12", style: { alignItems: "center" } },
          React.createElement("div", { className: "avatar", style: { width: 38, height: 38, borderRadius: 11 } }, u.iniciales),
          React.createElement("div", null,
            React.createElement("div", { style: { fontWeight: 600, fontSize: 14 } }, u.nombre, u.id === usuario.id && React.createElement("span", { className: "t3", style: { fontSize: 11, marginLeft: 8 } }, "(tú)")),
            React.createElement("div", { className: "t3", style: { fontSize: 12 } }, u.acceso))),
        React.createElement("div", { className: "row gap8", style: { alignItems: "center" } },
          React.createElement("span", { className: "badge badge--" + badgeKind(u.rol) }, u.rol),
          React.createElement("span", { className: "t3 num", style: { fontSize: 12, letterSpacing: ".1em", opacity: .55 } }, "PIN " + (u.pin || "—")),
          React.createElement("button", { className: "iconbtn", title: "Eliminar usuario", disabled: u.id === usuario.id,
            style: u.id === usuario.id ? { opacity: .3, cursor: "not-allowed" } : { color: "var(--danger)" },
            onClick: () => u.id !== usuario.id && setBorrar(u) }, React.createElement(window.Icon, { name: "trash", style: { width: 17, height: 17 } })))))),

    /* Confirmar eliminación */
    borrar && ReactDOM.createPortal(React.createElement(React.Fragment, null,
      React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: () => setBorrar(null) }),
      React.createElement("div", { className: "modal-wrap" },
        React.createElement("div", { className: "modal", style: { width: "min(380px,96vw)" } },
          React.createElement("div", { className: "modal__pad" },
            React.createElement("h2", { style: { margin: "0 0 6px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, fontWeight: 700 } }, "Eliminar usuario"),
            React.createElement("p", { className: "t2", style: { margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.5 } }, "¿Eliminar a “" + borrar.nombre + "”? No podrá volver a iniciar sesión."),
            React.createElement("div", { className: "row gap8" },
              React.createElement("button", { className: "btn btn--ghost", style: { flex: 1 }, onClick: () => setBorrar(null) }, "Cancelar"),
              React.createElement("button", { className: "btn btn--danger", style: { flex: 1 }, onClick: () => { removeUsuario(borrar.id); toast("Usuario eliminado · " + borrar.nombre); setBorrar(null); } }, "Sí, eliminar"))))))
    , document.body));
}

function ConfigView() {
  const { theme, setTheme, toast, D, usuario, usuarios, addUsuario, removeUsuario } = window.useStore();
  const [cfg, setCfg] = React.useState({
    negocio: "Talismán Cevichería · Restobar",
    moneda: "PEN",
    igv: "18",
    alertaStock: true,
    alertaMesas: true,
    sonidos: false,
    autoCobro: false,
    impresion: true,
    direccion: "Av. del Mar 1234, Lima",
    ruc: "20123456789",
  });
  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  return React.createElement("div", { className: "view", style: { maxWidth: 920 } },
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, "Sistema"),
        React.createElement("h1", { className: "page-title" }, "Configuración"),
        React.createElement("p", { className: "page-sub" }, "Ajustes generales del sistema. Se guardarán en la base de datos en una fase futura.")),
      React.createElement("button", { className: "btn btn--accent", onClick: () => toast("Configuración guardada") },
        React.createElement(window.Icon, { name: "check" }), "Guardar cambios")),

    /* Negocio */
    React.createElement("div", { className: "card card-pad fade-up", style: { marginBottom: 16 } },
      React.createElement("h3", { className: "cfg-sec" }, React.createElement(window.Icon, { name: "receipt" }), "Datos del negocio"),
      React.createElement("div", { style: { display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" } },
        React.createElement("label", { className: "field" }, React.createElement("span", { className: "field__label" }, "Nombre comercial"),
          React.createElement("input", { className: "input", value: cfg.negocio, onChange: e => set("negocio", e.target.value) })),
        React.createElement("label", { className: "field" }, React.createElement("span", { className: "field__label" }, "RUC"),
          React.createElement("input", { className: "input", value: cfg.ruc, onChange: e => set("ruc", e.target.value) })),
        React.createElement("label", { className: "field", style: { gridColumn: "1 / -1" } }, React.createElement("span", { className: "field__label" }, "Dirección"),
          React.createElement("input", { className: "input", value: cfg.direccion, onChange: e => set("direccion", e.target.value) })),
        React.createElement("label", { className: "field" }, React.createElement("span", { className: "field__label" }, "Moneda"),
          React.createElement("select", { className: "select", value: cfg.moneda, onChange: e => set("moneda", e.target.value) },
            React.createElement("option", { value: "PEN" }, "Sol peruano (S/)"),
            React.createElement("option", { value: "USD" }, "Dólar (US$)"))),
        React.createElement("label", { className: "field" }, React.createElement("span", { className: "field__label" }, "IGV (%)"),
          React.createElement("input", { className: "input", type: "number", value: cfg.igv, onChange: e => set("igv", e.target.value) })))),

    /* Usuarios y accesos (solo administrador) */
    usuario && usuario.rol === "Administradora" && React.createElement(UsuariosCard, { usuarios: usuarios, addUsuario: addUsuario, removeUsuario: removeUsuario, usuario: usuario, toast: toast }),

    /* Apariencia */
    React.createElement("div", { className: "card card-pad fade-up", style: { marginBottom: 16 } },
      React.createElement("h3", { className: "cfg-sec" }, React.createElement(window.Icon, { name: theme === "dark" ? "moon" : "sun" }), "Apariencia"),
      React.createElement(ConfigRow, { title: "Tema oscuro", desc: "Interfaz en azul oscuro (recomendado para el salón).", control: React.createElement(Toggle, { on: theme === "dark", onChange: v => setTheme(v ? "dark" : "light") }) })),

    /* Notificaciones */
    React.createElement("div", { className: "card card-pad fade-up", style: { marginBottom: 16 } },
      React.createElement("h3", { className: "cfg-sec" }, React.createElement(window.Icon, { name: "bell" }), "Notificaciones y operación"),
      React.createElement(ConfigRow, { title: "Alertas de stock bajo", desc: "Avisar cuando un insumo cae bajo su mínimo.", control: React.createElement(Toggle, { on: cfg.alertaStock, onChange: v => set("alertaStock", v) }) }),
      React.createElement("div", { className: "cfg-sep" }),
      React.createElement(ConfigRow, { title: "Alertas de mesas esperando", desc: "Avisar cuando una mesa pide la cuenta.", control: React.createElement(Toggle, { on: cfg.alertaMesas, onChange: v => set("alertaMesas", v) }) }),
      React.createElement("div", { className: "cfg-sep" }),
      React.createElement(ConfigRow, { title: "Sonidos del sistema", desc: "Reproducir un sonido en cada nueva alerta.", control: React.createElement(Toggle, { on: cfg.sonidos, onChange: v => set("sonidos", v) }) }),
      React.createElement("div", { className: "cfg-sep" }),
      React.createElement(ConfigRow, { title: "Impresión automática de comanda", desc: "Enviar a cocina al confirmar cada pedido.", control: React.createElement(Toggle, { on: cfg.impresion, onChange: v => set("impresion", v) }) })),

    React.createElement("p", { className: "t3", style: { fontSize: 12, display: "flex", gap: 8, alignItems: "center" } },
      React.createElement(window.Icon, { name: "key", style: { width: 15, height: 15, color: "var(--accent)" } }),
      "Estos ajustes están preparados en la interfaz; la persistencia en Supabase se conectará en una fase futura."));
}
window.ConfigView = ConfigView;
