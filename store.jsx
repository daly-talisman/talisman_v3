/* ============================================================
   TALISMÁN — Store central (estado + lógica de negocio)
   Aquí vive la conexión entre módulos:
   comanda → inventario → caja → estadísticas
   ============================================================ */
const { createContext, useContext, useState, useMemo, useCallback, useRef, useEffect } = React;

/* ---------- Helpers de formato ---------- */
const money = (n) => "S/ " + (Math.round(n * 100) / 100).toLocaleString("es-PE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
const money0 = (n) => "S/ " + Math.round(n).toLocaleString("es-PE");
const fmtMin = (m) => m <= 0 ? "—" : (m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`);
window.money = money; window.money0 = money0; window.fmtMin = fmtMin;

/* ---------- Normaliza una mesa cuya comanda quedó vacía ----------
   Si una mesa en servicio (ocupada / pide cuenta) se queda sin productos
   ni descartables, vuelve a estado "libre" (o "reservada" si tenía reserva)
   y se limpian los datos del servicio (comensales, mozo, tiempo, códigos). */
function _normalizarMesaVacia(m) {
  const sinPedido = !m.pedido || m.pedido.length === 0;
  const sinDesc = !m.desc || m.desc.length === 0;
  if (sinPedido && sinDesc && m.estado !== "libre") {
    return {
      ...m,
      estado: m.reserva ? "reservada" : "libre",
      comensales: 0, mozo: null, minAbierta: 0,
      primerEnvioTs: null, comandaNro: null, horaCuenta: null,
    };
  }
  return m;
}

/* ---------- Control de fechas de pago del personal ---------- */
const HOY_STR = "2026-06-06"; // "hoy" del sistema (coherente con el resto de la app)
const _parseFecha = (s) => { const d = new Date((String(s || "").slice(0, 10)) + "T00:00:00"); return isNaN(d) ? null : d; };
const _fmtFecha = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const _sumarPeriodo = (d, frec) => {
  const r = new Date(d);
  if (frec === "semanal") r.setDate(r.getDate() + 7);
  else if (frec === "quincenal") r.setDate(r.getDate() + 15);
  else r.setMonth(r.getMonth() + 1); // mensual (por defecto)
  return r;
};
// Próxima fecha de pago: último pago (o ingreso si nunca se le pagó) + un período según frecuencia
window.proximaFechaPago = (emp) => {
  const base = _parseFecha(emp.ultimoPago) || _parseFecha(emp.ingreso) || _parseFecha(HOY_STR);
  return _fmtFecha(_sumarPeriodo(base, emp.frecuencia || "mensual"));
};
// ¿Ya toca pagar? (hoy alcanzó o pasó la próxima fecha) — los inactivos nunca
window.pagoVence = (emp) => emp && emp.estado !== "inactivo" && window.proximaFechaPago(emp) <= HOY_STR;
// Días que faltan para el próximo pago (negativo = vencido)
window.diasParaPago = (emp) => {
  const prox = _parseFecha(window.proximaFechaPago(emp)); const hoy = _parseFecha(HOY_STR);
  return Math.round((prox - hoy) / 86400000);
};
window.FRECUENCIAS = ["semanal", "quincenal", "mensual"];

const StoreCtx = createContext(null);
const useStore = () => useContext(StoreCtx);
window.useStore = useStore;

function StoreProvider({ children }) {
  const D = window.TAL_DATA;

  const [theme, setTheme]   = useState("dark");
  const [view, setView]     = useState("inicio");
  const [usuario, setUsuario] = useState(null); // null = sesión cerrada (pantalla de login)
  const [usuarios, setUsuarios] = useState(D.usuarios); // editable: alta/baja de usuarios
  const [mesas, setMesas]   = useState(() => [
    // Cada línea de pedido / descartable es [id, qty, enviado, tsEnvio]:
    //   estado_impresion = qty > enviado ? "pendiente" : "enviado".
    // Lo que ya está en una mesa abierta se asume despachado a cocina/barra.
    ...D.mesas.map(m => {
      const ts = (m.minAbierta || 0) > 0 ? Date.now() - m.minAbierta * 60000 : null;
      return {
        ...m, activa: true,
        pedido: m.pedido.map(p => [p[0], p[1], p[1], ts]),
        desc: (m.desc || []).map(d => [d[0], d[1], d[1], ts]),
        primerEnvioTs: m.pedido.length ? ts : null,
        // Código único de comanda por mesa (se reutiliza en cada impresión/agregado).
        comandaNro: m.pedido.length ? ("C-" + String(620 + m.num).padStart(4, "0")) : null,
      };
    }),
    // Orden especial "Para llevar": no aparece en el plano ni en los KPIs.
    { id: "m_llevar", num: 0, llevar: true, zona: "Para llevar", cap: 0, estado: "libre", comensales: 0, mozo: null, minAbierta: 0, pos: { x: 0, y: 0 }, shape: "rect", activa: true, pedido: [], desc: [], primerEnvioTs: null, comandaNro: null },
  ]);
  const [insumos, setInsumos] = useState(() => D.insumos.map(i => ({ ...i })));

  /* ---------- LOG DE CUENTAS POR MOZO (cierre de mesas atendidas) ----------
     Cada vez que un mozo pide la cuenta o el admin cobra una mesa, se registra
     aquí una "cuenta" con el detalle completo (incl. agregados). Sirve para el
     cierre: cuántas mesas atendió cada mesero y el total facturado.
     Se siembra con las mesas que ya están en servicio para tener un resumen real. */
  const nroDeMesa = (m) => "C-" + String(620 + (m.num || 0)).padStart(4, "0");
  const [cuentas, setCuentas] = useState(() => {
    const atendidas = D.mesas
      .filter(m => m.mozo && m.pedido && m.pedido.length)
      .map(m => ({
        id: "cta_" + m.id,
        nro: nroDeMesa(m),
        mesaNum: m.num, zona: m.zona, mozo: m.mozo, comensales: m.comensales,
        ts: Date.now() - (m.minAbierta || 30) * 60000,
        pedido: m.pedido.map(p => [p[0], p[1]]),
        desc: (m.desc || []).map(d => [d[0], d[1]]),
        obs: "",
        estado: m.estado === "cuenta" ? "pendiente" : "abierta",
      }));
    // Algunas cuentas ya cobradas del turno (enriquecen el resumen de cierre)
    const cobradas = atendidas.slice(0, 3).map((c, i) => ({
      ...c, id: c.id + "_cb", nro: "C-0" + (601 + i),
      ts: Date.now() - (150 + i * 35) * 60000, estado: "cobrada",
    }));
    return [...cobradas, ...atendidas];
  });

  // Inserta o actualiza una cuenta por su código (coordina con los tickets).
  const registrarCuenta = useCallback((rec) => {
    setCuentas(cs => {
      const i = cs.findIndex(c => c.nro === rec.nro && c.estado !== "cobrada");
      if (i >= 0) { const n = [...cs]; n[i] = { ...n[i], ...rec }; return n; }
      return [...cs, { id: "cta" + Date.now(), ...rec }];
    });
  }, []);
  const [activos, setActivos] = useState(() => D.activos.map(a => ({ ...a })));
  const [productos, setProductos] = useState(() => D.productos.map(p => ({ ...p })));
  const [descartables, setDescartables] = useState(() => (D.descartables || []).map(d => ({ ...d })));
  const [personal, setPersonal] = useState(() => D.personal.map(p => ({ ...p })));

  // ventas/vendidos del día (semilla = lo ya cerrado antes del turno actual)
  const [vendidos, setVendidos] = useState(() => {
    const v = {}; productos.forEach(p => v[p.id] = p.vendHoy); return v;
  });
  const [ventas, setVentas] = useState(() => D.ventasHoy.map(v => ({ ...v })));

  const [drawerMesa, setDrawerMesa] = useState(null); // id de mesa abierta en comanda
  const [payMesa, setPayMesa]       = useState(null); // id de mesa en cobro
  const [toasts, setToasts]         = useState([]);
  const [tick, setTick]             = useState(0); // refresca cronómetros

  // --- POS: caja, recargo, clientes, cupones, declaraciones ---
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [montoInicial, setMontoInicial] = useState(0);
  const [aperturaHora, setAperturaHora] = useState(null);
  // Egresos de caja (salidas): pagos a personal y adelantos. Restan de efectivo/Yape esperado.
  const [egresos, setEgresos] = useState([]);
  const [recargoPct, setRecargoPct] = useState(5);
  const [recargoOn, setRecargoOn] = useState(true);
  const [clientes, setClientes] = useState(() => D.clientes.map(c => ({ ...c })));
  const [cupones, setCupones]   = useState(() => D.cupones.map(c => ({ ...c })));
  const [declaraciones, setDeclaraciones] = useState(() => [
    { id: "d_seed1", tipo: "Boleta",  cliente: "Carlos Ramírez",          docCliente: "45872103",    monto: 274, fecha: "2026-06-05 14:33", mesa: 1,  estado: "Emitido",   pdf: true },
    { id: "d_seed2", tipo: "Factura", cliente: "Inversiones del Sur SAC",  docCliente: "20512345678", monto: 144, fecha: "2026-06-05 15:28", mesa: 3,  estado: "Emitido",   pdf: true },
    { id: "d_seed3", tipo: "Boleta",  cliente: "Cliente varios",           docCliente: "-",           monto: 56,  fecha: "2026-06-05 15:01", mesa: 11, estado: "Pendiente", pdf: false },
  ]);


  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 60000); return () => clearInterval(t); }, []);
  const usuarioRef = useRef(null);
  useEffect(() => { usuarioRef.current = usuario; }, [usuario]);
  const login = useCallback((u) => { setUsuario(u); setView(u && u.rol === "Mozo" ? "mesas" : "inicio"); }, []);
  const logout = useCallback(() => { setUsuario(null); }, []);
  const cambiarUsuario = useCallback((u) => { setUsuario(u); setView(u && u.rol === "Mozo" ? "mesas" : "inicio"); }, []);

  /* ---------- GESTIÓN DE USUARIOS (alta / baja / edición) ----------
     Solo el administrador la usa desde Configuración. Cada usuario tiene
     una clave (PIN) que se valida en el login. */
  const addUsuario = useCallback((u) => {
    const nuevo = { id: "u" + Date.now(), turno: "Tarde", acceso: u.rol === "Administradora" ? "Acceso total" : "Mesas y comandas",
      iniciales: (u.nombre || "?").trim().split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase() || "US", ...u };
    setUsuarios(us => [...us, nuevo]);
    return nuevo;
  }, []);
  const removeUsuario = useCallback((id) => {
    setUsuarios(us => us.filter(u => u.id !== id));
    setUsuario(cur => (cur && cur.id === id) ? null : cur); // si se elimina al activo, cierra sesión
  }, []);
  const updateUsuario = useCallback((id, patch) => {
    setUsuarios(us => us.map(u => u.id === id ? { ...u, ...patch } : u));
    setUsuario(cur => (cur && cur.id === id) ? { ...cur, ...patch } : cur);
  }, []);

  /* ---------- Edición (preparado para datos editables) ---------- */
  const updateInsumo   = useCallback((id, patch) => setInsumos(xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), []);
  const updatePersonal = useCallback((id, patch) => setPersonal(xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), []);
  // Alta de empleado (no toca el resto del equipo)
  const addEmpleado = useCallback((e) => {
    const id = "e" + Date.now();
    const nuevo = {
      id,
      nombre: (e.nombre || "").trim(),
      doc: e.doc ? "DNI " + String(e.doc).replace(/^DNI\s*/i, "").trim() : "DNI —",
      cargo: e.cargo || "Mozo",
      sueldo: parseFloat(e.sueldo) || 0,
      estado: "activo",
      turno: e.turno || "Tarde",
      pago: "pendiente",
      ingreso: e.ingreso || "2026-06-06",
      descanso: e.descanso || "Lunes",
      frecuencia: e.frecuencia || "mensual",
      ultimoPago: null,          // sin pagos aún → la primera fecha sale del ingreso
      adelantoPendiente: 0,
      bonif: 0, desc: 0, historial: [], pagos: [],
    };
    setPersonal(xs => [...xs, nuevo]);
    toast("Empleado agregado: " + nuevo.nombre);
    return id;
  }, [toast]);
  // Retirar = inactivar SIN borrar (conserva ficha e historial)
  const retirarEmpleado = useCallback((id) => {
    setPersonal(xs => xs.map(x => x.id === id ? { ...x, estado: "inactivo", pago: "pagado", turno: "—" } : x));
    const emp = personal.find(p => p.id === id);
    toast("Empleado retirado: " + (emp ? emp.nombre : ""), "warn");
  }, [toast, personal]);
  // Reactivar (deshacer retiro)
  const reactivarEmpleado = useCallback((id) => {
    setPersonal(xs => xs.map(x => x.id === id ? { ...x, estado: "activo" } : x));
    const emp = personal.find(p => p.id === id);
    toast("Empleado reincorporado: " + (emp ? emp.nombre : ""));
  }, [toast, personal]);

  // Registra una salida de caja (efectivo o Yape) — alimenta el arqueo
  const registrarEgreso = useCallback((e) => {
    setEgresos(xs => [{ id: "eg" + Date.now() + Math.random().toString(36).slice(2, 5), ...e }, ...xs]);
  }, []);

  /* ---------- PAGO A PERSONAL: planilla → caja → estadísticas ----------
     total = sueldo base + bonificación − descuento − adelanto (saldo ya entregado).
     El neto pagado ahora sale de la caja (efectivo o Yape). El adelanto NO vuelve a
     descontarse de caja porque ya salió cuando se registró. Acumula bonif/desc para
     estadísticas (mejor empleado) y guarda el pago en el historial. */
  const pagarEmpleado = useCallback((empId, opts = {}) => {
    const { metodo = "Efectivo", bonif = 0, desc = 0, adelanto = 0, periodo = null } = opts;
    const emp = personal.find(p => p.id === empId);
    if (!emp) return null;
    if (!cajaAbierta) { toast("Apertura la caja antes de pagar al personal", "warn"); return null; }
    const b = Math.max(0, parseFloat(bonif) || 0);
    const d = Math.max(0, parseFloat(desc) || 0);
    const adv = Math.max(0, Math.min(parseFloat(adelanto) || 0, emp.adelantoPendiente || 0));
    const total = Math.max(0, emp.sueldo + b - d - adv);
    const hora = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
    const fecha = HOY_STR + " " + hora;
    // 1) Caja: descontar el neto pagado ahora por el método elegido
    registrarEgreso({ tipo: "pago", empId, nombre: emp.nombre, metodo, monto: total, fecha, detalle: "Pago de sueldo" });
    // 2) Empleado: acumular bonif/desc, descontar adelanto aplicado, mover fecha y guardar historial
    const registro = { id: "pg" + Date.now(), tipo: "pago", fecha, metodo, sueldo: emp.sueldo, bonif: b, desc: d, adelanto: adv, total, periodo };
    setPersonal(xs => xs.map(x => x.id !== empId ? x : {
      ...x,
      bonif: (x.bonif || 0) + b,
      desc: (x.desc || 0) + d,
      adelantoPendiente: Math.max(0, (x.adelantoPendiente || 0) - adv),
      ultimoPago: HOY_STR,
      pago: "pagado",
      pagos: [registro, ...(x.pagos || [])],
    }));
    toast(`Pago registrado · ${emp.nombre.split(" ")[0]} · ${money(total)} (${metodo})`);
    return { total, registro };
  }, [personal, cajaAbierta, toast, registrarEgreso]);

  /* ---------- ADELANTO: dinero entregado antes del pago (saldo pendiente) ----------
     Sale de caja al registrarse y queda como adelantoPendiente; en el próximo pago
     se descuenta automáticamente del total. */
  const registrarAdelanto = useCallback((empId, opts = {}) => {
    const { metodo = "Efectivo", monto = 0 } = opts;
    const emp = personal.find(p => p.id === empId);
    if (!emp) return null;
    if (!cajaAbierta) { toast("Apertura la caja antes de registrar un adelanto", "warn"); return null; }
    const m = Math.max(0, parseFloat(monto) || 0);
    if (m <= 0) { toast("Ingresa un monto de adelanto válido", "warn"); return null; }
    const hora = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
    const fecha = HOY_STR + " " + hora;
    registrarEgreso({ tipo: "adelanto", empId, nombre: emp.nombre, metodo, monto: m, fecha, detalle: "Adelanto de sueldo" });
    const registro = { id: "ad" + Date.now(), tipo: "adelanto", fecha, metodo, adelanto: m, total: -m };
    setPersonal(xs => xs.map(x => x.id !== empId ? x : {
      ...x,
      adelantoPendiente: (x.adelantoPendiente || 0) + m,
      pagos: [registro, ...(x.pagos || [])],
    }));
    toast(`Adelanto registrado · ${emp.nombre.split(" ")[0]} · ${money(m)} (${metodo})`);
    return { registro };
  }, [personal, cajaAbierta, toast, registrarEgreso]);

  /* ---------- GASTO DE CAJA: salida manual del turno (luz, compras, servicio...) ----------
     Registra concepto + monto + método y descuenta del efectivo / Yape esperado. */
  const registrarGasto = useCallback((opts = {}) => {
    const { concepto = "", monto = 0, metodo = "Efectivo" } = opts;
    if (!cajaAbierta) { toast("Apertura la caja antes de registrar un gasto", "warn"); return null; }
    const c = String(concepto).trim();
    const m = Math.max(0, parseFloat(monto) || 0);
    if (!c) { toast("Ingresa el concepto del gasto", "warn"); return null; }
    if (m <= 0) { toast("Ingresa un monto válido", "warn"); return null; }
    const hora = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
    const fecha = HOY_STR + " " + hora;
    registrarEgreso({ tipo: "gasto", concepto: c, metodo, monto: m, fecha, detalle: c });
    toast(`Gasto registrado · ${c} · ${money(m)} (${metodo})`);
    return true;
  }, [cajaAbierta, toast, registrarEgreso]);
  const updateProducto = useCallback((id, patch) => setProductos(xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), []);
  const updateActivo   = useCallback((id, patch) => setActivos(xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), []);
  const updateDescartable = useCallback((id, patch) => setDescartables(xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), []);

  /* ---------- Inventario: compras, altas, recetas ---------- */
  const [movimientos, setMovimientos] = useState(() => ([
    { id: "mv_s1", tipo: "compra", item: "Pescado fresco", cantidad: 12, unidad: "kg", costo: 28, fecha: "2026-06-04 08:10" },
    { id: "mv_s2", tipo: "compra", item: "Coca-Cola 500ml", cantidad: 48, unidad: "u", costo: 3.2, fecha: "2026-06-04 09:30" },
  ]));
  const regMovimiento = useCallback((mov) => setMovimientos(ms => [{ ...mov, id: "mv" + Date.now() }, ...ms]), []);

  // Suma stock a un insumo o bebida existente; registra movimiento
  const registrarCompra = useCallback(({ destino, id, cantidad, unidad, costo, fecha, nombre }) => {
    const cant = parseFloat(cantidad) || 0;
    const cst = parseFloat(costo);
    if (destino === "insumo") {
      setInsumos(xs => xs.map(x => x.id === id ? { ...x, stock: Math.round((x.stock + cant) * 100) / 100, costo: isNaN(cst) ? x.costo : cst } : x));
    } else {
      setProductos(xs => xs.map(x => x.id === id ? { ...x, stock: Math.round(((x.stock || 0) + cant) * 100) / 100, costo: isNaN(cst) ? x.costo : cst } : x));
    }
    regMovimiento({ tipo: "compra", item: nombre, cantidad: cant, unidad, costo: isNaN(cst) ? 0 : cst, fecha });
    toast("Compra registrada: +" + cant + " " + unidad + " · " + nombre);
  }, [regMovimiento, toast]);

  // Crea insumo nuevo y registra su stock inicial como compra
  const addInsumo = useCallback(({ nombre, unidad, cantidad, costo, min, fecha }) => {
    const cant = parseFloat(cantidad) || 0; const cst = parseFloat(costo) || 0;
    const id = "ins_" + Date.now();
    setInsumos(xs => [...xs, { id, nombre, unidad, stock: cant, min: parseFloat(min) || Math.round(cant * 0.4), ideal: Math.max(cant, Math.round(cant * 2)) || 10, costo: cst }]);
    regMovimiento({ tipo: "alta", item: nombre, cantidad: cant, unidad, costo: cst, fecha });
    toast("Insumo creado: " + nombre);
    return id;
  }, [regMovimiento, toast]);

  // Crea bebida (producto embotellado) nueva
  const addBebida = useCallback(({ nombre, sub, precio, costo, cantidad, fecha }) => {
    const cant = parseFloat(cantidad) || 0; const cst = parseFloat(costo) || 0; const pr = parseFloat(precio) || 0;
    const id = "b_" + Date.now();
    setProductos(xs => [...xs, { id, nombre, cat: "bebida", sub: sub || "Gaseosas", precio: pr, vendHoy: 0, stock: cant, min: Math.round(cant * 0.4), costo: cst, receta: [] }]);
    regMovimiento({ tipo: "alta", item: nombre, cantidad: cant, unidad: "u", costo: cst, fecha });
    toast("Bebida creada: " + nombre);
    return id;
  }, [regMovimiento, toast]);

  // Crea un producto de carta (comida o bebida). NO toca insumos ni recetas: receta vacía.
  const addProducto = useCallback(({ nombre, cat, precio }) => {
    const pr = parseFloat(precio) || 0;
    const c = cat === "bebida" ? "bebida" : "comida";
    const id = "p_" + Date.now();
    setProductos(xs => [...xs, { id, nombre: (nombre || "").trim(), cat: c, sub: c === "bebida" ? "Bebida" : "Plato", precio: pr, vendHoy: 0, receta: [] }]);
    toast("Producto creado: " + (nombre || "").trim());
    return id;
  }, [toast]);

  const addActivo = useCallback(({ nombre, total }) => {
    const tot = parseInt(total) || 0;
    setActivos(xs => [...xs, { id: "act_" + Date.now(), nombre, total: tot, enUso: 0, estado: "ok" }]);
    toast("Activo agregado: " + nombre);
  }, [toast]);

  const addDescartable = useCallback(({ nombre, precio, stock, min }) => {
    setDescartables(xs => [...xs, { id: "d_" + Date.now(), nombre, precio: parseFloat(precio) || 0, stock: parseInt(stock, 10) || 0, min: parseInt(min, 10) || 0 }]);
    toast("Descartable agregado: " + nombre);
  }, [toast]);

  // Actualiza la receta de un producto (lista [insumoId, cantidad])
  const setReceta = useCallback((prodId, receta) => {
    setProductos(xs => xs.map(x => x.id === prodId ? { ...x, receta: receta.map(r => [...r]) } : x));
    toast("Receta guardada");
  }, [toast]);

  /* ---------- Lookups ---------- */
  const prodById   = useMemo(() => Object.fromEntries(productos.map(p => [p.id, p])), [productos]);
  const insumoById = useMemo(() => Object.fromEntries(insumos.map(i => [i.id, i])), [insumos]);
  const descById   = useMemo(() => Object.fromEntries(descartables.map(d => [d.id, d])), [descartables]);

  const mesaTotal = useCallback((mesa) =>
    mesa.pedido.reduce((s, [pid, q]) => s + (prodById[pid]?.precio || 0) * q, 0)
    + (mesa.desc || []).reduce((s, [did, q]) => s + (descById[did]?.precio || 0) * q, 0), [prodById, descById]);
  const mesaItems = useCallback((mesa) =>
    mesa.pedido.reduce((s, [, q]) => s + q, 0), []);

  /* ---------- Toasts ---------- */
  const toast = useCallback((msg, kind = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);

  /* ---------- Acciones sobre la comanda ---------- */
  const addItem = useCallback((mesaId, pid) => {
    setMesas(ms => ms.map(m => {
      if (m.id !== mesaId) return m;
      const pedido = m.pedido.map(p => [...p]);
      const ix = pedido.findIndex(p => p[0] === pid);
      // La unidad nueva queda como estado_impresion "pendiente" (enviado no cambia).
      if (ix >= 0) pedido[ix][1] += 1; else pedido.push([pid, 1, 0, null]);
      // La reserva sigue en curso al agregar comanda: una mesa reservada se mantiene "reservada".
      const estado = m.estado === "libre" ? "ocupada" : m.estado;
      const comensales = m.comensales || Math.min(2, m.cap);
      const minAbierta = m.minAbierta || 1;
      return { ...m, pedido, estado, comensales, minAbierta, mozo: m.mozo || (usuarioRef.current || D.usuario).nombre.split(" ")[0] };
    }));
  }, []);

  const changeQty = useCallback((mesaId, pid, delta) => {
    setMesas(ms => ms.map(m => {
      if (m.id !== mesaId) return m;
      let pedido = m.pedido.map(p => [...p]);
      const ix = pedido.findIndex(p => p[0] === pid);
      if (ix < 0) return m;
      pedido[ix][1] += delta;
      if (pedido[ix][1] <= 0) pedido.splice(ix, 1);
      // No puede haber más "enviado" que cantidad total.
      else if ((pedido[ix][2] || 0) > pedido[ix][1]) pedido[ix][2] = pedido[ix][1];
      // Si la comanda quedó vacía, la mesa se libera.
      return _normalizarMesaVacia({ ...m, pedido });
    }));
  }, []);

  const removeItem = useCallback((mesaId, pid) => {
    setMesas(ms => ms.map(m => m.id === mesaId
      ? _normalizarMesaVacia({ ...m, pedido: m.pedido.filter(p => p[0] !== pid) })
      : m));
  }, []);

  // Descartables de una orden (para llevar): fija la cantidad exacta escrita por el usuario.
  const setDescQty = useCallback((mesaId, descId, n) => {
    const qty = Math.max(0, parseInt(n, 10) || 0);
    setMesas(ms => ms.map(m => {
      if (m.id !== mesaId) return m;
      let desc = (m.desc || []).map(d => [...d]);
      const ix = desc.findIndex(d => d[0] === descId);
      if (qty <= 0) { if (ix >= 0) desc.splice(ix, 1); }
      else if (ix >= 0) { desc[ix][1] = qty; if ((desc[ix][2] || 0) > qty) desc[ix][2] = qty; }
      else desc.push([descId, qty, 0, null]);
      const estado = m.estado === "libre" && (desc.length || m.pedido.length) ? "ocupada" : m.estado;
      // Si quitar el descartable deja todo vacío, la mesa se libera.
      return _normalizarMesaVacia({ ...m, desc, estado });
    }));
  }, []);

  const setComensales = useCallback((mesaId, n) => {
    setMesas(ms => ms.map(m => m.id === mesaId ? { ...m, comensales: Math.max(1, n), estado: m.estado === "libre" ? "ocupada" : m.estado, minAbierta: m.minAbierta || 1 } : m));
  }, []);

  const pedirCuenta = useCallback((mesaId) => {
    const ts = Date.now();
    setMesas(ms => ms.map(m => m.id === mesaId
      ? { ...m, estado: "cuenta", horaCuenta: ts, comandaNro: m.comandaNro || ("C-" + String(620 + (m.num || 0)).padStart(4, "0")) }
      : m));
    toast("Cuenta solicitada · cocina notificada", "warn");
  }, [toast]);

  /* ---------- ENVÍO A COCINA/BARRA: marca estado_impresion "enviado" ----------
     Solo marca como enviado lo que realmente salió impreso a cada estación,
     para que al agregar productos después no se reimpriman los platos anteriores. */
  const enviarComanda = useCallback((mesaId, tipos, ts, nro) => {
    ts = ts || Date.now();
    const tieneCocina = tipos.includes("cocina");
    const tieneMesero = tipos.includes("mesero");
    const tieneBar = tipos.includes("bar");
    const imprimioProd = (pr) => {
      if (!pr) return false;
      if (pr.cat === "comida") return tieneCocina || tieneMesero;
      // Bebidas: la barra solo despacha cócteles/refrescos; el mesero las lleva todas.
      if (tieneMesero) return true;
      return tieneBar && /c[oó]ctel|refresco/i.test(pr.sub || "");
    };
    const imprimioDesc = tieneCocina || tieneMesero;
    setMesas(ms => ms.map(m => {
      if (m.id !== mesaId) return m;
      const pedido = m.pedido.map(p => {
        const pend = p[1] - (p[2] || 0);
        return (pend > 0 && imprimioProd(prodById[p[0]])) ? [p[0], p[1], p[1], ts] : [...p];
      });
      const desc = (m.desc || []).map(d => {
        const pend = d[1] - (d[2] || 0);
        return (pend > 0 && imprimioDesc) ? [d[0], d[1], d[1], ts] : [...d];
      });
      return { ...m, pedido, desc, primerEnvioTs: m.primerEnvioTs || ts, comandaNro: m.comandaNro || nro || null };
    }));
  }, [prodById]);

  // Reservar mesa: guarda datos del cliente y marca estado "reservada" (no borra la mesa)
  const reservar = useCallback((mesaId, info) => {
    setMesas(ms => ms.map(m => m.id === mesaId
      ? { ...m, estado: "reservada", reserva: info ? { ...info } : (m.reserva || null) }
      : m));
  }, []);

  // Liberar reserva: la mesa vuelve a estado libre y se limpian los datos de reserva
  // Liberar reserva: solo se quita con esta acción explícita. Si ya tiene comanda, la mesa queda "ocupada"; si no, "libre".
  const liberarReserva = useCallback((mesaId) => {
    setMesas(ms => ms.map(m => m.id === mesaId
      ? { ...m, estado: (m.pedido && m.pedido.length > 0) ? "ocupada" : "libre", reserva: null }
      : m));
  }, []);

  const nuevaMesa = useCallback((cfg = {}) => {
    setMesas(ms => {
      const num = Math.max(0, ...ms.map(m => m.num)) + 1;
      const cap = cfg.cap || 4;
      const zona = cfg.zona || "Salón";
      const shape = cap <= 2 ? "round" : "rect";
      const nm = { id: "m" + num, num, zona, cap, estado: "libre", comensales: 0, mozo: null, minAbierta: 0, pos: { x: 40, y: 88 }, shape, activa: true, pedido: [] };
      toast(`Mesa ${num} creada en ${zona} · ${cap} sillas`);
      return [...ms, nm];
    });
  }, [toast]);

  // Inactivar (no borra historial; solo deja de mostrarse en piso)
  const inactivarMesa = useCallback((mesaId) => {
    setMesas(ms => ms.map(m => m.id === mesaId ? { ...m, activa: false, estado: "libre", pedido: [], comensales: 0, mozo: null, minAbierta: 0 } : m));
    toast("Mesa marcada como inactiva");
  }, [toast]);

  /* ---------- Costo / ganancia ---------- */
  const costoProducto = useCallback((p) => {
    if (p.costo != null) return p.costo;
    if (p.receta && p.receta.length) return p.receta.reduce((s, [id, c]) => s + ((insumoById[id]?.costo || 0) * c), 0);
    return Math.round(p.precio * 0.35 * 100) / 100;
  }, [insumoById]);

  /* ---------- Caja: apertura / cierre ---------- */
  const abrirCaja = useCallback((monto) => {
    setCajaAbierta(true); setMontoInicial(parseFloat(monto) || 0);
    setAperturaHora(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false }));
    toast("Caja aperturada · " + money(parseFloat(monto) || 0));
  }, [toast]);
  const cerrarCaja = useCallback(() => { setCajaAbierta(false); setAperturaHora(null); toast("Caja cerrada"); }, [toast]);

  /* ---------- Clientes ---------- */
  const buscarCliente = useCallback((doc) => clientes.find(c => c.doc === String(doc).trim()), [clientes]);
  const addCliente = useCallback((c) => {
    const nuevo = { ...c, id: "c" + Date.now() };
    setClientes(cs => [...cs, nuevo]); toast("Cliente registrado: " + (c.nombre || ""));
    return nuevo;
  }, [toast]);

  /* ---------- Cupones ---------- */
  const validarCupon = useCallback((codigo) => {
    const codeNorm = String(codigo).trim().toUpperCase();
    if (!codeNorm) return { ok: false, error: "Ingresa un código" };
    const cup = cupones.find(c => c.codigo.toUpperCase() === codeNorm);
    // 1) Debe existir en la tabla cupones
    if (!cup) return { ok: false, error: "Cupón inválido" };
    // 2) No permitir cupones inactivos
    if (!cup.activo) return { ok: false, error: "Cupón inactivo" };
    // 3) No permitir cupones vencidos (comparación a nivel de día)
    if (cup.vence) {
      const venc = new Date(cup.vence + "T00:00:00");
      const hoy = new Date("2026-06-06T00:00:00");
      if (!isNaN(venc) && venc < hoy) return { ok: false, error: "Cupón vencido" };
    }
    // 4) Validar límite de uso (uso_maximo es opcional: si no está definido, no hay tope)
    if (cup.maxUsos != null && (cup.usos || 0) >= cup.maxUsos) return { ok: false, error: "Límite de uso alcanzado" };
    return { ok: true, cupon: cup };
  }, [cupones]);
  const calcDescuentoCupon = useCallback((cup, base) => {
    if (!cup) return 0;
    return cup.tipo === "pct" ? Math.round(base * cup.valor) / 100 : Math.min(base, cup.valor);
  }, []);
  // Alta manual de cupón → inserta en la tabla cupones
  const addCupon = useCallback((c) => {
    const codigo = String(c.codigo || "").trim().toUpperCase();
    // tipo interno: pct | monto (la UI ofrece "porcentaje"/"monto")
    const tipo = (c.tipo === "monto") ? "monto" : "pct";
    const valor = parseFloat(c.valor) || 0;
    // uso_maximo es opcional: vacío/null = sin tope
    const maxUsos = (c.maxUsos === "" || c.maxUsos == null) ? null : (parseInt(c.maxUsos) || null);
    const desc = tipo === "pct" ? (valor + "% de descuento") : (window.money0(valor) + " de descuento");
    const nuevo = {
      id: "cup_" + Date.now(),
      codigo,
      tipo,
      valor,
      activo: c.activo !== false,
      vence: c.vence || "",
      usos: 0,
      maxUsos,
      desc,
    };
    setCupones(cs => [nuevo, ...cs]);
    toast("Cupón creado: " + codigo);
    return nuevo;
  }, [toast]);
  const updateCupon = useCallback((id, patch) => setCupones(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c)), []);

  /* ---------- Declaraciones ---------- */
  const addDeclaracion = useCallback((d) => setDeclaraciones(ds => [{ ...d, id: "d" + Date.now() }, ...ds]), []);
  const updateDeclaracion = useCallback((id, patch) => setDeclaraciones(ds => ds.map(d => d.id === id ? { ...d, ...patch } : d)), []);

  /* ---------- COBRAR: el corazón de la conexión ---------- */
  const cobrar = useCallback((mesaId, opts = {}) => {
    const { metodo = "Efectivo", cupon = null, cliente = null, documento = "Boleta", pagos: pagosIn = null } = opts;
    const mesa = mesas.find(m => m.id === mesaId);
    if (!mesa) return;
    if (!cajaAbierta) { toast("Apertura la caja antes de cobrar", "warn"); return; }
    let comida = 0, bebida = 0, items = 0, costoTotal = 0;
    const consumo = {}; // insumoId -> cantidad a descontar
    const ventaVend = {};

    mesa.pedido.forEach(([pid, q]) => {
      const p = prodById[pid]; if (!p) return;
      items += q;
      costoTotal += costoProducto(p) * q;
      if (p.cat === "comida") comida += p.precio * q; else bebida += p.precio * q;
      ventaVend[pid] = (ventaVend[pid] || 0) + q;
      p.receta.forEach(([insId, cant]) => { consumo[insId] = (consumo[insId] || 0) + cant * q; });
    });

    // Descartables (para llevar): suman al total y descuentan su propio stock.
    let descTotal = 0;
    const consumoDesc = {};
    (mesa.desc || []).forEach(([did, q]) => {
      const d = descById[did]; if (!d) return;
      descTotal += d.precio * q;
      consumoDesc[did] = (consumoDesc[did] || 0) + q;
    });

    const subtotal = comida + bebida + descTotal;
    const descuento = cupon ? calcDescuentoCupon(cupon, subtotal) : 0;
    const base = Math.max(0, subtotal - descuento); // monto a repartir entre métodos, sin recargo
    // Asignaciones por método (en base, sin recargo). Sin pagos divididos: todo al método elegido.
    const alloc = (Array.isArray(pagosIn) && pagosIn.length)
      ? pagosIn.map(p => ({ metodo: p.metodo, base: Math.max(0, parseFloat(p.base) || 0) }))
      : [{ metodo, base }];
    const cardBase = alloc.filter(a => a.metodo === "Tarjeta").reduce((s, a) => s + a.base, 0);
    // El recargo de tarjeta se calcula SOLO sobre lo que pasa por tarjeta, no sobre el total.
    const recargo = (recargoOn && recargoPct) ? Math.round(cardBase * recargoPct) / 100 : 0;
    const total = Math.max(0, base + recargo);
    // Montos efectivamente cobrados por método (la línea de tarjeta ya incluye su recargo)
    const pagos = alloc.filter(a => a.base > 0.001).map(a => ({
      metodo: a.metodo,
      monto: a.metodo === "Tarjeta"
        ? Math.round((a.base + (recargoOn && recargoPct ? a.base * recargoPct / 100 : 0)) * 100) / 100
        : Math.round(a.base * 100) / 100
    }));
    const metodoLabel = pagos.length > 1 ? "Mixto" : (pagos[0] ? pagos[0].metodo : metodo);

    // 1) Inventario: descontar insumos
    setInsumos(ins => ins.map(i => consumo[i.id] ? { ...i, stock: Math.max(0, Math.round((i.stock - consumo[i.id]) * 100) / 100) } : i));
    // 1b) Inventario: descontar stock de bebidas embotelladas vendidas
    setProductos(ps => ps.map(p => (ventaVend[p.id] && p.cat === "bebida" && p.stock != null) ? { ...p, stock: Math.max(0, Math.round((p.stock - ventaVend[p.id]) * 100) / 100) } : p));
    // 1c) Inventario: descontar stock de descartables usados (para llevar)
    setDescartables(ds => ds.map(d => consumoDesc[d.id] ? { ...d, stock: Math.max(0, d.stock - consumoDesc[d.id]) } : d));
    // 2) Estadísticas / Caja: registrar productos vendidos
    setVendidos(v => { const n = { ...v }; for (const k in ventaVend) n[k] = (n[k] || 0) + ventaVend[k]; return n; });
    // 3) Caja: registrar transacción
    const hora = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
    const venta = { id: "v" + Date.now(), mesa: mesa.num, hora, metodo: metodoLabel, comida, bebida, descTotal, items, costo: costoTotal, recargo, descuento, cupon: cupon ? cupon.codigo : null, documento, cliente: cliente ? cliente.nombre : null, total, pagos, lineas: mesa.pedido.map(p => [...p]), descartables: (mesa.desc || []).map(d => [...d]) };
    setVentas(vs => [venta, ...vs]);
    // 3b) Cupón: registrar uso
    if (cupon) setCupones(cs => cs.map(c => c.codigo === cupon.codigo ? { ...c, usos: c.usos + 1 } : c));
    // 3c) Declaración (boleta/factura)
    addDeclaracion({ tipo: documento, cliente: cliente ? cliente.nombre : "Cliente varios", docCliente: cliente ? cliente.doc : "-", monto: total, fecha: "2026-06-05 " + hora, mesa: mesa.num, estado: "Emitido", pdf: false });
    // 4) Mesa: liberar
    // 3d) Cierre por mozo: registrar/cerrar la cuenta de esta mesa (atendida)
    const nroCuenta = mesa.comandaNro || nroDeMesa(mesa);
    const recCuenta = {
      nro: nroCuenta, mesaNum: mesa.num, zona: mesa.zona, mozo: mesa.mozo || "—",
      comensales: mesa.comensales, ts: Date.now(),
      pedido: mesa.pedido.map(p => [p[0], p[1]]), desc: (mesa.desc || []).map(d => [d[0], d[1]]),
      obs: "", estado: "cobrada",
    };
    setCuentas(cs => {
      const i = cs.findIndex(c => c.nro === nroCuenta && c.estado !== "cobrada");
      if (i >= 0) { const n = [...cs]; n[i] = { ...n[i], ...recCuenta }; return n; }
      return [...cs, { id: "cta" + Date.now(), ...recCuenta }];
    });
    setMesas(ms => ms.map(m => m.id === mesaId ? { ...m, estado: "libre", comensales: 0, mozo: null, minAbierta: 0, pedido: [], desc: [], reserva: null } : m));

    setPayMesa(null); setDrawerMesa(null);
    toast(`Mesa ${mesa.num} cobrada · ${money(total)}`);
    window.ultimaVenta = venta;
    return venta;
  }, [mesas, prodById, descById, toast, cajaAbierta, recargoOn, recargoPct, costoProducto, calcDescuentoCupon, addDeclaracion]);

  /* ---------- Derivados: CAJA + ESTADÍSTICAS ---------- */
  const caja = useMemo(() => {
    let comida = 0, bebida = 0, itemsComida = 0, itemsBebida = 0, costoTotal = 0, ganancia = 0;
    productos.forEach(p => {
      const q = vendidos[p.id] || 0;
      const c = (p.costo != null ? p.costo : (p.receta && p.receta.length ? p.receta.reduce((s, [id, cant]) => s + ((insumoById[id]?.costo || 0) * cant), 0) : Math.round(p.precio * 0.35 * 100) / 100));
      costoTotal += c * q;
      ganancia += (p.precio - c) * q;
      if (p.cat === "comida") { comida += p.precio * q; itemsComida += q; }
      else { bebida += p.precio * q; itemsBebida += q; }
    });
    const total = comida + bebida;
    const nTrans = ventas.length;
    // Cada venta puede tener pagos divididos; si no, se asume un solo pago por su total.
    const pagosDe = (v) => (Array.isArray(v.pagos) && v.pagos.length) ? v.pagos : [{ metodo: v.metodo, monto: (v.total != null ? v.total : v.comida + v.bebida) }];
    const sumMetodo = (m) => ventas.reduce((s, v) => s + pagosDe(v).filter(p => p.metodo === m).reduce((a, p) => a + p.monto, 0), 0);
    const porMetodo = {};
    ventas.forEach(v => pagosDe(v).forEach(p => porMetodo[p.metodo] = (porMetodo[p.metodo] || 0) + p.monto));
    const descuentos = ventas.reduce((s, v) => s + (v.descuento || 0), 0);
    const recargos = ventas.reduce((s, v) => s + (v.recargo || 0), 0);
    const totalCobrado = ventas.reduce((s, v) => s + (v.total != null ? v.total : v.comida + v.bebida), 0);
    const efectivoEsperado = montoInicial + sumMetodo("Efectivo");
    const yapeEsperado = sumMetodo("Yape");
    // Egresos de caja (pagos a personal + adelantos + gastos) restan del efectivo / Yape esperado
    const egresosEfectivo = egresos.filter(e => e.metodo === "Efectivo").reduce((s, e) => s + (e.monto || 0), 0);
    const egresosYape = egresos.filter(e => e.metodo === "Yape").reduce((s, e) => s + (e.monto || 0), 0);
    // Desglose por tipo para el resumen del arqueo
    const gastosTotal = egresos.filter(e => e.tipo === "gasto").reduce((s, e) => s + (e.monto || 0), 0);
    const planillaTotal = egresos.filter(e => e.tipo === "pago" || e.tipo === "adelanto").reduce((s, e) => s + (e.monto || 0), 0);
    return { comida, bebida, total, itemsComida, itemsBebida, nTrans, ticket: nTrans ? total / nTrans : 0, porMetodo, costoTotal, ganancia, descuentos, recargos, totalCobrado, efectivoEsperado: efectivoEsperado - egresosEfectivo, yapeEsperado: yapeEsperado - egresosYape, egresosEfectivo, egresosYape, egresosTotal: egresosEfectivo + egresosYape, gastosTotal, planillaTotal };
  }, [vendidos, ventas, productos, insumoById, montoInicial, egresos]);

  const topProductos = useMemo(() =>
    productos.map(p => ({ ...p, qty: vendidos[p.id] || 0, ingreso: (vendidos[p.id] || 0) * p.precio }))
      .sort((a, b) => b.qty - a.qty), [vendidos, productos]);

  const resumenMesas = useMemo(() => {
    const act = mesas.filter(m => m.activa !== false && !m.llevar);
    const r = { libre: 0, ocupada: 0, reservada: 0, cuenta: 0, total: act.length, comensales: 0, ventaAbierta: 0 };
    act.forEach(m => { r[m.estado] = (r[m.estado] || 0) + 1; r.comensales += m.comensales; r.ventaAbierta += mesaTotal(m); });
    return r;
  }, [mesas, mesaTotal]);

  const alertasInsumos = useMemo(() => insumos.filter(i => i.stock <= i.min), [insumos]);
  const mesasEsperando = useMemo(() => mesas.filter(m => m.estado === "cuenta"), [mesas]);

  // Mejor empleado: mayor bonificación neta (bonif − desc) entre los activos
  const mejorEmpleado = useMemo(() => {
    const activos = personal.filter(p => p.estado !== "inactivo");
    if (!activos.length) return null;
    return activos.map(p => ({ ...p, neto: (p.bonif || 0) - (p.desc || 0) }))
      .sort((a, b) => b.neto - a.neto || (b.bonif || 0) - (a.bonif || 0))[0];
  }, [personal]);

  const value = {
    D, theme, setTheme, view, setView,
    usuario, usuarios, login, logout, cambiarUsuario, addUsuario, removeUsuario, updateUsuario,
    updateInsumo, updatePersonal, updateProducto, updateActivo,
    addEmpleado, retirarEmpleado, reactivarEmpleado, mejorEmpleado,
    pagarEmpleado, registrarAdelanto, egresos, registrarGasto,
    movimientos, registrarCompra, addInsumo, addBebida, addActivo, addDescartable, setReceta, addProducto,
    mesas, insumos, activos, productos, descartables, personal, vendidos, ventas,
    prodById, insumoById, descById, mesaTotal, mesaItems, updateDescartable, setDescQty,
    drawerMesa, setDrawerMesa, payMesa, setPayMesa,
    addItem, changeQty, removeItem, setComensales, pedirCuenta, enviarComanda, reservar, liberarReserva, nuevaMesa, inactivarMesa, cobrar,
    cuentas, registrarCuenta,
    caja, topProductos, resumenMesas, alertasInsumos, mesasEsperando,
    cajaAbierta, montoInicial, aperturaHora, abrirCaja, cerrarCaja,
    recargoPct, setRecargoPct, recargoOn, setRecargoOn,
    clientes, buscarCliente, addCliente, cupones, validarCupon, calcDescuentoCupon, addCupon, updateCupon,
    declaraciones, addDeclaracion, updateDeclaracion, costoProducto,
    toast, toasts, tick,
  };

  return React.createElement(StoreCtx.Provider, { value }, children);
}

window.StoreProvider = StoreProvider;
