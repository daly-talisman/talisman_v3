/* ============================================================
   TALISMÁN — Root app (routing + ensamblaje)
   ============================================================ */
function Shell() {
  const { view, usuario, drawerMesa, payMesa } = window.useStore();
  const VIEWS = {
    inicio: window.Dashboard,
    mesas: window.MesasView,
    cierre: window.CierreView,
    carta: window.CartaView,
    inventario: window.Inventario,
    caja: window.Caja,
    personal: window.Personal,
    stats: window.Estadisticas,
    datos: window.Datos,
    config: window.ConfigView,
  };

  // Sin sesión => pantalla de bienvenida / login
  if (!usuario) return React.createElement(window.Login);

  // ----- Rol MOZO: experiencia tablet ligera (solo Mesas + Carta) -----
  const esMozo = usuario.rol === "Mozo";
  if (esMozo) {
    const MAP = { carta: window.CartaView, cierre: window.CierreView, mesas: window.MesasView };
    const mv = MAP[view] ? view : "mesas";
    const MV = MAP[mv];
    return React.createElement(window.TabletShell, null,
      React.createElement(MV, { key: mv }),
      drawerMesa && React.createElement(window.ComandaDrawer),
      payMesa && React.createElement(window.CobroModal),
      React.createElement(window.Toasts));
  }

  const Current = VIEWS[view] || window.Dashboard;
  return React.createElement("div", { className: "app" },
    React.createElement(window.Header),
    React.createElement("div", { className: "body" },
      React.createElement(window.Sidebar),
      React.createElement("main", { className: "main" },
        React.createElement(Current, { key: view }))),
    drawerMesa && React.createElement(window.ComandaDrawer),
    payMesa && React.createElement(window.CobroModal),
    React.createElement(window.Toasts)
  );
}

function App() {
  return React.createElement(window.StoreProvider, null, React.createElement(Shell));
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
