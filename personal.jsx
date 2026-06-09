/* ============================================================
   TALISMÁN — Módulo PERSONAL (editable)
   ============================================================ */
function EmpleadoRow({ p, onOpen, onPay }) {
  const { updatePersonal, toast } = window.useStore();
  const [edit, setEdit] = React.useState(false);
  const [f, setF] = React.useState({ nombre: p.nombre, doc: p.doc, cargo: p.cargo, turno: p.turno, sueldo: p.sueldo });
  React.useEffect(() => { if (!edit) setF({ nombre: p.nombre, doc: p.doc, cargo: p.cargo, turno: p.turno, sueldo: p.sueldo }); }, [p, edit]);
  const vence = window.pagoVence(p);

  const guardar = () => { updatePersonal(p.id, { nombre: f.nombre, doc: f.doc, cargo: f.cargo, turno: f.turno, sueldo: parseFloat(f.sueldo) || 0 }); setEdit(false); toast("Empleado actualizado: " + f.nombre); };
  const inp = (k, props = {}) => React.createElement("input", Object.assign({ className: "cell-input", value: f[k], onChange: e => setF(s => ({ ...s, [k]: e.target.value })) }, props));

  return React.createElement("tr", { className: edit ? "is-editing" : "", style: p.estado === "inactivo" ? { opacity: .55 } : null },
    React.createElement("td", null, React.createElement("div", { className: "row gap10", onClick: (!edit && onOpen) ? () => onOpen(p) : null, style: (!edit && onOpen) ? { cursor: "pointer" } : null, title: !edit ? "Ver detalle" : null },
      React.createElement("span", { className: "avatar", style: { width: 34, height: 34, borderRadius: 10, background: p.estado === "activo" ? "linear-gradient(150deg,var(--accent-2),var(--accent))" : "var(--surface-3)", color: p.estado === "activo" ? "var(--accent-ink)" : "var(--text-2)" } }, p.nombre.split(" ").map(w => w[0]).slice(0, 2).join("")),
      edit ? inp("nombre", { style: { maxWidth: 160 } }) : React.createElement("b", { style: { fontWeight: 600 } }, p.nombre))),
    React.createElement("td", { className: "num t2", style: { fontSize: 12 } }, edit ? inp("doc") : p.doc),
    React.createElement("td", null, edit ? inp("cargo", { style: { maxWidth: 110 } }) : React.createElement("span", { className: "badge badge--muted" }, p.cargo)),
    React.createElement("td", { className: "t2" }, edit ? inp("turno", { style: { maxWidth: 100 } }) : p.turno),
    React.createElement("td", { className: "num", style: { textAlign: "right", fontWeight: 700 } }, edit ? inp("sueldo", { type: "number", style: { maxWidth: 90, marginLeft: "auto" } }) : window.money0(p.sueldo)),
    React.createElement("td", null, React.createElement(window.Badge, { kind: p.estado === "activo" ? "ok" : "muted" }, p.estado === "activo" ? "Activo" : (p.estado === "inactivo" ? "Inactivo" : "Descanso"))),
    React.createElement("td", null, React.createElement(window.Badge, { kind: vence ? "warn" : "ok" }, vence ? "Pendiente" : "Al día")),
    React.createElement("td", { style: { textAlign: "right" } },
      edit
        ? React.createElement("div", { className: "row-actions" },
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(false) }, "Cancelar"),
            React.createElement("button", { className: "btn btn--accent btn--sm", onClick: guardar }, React.createElement(window.Icon, { name: "check", style: { width: 14, height: 14 } }), "Guardar"))
        : React.createElement("div", { className: "row-actions" },
            vence && React.createElement("button", { className: "btn btn--sm btn--accent", onClick: () => onPay(p) }, "Pagar"),
            React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => setEdit(true) }, React.createElement(window.Icon, { name: "edit", style: { width: 14, height: 14 } }), "Editar"))));
}

function Personal() {
  const { personal, mejorEmpleado } = window.useStore();
  const [admin, setAdmin] = React.useState(false);
  const [detalle, setDetalle] = React.useState(null);
  const [pagarEmp, setPagarEmp] = React.useState(null);
  const activos = personal.filter(p => p.estado !== "inactivo");
  const enTurno = personal.filter(p => p.estado === "activo").length;
  const planilla = activos.reduce((s, p) => s + p.sueldo, 0);
  const pendientes = personal.filter(p => window.pagoVence(p));
  const mejorNeto = mejorEmpleado ? (mejorEmpleado.bonif || 0) - (mejorEmpleado.desc || 0) : 0;

  return React.createElement("div", { className: "view" },
    React.createElement("div", { className: "page-head" },
      React.createElement("div", null,
        React.createElement("div", { className: "kicker" }, "Equipo y planilla"),
        React.createElement("h1", { className: "page-title" }, "Personal"),
        React.createElement("p", { className: "page-sub" }, "Datos del equipo y control básico de pagos. Usa “Editar” para modificar cada ficha.")),
      React.createElement("button", { className: "btn btn--accent", onClick: () => setAdmin(true) }, React.createElement(window.Icon, { name: "personal" }), "Administrar personal")),

    React.createElement("div", { className: "stat-grid stagger", style: { marginBottom: 16 } },
      React.createElement(window.StatTile, { icon: "personal", label: "Empleados", value: activos.length, foot: enTurno + " activos hoy" }),
      React.createElement(window.StatTile, { icon: "dollar", label: "Planilla mensual", value: window.money0(planilla), foot: "Sueldos fijos" }),
      React.createElement(window.StatTile, { icon: "alert", label: "Pagos pendientes", value: pendientes.length, foot: window.money0(pendientes.reduce((s, p) => s + p.sueldo, 0)) + " por pagar", accent: pendientes.length > 0 }),
      React.createElement(window.StatTile, { icon: "star", label: "Mejor empleado", value: mejorEmpleado ? mejorEmpleado.nombre.split(" ")[0] : "—", foot: mejorEmpleado ? ("▲ " + window.money0(mejorNeto) + " balance · " + mejorEmpleado.cargo) : "Sin datos", accent: true })),

    React.createElement("div", { className: "card", style: { overflow: "hidden" } },
      React.createElement("table", { className: "tbl" },
        React.createElement("thead", null, React.createElement("tr", null,
          ["Empleado", "Documento", "Cargo", "Turno", "Sueldo", "Estado", "Pago", "Acciones"].map((h, i) =>
            React.createElement("th", { key: i, style: (i === 4 || i === 7) ? { textAlign: "right" } : null }, h)))),
        React.createElement("tbody", null,
          personal.map(p => React.createElement(EmpleadoRow, { key: p.id, p: p, onOpen: setDetalle, onPay: setPagarEmp })))),

    admin && React.createElement(window.AdministrarPersonalModal, { onClose: () => setAdmin(false) }),
    detalle && React.createElement(window.EmpleadoDetalleModal, { emp: personal.find(p => p.id === detalle.id) || detalle, onClose: () => setDetalle(null) }),
    pagarEmp && React.createElement(window.PagarEmpleadoModal, { emp: personal.find(p => p.id === pagarEmp.id) || pagarEmp, onClose: () => setPagarEmp(null) }))
  );
}
window.Personal = Personal;
