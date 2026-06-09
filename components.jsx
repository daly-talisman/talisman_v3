/* ============================================================
   TALISMÁN — Componentes compartidos (shell + primitivas)
   ============================================================ */
const { useStore: _useStore } = window;

/* ---------- Icon set (line, 24px) ---------- */
const ICONS = {
  inicio:   "M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10",
  mesas:    "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  inventario:"M3.3 7 12 3l8.7 4-8.7 4zM3.3 7v10l8.7 4 8.7-4V7M12 11v10",
  caja:     "M3 7h18v12H3zM3 10h18M16 14h2",
  personal: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20a6.5 6.5 0 0 1 13 0M17 11a3 3 0 1 0-1.5-5.6M21.5 20a6 6 0 0 0-5-5.9",
  stats:    "M4 20V10M10 20V4M16 20v-7M22 20H2",
  datos:    "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  bell:     "M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM9.5 19a2.5 2.5 0 0 0 5 0",
  search:   "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-5-5",
  plus:     "M12 5v14M5 12h14",
  minus:    "M5 12h14",
  chevR:    "M9 6l6 6-6 6",
  chevD:    "M6 9l6 6 6-6",
  up:       "M12 19V5M6 11l6-6 6 6",
  down:     "M12 5v14M6 13l6 6 6-6",
  x:        "M6 6l12 12M18 6 6 18",
  check:    "M5 12l4.5 4.5L19 6",
  trash:    "M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13",
  clock:    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  user:     "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0",
  sun:      "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v3M12 20v3M4 12H1M23 12h-3M5 5 3 3M21 21l-2-2M19 5l2-2M3 21l2-2",
  moon:     "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z",
  receipt:  "M5 3v18l2-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4V3l-2 1.4L14 3l-2 1.4L10 3 8 4.4 6 3ZM8.5 8h7M8.5 12h7M8.5 16h4",
  image:    "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M8.5 9.5a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0Z",
  card:     "M3 6h18v12H3zM3 10h18M7 15h3",
  cash:     "M3 7h18v10H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 9.5v.01M18 14.5v.01",
  phone:    "M7 3h10v18H7zM10 18h4",
  flame:    "M12 22a6 6 0 0 0 6-6c0-3-2-4.5-2.8-7.5C13.5 11 12.4 9 12 4 9 7 6 10 6 16a6 6 0 0 0 6 6Z",
  alert:    "M12 9v4m0 4h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  grid:     "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  map:      "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14",
  list:     "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  utensils: "M5 3v7a2 2 0 0 0 4 0V3M7 11v10M16 3c-1.5 0-3 2-3 5s1.5 4 3 4v9",
  coffee:   "M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h2a2 2 0 0 1 0 5h-2M7 4V2M11 4V2M15 4V2",
  layers:   "M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5",
  edit:     "M4 20h4L19 9a2 2 0 0 0-3-3L5 17v3ZM14 6l3 3",
  dollar:   "M12 2v20M17 6.5C17 4.6 14.8 4 12 4S7 4.8 7 7s2.5 2.7 5 3 5 1 5 3.2-2.2 3-5 3-5-1-5-3",
  key:      "M14 7a4 4 0 1 1-3.5 6L4 19.5V21H6v-1.5h1.5V18H9l1.5-1.5A4 4 0 0 1 14 7Z",
  link:     "M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1",
  filter:   "M3 5h18l-7 8v6l-4-2v-4z",
  logout:   "M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3",
  star:     "M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z",
  box:      "M3.3 7 12 3l8.7 4-8.7 4zM3.3 7v10l8.7 4 8.7-4V7M12 11v10",
  hourglass:"M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9",
  yape:     "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12l3 3 5-6",
  cierre:   "M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1ZM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6ZM9.5 12l1.8 1.8L15 10",
};

function Icon({ name, style }) {
  const d = ICONS[name] || ICONS.box;
  return React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", style },
    React.createElement("path", { d }));
}
window.Icon = Icon;

/* ---------- Status helpers ---------- */
const ESTADO = {
  libre:     { label: "Libre",     cls: "ok",   dotCls: "s-libre" },
  ocupada:   { label: "Ocupada",   cls: "busy", dotCls: "s-ocupada" },
  reservada: { label: "Reservada", cls: "resv", dotCls: "s-reservada" },
  cuenta:    { label: "Pide cuenta", cls: "warn", dotCls: "s-cuenta" },
};
window.ESTADO = ESTADO;

function Badge({ kind, children }) {
  return React.createElement("span", { className: "badge badge--" + kind },
    React.createElement("i", { className: "dot" }), children);
}
window.Badge = Badge;

/* ---------- NAV config ---------- */
const NAV = [
  { id: "inicio",     label: "Inicio",        icon: "inicio" },
  { id: "mesas",      label: "Mesas",         icon: "mesas" },
  { id: "cierre",     label: "Cierre",        icon: "cierre" },
  { id: "carta",      label: "Carta",         icon: "utensils" },
  { id: "inventario", label: "Inventario",    icon: "inventario" },
  { id: "caja",       label: "Caja",          icon: "caja" },
  { id: "personal",   label: "Personal",      icon: "personal" },
  { id: "stats",      label: "Estadísticas",  icon: "stats" },
];
window.NAV = NAV;

/* ---------- HEADER ---------- */
function Header() {
  const { view, setView, theme, setTheme, D, usuario, logout, mesas, mesasEsperando, alertasInsumos } = _useStore();
  const alertCount = mesasEsperando.length + alertasInsumos.length;
  const [open, setOpen] = React.useState(null); // 'notif' | 'menu' | null
  const [acct, setAcct] = React.useState(null); // 'perfil' | 'cambiar' | null
  const toggle = (k) => setOpen(o => o === k ? null : k);

  // Construir notificaciones del sistema desde el estado real
  const demorados = mesas.filter(m => m.estado === "ocupada" && m.minAbierta >= 60);
  const notifs = [
    ...mesasEsperando.map((m, i) => ({
      id: "n-cuenta-" + m.id, ic: "hourglass", tone: "warn",
      title: "Mesa " + m.num + " espera la cuenta",
      desc: m.zona + " · " + window.fmtMin(m.minAbierta) + " activa", time: "hace " + (3 + i * 4) + " min"
    })),
    ...alertasInsumos.map((it, i) => ({
      id: "n-ins-" + it.id, ic: "box", tone: "danger",
      title: "Insumo bajo: " + it.nombre,
      desc: "Quedan " + it.stock + " " + it.unidad + " · mínimo " + it.min + " " + it.unidad, time: "hace " + (8 + i * 6) + " min"
    })),
    ...demorados.map((m, i) => ({
      id: "n-dem-" + m.id, ic: "clock", tone: "accent",
      title: "Pedido demorado · Mesa " + m.num,
      desc: m.zona + " lleva " + window.fmtMin(m.minAbierta) + " sin cerrar", time: "hace " + (12 + i * 5) + " min"
    })),
  ];

  const menuItems = [
    { ic: "user",   label: "Ver perfil",      act: () => setAcct("perfil") },
    { ic: "personal", label: "Cambiar usuario", act: () => setAcct("cambiar") },
    { ic: "datos",  label: "Configuración",    act: () => setView("config") },
    { ic: "logout", label: "Cerrar sesión", danger: true, sep: true, act: () => logout() },
  ];

  return React.createElement("header", { className: "hdr" },
    React.createElement("div", { className: "hdr__brand" },
      React.createElement("div", { className: "hdr__logo" }),
      React.createElement("div", null,
        React.createElement("div", { className: "hdr__name" }, "TALIS", React.createElement("b", null, "MÁN")),
        React.createElement("div", { className: "hdr__tag" }, "Cevichería · Restobar")
      )
    ),
    React.createElement("nav", { className: "hdr__nav" },
      NAV.map(n => React.createElement("button", {
        key: n.id, className: "hdr__navlink" + (view === n.id ? " is-active" : ""),
        onClick: () => setView(n.id)
      }, React.createElement(Icon, { name: n.icon }), n.label))
    ),
    React.createElement("div", { className: "hdr__right" },
      React.createElement("button", { className: "iconbtn", title: "Cambiar tema", onClick: () => setTheme(theme === "dark" ? "light" : "dark") },
        React.createElement(Icon, { name: theme === "dark" ? "sun" : "moon" })),

      // ----- Notificaciones -----
      React.createElement("div", { className: "hdr__pop-anchor" },
        React.createElement("button", { className: "iconbtn", title: "Alertas", onClick: () => toggle("notif") },
          React.createElement(Icon, { name: "bell" }),
          alertCount > 0 && React.createElement("span", { className: "iconbtn__dot" })),
        open === "notif" && React.createElement("div", { className: "pop pop--notif" },
          React.createElement("div", { className: "pop__head" },
            React.createElement("h4", null, "Notificaciones"),
            React.createElement("span", { className: "badge badge--" + (alertCount ? "warn" : "muted") }, alertCount + " nuevas")),
          React.createElement("div", { className: "pop__list" },
            notifs.length === 0
              ? React.createElement("div", { className: "empty", style: { padding: "30px 20px" } }, React.createElement(Icon, { name: "check" }), "Sin alertas pendientes")
              : notifs.map(n => React.createElement("button", { key: n.id, className: "notif", onClick: () => { setOpen(null); if (n.ic === "box") setView("inventario"); else setView("mesas"); } },
                  React.createElement("span", { className: "notif__ic " + n.tone }, React.createElement(Icon, { name: n.ic })),
                  React.createElement("div", { className: "notif__body" },
                    React.createElement("div", { className: "notif__title" }, n.title),
                    React.createElement("div", { className: "notif__desc" }, n.desc),
                    React.createElement("div", { className: "notif__time" }, n.time))))))),

      // ----- Usuario -----
      React.createElement("div", { className: "hdr__pop-anchor" },
        React.createElement("button", { className: "hdr__user", onClick: () => toggle("menu") },
          React.createElement("div", { className: "hdr__user-meta" },
            React.createElement("div", { className: "hdr__user-name" }, usuario.nombre),
            React.createElement("div", { className: "hdr__user-role" }, usuario.rol)),
          React.createElement("div", { className: "avatar" }, usuario.iniciales)),
        open === "menu" && React.createElement("div", { className: "pop pop--menu" },
          React.createElement("div", { className: "menu__user" },
            React.createElement("div", { className: "avatar" }, usuario.iniciales),
            React.createElement("div", null,
              React.createElement("div", { className: "hdr__user-name" }, usuario.nombre),
              React.createElement("div", { className: "hdr__user-role" }, usuario.rol))),
          menuItems.map((m, i) => React.createElement(React.Fragment, { key: i },
            m.sep && React.createElement("div", { className: "menu__sep" }),
            React.createElement("button", { className: "menu__item" + (m.danger ? " danger" : ""), onClick: () => { setOpen(null); m.act && m.act(); } },
              React.createElement(Icon, { name: m.ic }), m.label))))),

      // ----- Backdrop para cerrar -----
      open && React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 55 }, onClick: () => setOpen(null) }),

      // ----- Modales de cuenta -----
      acct === "perfil" && React.createElement(window.PerfilModal, { onClose: () => setAcct(null) }),
      acct === "cambiar" && React.createElement(window.CambiarUsuarioModal, { onClose: () => setAcct(null) })
    )
  );
}
window.Header = Header;

/* ---------- SIDEBAR ---------- */
function Sidebar() {
  const { view, setView } = _useStore();
  return React.createElement("aside", { className: "side" },
    React.createElement("div", { className: "side__group" },
      React.createElement("div", { className: "side__label" }, "Módulos"),
      NAV.map(n => React.createElement("button", {
        key: n.id, className: "side__item" + (view === n.id ? " is-active" : ""),
        onClick: () => setView(n.id)
      }, React.createElement(Icon, { name: n.icon }), React.createElement("span", null, n.label)))
    ),
    React.createElement("div", { className: "side__spacer" }),
    React.createElement("div", { className: "side__group" },
      React.createElement("button", {
        className: "side__item" + (view === "datos" ? " is-active" : ""),
        onClick: () => setView("datos")
      }, React.createElement(Icon, { name: "datos" }), React.createElement("span", null, "Modelo de datos"))
    ),
    React.createElement("div", { className: "side__hint" }, "◂ Pasa el mouse para expandir")
  );
}
window.Sidebar = Sidebar;

/* ---------- SHELL LIGERO PARA TABLET (rol Mozo) ----------
   Solo Mesas + Carta. Sin dashboard, notificaciones ni sidebar:
   menos cómputo y render para que la tablet vaya fluida. */
function TabletShell({ children }) {
  const { view, setView, usuario, logout } = _useStore();
  const tabs = [
    { id: "mesas", label: "Mesas", icon: "mesas" },
    { id: "cierre", label: "Mi cierre", icon: "cierre" },
    { id: "carta", label: "Carta", icon: "utensils" },
  ];
  return React.createElement("div", { className: "tablet" },
    React.createElement("header", { className: "tablet__bar" },
      React.createElement("div", { className: "hdr__brand" },
        React.createElement("div", { className: "hdr__logo" }),
        React.createElement("div", null,
          React.createElement("div", { className: "hdr__name", style: { fontSize: 17 } }, "TALIS", React.createElement("b", null, "MÁN")),
          React.createElement("div", { className: "hdr__tag" }, "Modo mozo"))),
      React.createElement("nav", { className: "tablet__nav" },
        tabs.map(t => React.createElement("button", {
          key: t.id, className: "tablet__tab" + (view === t.id ? " is-active" : ""), onClick: () => setView(t.id)
        }, React.createElement(Icon, { name: t.icon }), t.label))),
      React.createElement("div", { className: "tablet__user" },
        React.createElement("div", { className: "tablet__user-meta" },
          React.createElement("div", { className: "hdr__user-name" }, usuario.nombre),
          React.createElement("div", { className: "hdr__user-role" }, usuario.rol + " · " + usuario.turno)),
        React.createElement("div", { className: "avatar" }, usuario.iniciales),
        React.createElement("button", { className: "iconbtn", title: "Cerrar sesión", onClick: logout },
          React.createElement(Icon, { name: "logout" })))),
    React.createElement("main", { className: "tablet__main" }, children));
}
window.TabletShell = TabletShell;

/* ---------- TOASTS ---------- */
function Toasts() {
  const { toasts } = _useStore();
  return React.createElement("div", { className: "toast-wrap" },
    toasts.map(t => React.createElement("div", { key: t.id, className: "toast" },
      React.createElement(Icon, { name: t.kind === "warn" ? "alert" : "check",
        style: { color: t.kind === "warn" ? "var(--warn)" : "var(--ok)" } }),
      t.msg))
  );
}
window.Toasts = Toasts;

/* ---------- Sparkline / mini bar chart ---------- */
function Sparkbar({ data, accessor = (d) => d.v, hotIndex }) {
  const max = Math.max(...data.map(accessor), 1);
  return React.createElement("div", { className: "spark" },
    data.map((d, i) => React.createElement("i", {
      key: i, className: hotIndex === i ? "hot" : "",
      style: { height: Math.max(8, (accessor(d) / max) * 100) + "%" },
      title: accessor(d)
    })));
}
window.Sparkbar = Sparkbar;

/* ---------- StatTile ---------- */
function StatTile({ icon, label, value, unit, delta, foot, accent }) {
  return React.createElement("div", { className: "card stat" },
    React.createElement("div", { className: "stat__label" },
      icon && React.createElement(Icon, { name: icon }), label),
    React.createElement("div", { className: "stat__val", style: accent ? { color: "var(--accent)" } : null },
      value, unit && React.createElement("small", null, " " + unit)),
    delta != null && React.createElement("div", { className: "stat__delta " + (delta >= 0 ? "delta-up" : "delta-down") },
      React.createElement(Icon, { name: delta >= 0 ? "up" : "down" }),
      (delta >= 0 ? "+" : "") + delta + "%", foot && React.createElement("span", { className: "stat__foot", style: { marginTop: 0, marginLeft: 4 } }, foot)),
    delta == null && foot && React.createElement("div", { className: "stat__foot" }, foot)
  );
}
window.StatTile = StatTile;
