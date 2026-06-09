/* ============================================================
   TALISMÁN — Autenticación y pantallas de cuenta
   Login / Ver perfil / Cambiar usuario / Configuración
   ============================================================ */

/* ---------- LOGIN / BIENVENIDA ---------- */
function Login() {
  const { D, usuarios, login, toast } = window.useStore();
  const [sel, setSel] = React.useState(null);      // usuario seleccionado (paso clave)
  const [pin, setPin] = React.useState("");
  const [err, setErr] = React.useState(false);
  const frase = D.frasesDelDia[(new Date().getDate()) % D.frasesDelDia.length];
  const selU = sel ? usuarios.find(u => u.id === sel) : null;

  const elegir = (u) => { setSel(u.id); setPin(""); setErr(false); };
  const volver = () => { setSel(null); setPin(""); setErr(false); };

  const verificar = React.useCallback((code) => {
    if (!selU) return;
    if (code === (selU.pin || "")) { login(selU); }
    else { setErr(true); setTimeout(() => { setPin(""); setErr(false); }, 650); toast && toast("Clave incorrecta", "warn"); }
  }, [selU, login, toast]);

  const tecla = (d) => {
    setPin(p => {
      if (p.length >= 4) return p;
      const n = (p + d).slice(0, 4);
      if (n.length === 4) setTimeout(() => verificar(n), 120);
      return n;
    });
  };
  const borrar = () => setPin(p => p.slice(0, -1));

  // Teclado físico (útil con teclado externo en la tablet)
  React.useEffect(() => {
    if (!selU) return;
    const onKey = (e) => {
      if (e.key >= "0" && e.key <= "9") tecla(e.key);
      else if (e.key === "Backspace") borrar();
      else if (e.key === "Escape") volver();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selU]);

  const aside = React.createElement("div", { className: "login__aside" },
    React.createElement("div", { className: "login__brandtop" },
      React.createElement("div", { className: "login__logo" }),
      React.createElement("div", null,
        React.createElement("div", { className: "hdr__name", style: { fontSize: 20 } }, "TALIS", React.createElement("b", null, "MÁN")),
        React.createElement("div", { className: "hdr__tag" }, "Cevichería · Restobar"))),
    React.createElement("div", { className: "login__frase" },
      React.createElement("div", { className: "login__quote" }, "“"),
      React.createElement("p", { className: "login__frase-txt" }, frase.texto),
      React.createElement("div", { className: "login__frase-aut" }, "— " + frase.autor + " · Frase del día")),
    React.createElement("div", { className: "login__foot" }, "Sistema de gestión interno · v1.0"));

  /* ----- Paso 1: elegir usuario ----- */
  const pasoUsuarios = React.createElement("div", { className: "login__box" },
    React.createElement("div", { className: "kicker" }, "Iniciar sesión"),
    React.createElement("h1", { className: "login__title" }, "Bienvenido a ", React.createElement("span", { style: { color: "var(--accent)" } }, "Talismán")),
    React.createElement("p", { className: "login__sub" }, "Selecciona tu usuario e ingresa tu clave"),
    React.createElement("div", { className: "field__label", style: { marginTop: 26 } }, "Usuarios"),
    React.createElement("div", { className: "user-pick" },
      usuarios.map(u => React.createElement("button", {
        key: u.id, className: "user-pick__item", onClick: () => elegir(u)
      },
        React.createElement("div", { className: "avatar", style: { width: 40, height: 40, borderRadius: 11 } }, u.iniciales),
        React.createElement("div", { className: "user-pick__meta" },
          React.createElement("div", { className: "user-pick__name" }, u.nombre),
          React.createElement("div", { className: "user-pick__role" }, u.rol + " · " + u.turno)),
        React.createElement("span", { className: "user-pick__check" }, React.createElement(window.Icon, { name: "chevR" }))))));

  /* ----- Paso 2: teclado de clave ----- */
  const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
  const esMozo = selU && selU.rol === "Mozo";
  const pasoClave = selU && React.createElement("div", { className: "login__box pinbox" },
    React.createElement("button", { className: "pin__back", onClick: volver },
      React.createElement(window.Icon, { name: "chevR", style: { transform: "scaleX(-1)", width: 16, height: 16 } }), "Cambiar usuario"),
    React.createElement("div", { className: "pin__user" },
      React.createElement("div", { className: "avatar", style: { width: 54, height: 54, borderRadius: 15, fontSize: 20 } }, selU.iniciales),
      React.createElement("div", null,
        React.createElement("div", { className: "pin__name" }, selU.nombre),
        React.createElement("span", { className: "badge badge--" + (esMozo ? "resv" : "busy") }, selU.rol))),
    React.createElement("div", { className: "field__label", style: { marginTop: 22, textAlign: "center" } }, "Ingresa tu clave de 4 dígitos"),
    React.createElement("div", { className: "pin__dots" + (err ? " is-err" : "") },
      [0, 1, 2, 3].map(i => React.createElement("span", { key: i, className: "pin__dot" + (pin.length > i ? " is-on" : "") + (err ? " is-err" : "") }))),
    React.createElement("div", { className: "pin__pad" },
      teclas.map((d, i) => d === ""
        ? React.createElement("span", { key: i })
        : React.createElement("button", {
            key: i, className: "pin__key" + (d === "del" ? " pin__key--del" : ""),
            onClick: () => d === "del" ? borrar() : tecla(d)
          }, d === "del" ? React.createElement(window.Icon, { name: "x", style: { width: 20, height: 20 } }) : d))),
    React.createElement("p", { className: "t3", style: { fontSize: 11.5, textAlign: "center", marginTop: 16, opacity: .65 } },
      React.createElement(window.Icon, { name: "key", style: { width: 13, height: 13, verticalAlign: "-2px", marginRight: 5 } }),
      "Clave de prueba: ", React.createElement("b", { style: { letterSpacing: ".15em" } }, selU.pin)));

  return React.createElement("div", { className: "login" }, aside,
    React.createElement("div", { className: "login__main" }, selU ? pasoClave : pasoUsuarios));
}
window.Login = Login;

/* ---------- MODAL genérico de cuenta ---------- */
function AccountModal({ title, kicker, onClose, children, width }) {
  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "scrim", style: { zIndex: 99 }, onClick: onClose }),
    React.createElement("div", { className: "modal-wrap" },
      React.createElement("div", { className: "modal", style: width ? { width } : null },
        React.createElement("button", { className: "iconbtn", style: { position: "absolute", top: 14, right: 14, zIndex: 2 }, onClick: onClose }, React.createElement(window.Icon, { name: "x" })),
        React.createElement("div", { className: "modal__pad" },
          kicker && React.createElement("div", { className: "kicker" }, kicker),
          title && React.createElement("h2", { style: { margin: "0 0 18px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 } }, title),
          children)))
  );
}

/* ---------- VER PERFIL ---------- */
function PerfilModal({ onClose }) {
  const { usuario, toast } = window.useStore();
  const [form, setForm] = React.useState({ nombre: usuario.nombre, email: usuario.email, doc: usuario.doc, turno: usuario.turno });
  const [editando, setEditando] = React.useState(false);
  const campo = (k, label, props = {}) => React.createElement("label", { className: "field", style: { marginBottom: 12 } },
    React.createElement("span", { className: "field__label" }, label),
    React.createElement("input", Object.assign({ className: "input", value: form[k], disabled: !editando, onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) }, props)));

  return React.createElement(AccountModal, { kicker: "Mi cuenta", title: "Ver perfil", onClose },
    React.createElement("div", { className: "row gap16", style: { marginBottom: 20, alignItems: "center" } },
      React.createElement("div", { className: "avatar", style: { width: 64, height: 64, borderRadius: 16, fontSize: 24 } }, usuario.iniciales),
      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 18, fontWeight: 700 } }, usuario.nombre),
        React.createElement("div", { className: "row gap8", style: { marginTop: 6 } },
          React.createElement("span", { className: "badge badge--busy" }, usuario.rol),
          React.createElement("span", { className: "badge badge--muted" }, usuario.acceso)))),
    campo("nombre", "Nombre completo"),
    campo("email", "Correo", { type: "email" }),
    campo("doc", "Documento"),
    campo("turno", "Turno"),
    React.createElement("div", { className: "row gap8", style: { marginTop: 18 } },
      !editando
        ? React.createElement("button", { className: "btn btn--accent", style: { flex: 1 }, onClick: () => setEditando(true) }, React.createElement(window.Icon, { name: "edit" }), "Editar información")
        : React.createElement(React.Fragment, null,
            React.createElement("button", { className: "btn btn--ghost", style: { flex: 1 }, onClick: () => setEditando(false) }, "Cancelar"),
            React.createElement("button", { className: "btn btn--accent", style: { flex: 1.4 }, onClick: () => { setEditando(false); toast("Perfil actualizado"); } }, React.createElement(window.Icon, { name: "check" }), "Guardar cambios"))),
    React.createElement("p", { className: "t3", style: { fontSize: 11, textAlign: "center", marginTop: 14 } }, "La edición de perfil se guardará en la base de datos en una fase futura."));
}
window.PerfilModal = PerfilModal;

/* ---------- CAMBIAR USUARIO (con clave) ---------- */
function CambiarUsuarioModal({ onClose }) {
  const { usuario, usuarios, cambiarUsuario, toast } = window.useStore();
  const [sel, setSel] = React.useState(null);
  const [pin, setPin] = React.useState("");
  const [err, setErr] = React.useState(false);
  const selU = sel ? usuarios.find(u => u.id === sel) : null;

  const confirmar = (code) => {
    if (code === (selU.pin || "")) { cambiarUsuario(selU); toast("Sesión cambiada a " + selU.nombre); onClose(); }
    else { setErr(true); setTimeout(() => { setPin(""); setErr(false); }, 600); }
  };
  const tecla = (d) => setPin(p => { if (p.length >= 4) return p; const n = (p + d).slice(0, 4); if (n.length === 4) setTimeout(() => confirmar(n), 110); return n; });

  if (selU) {
    const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
    return React.createElement(AccountModal, { kicker: "Sesión", title: "Confirma tu clave", onClose },
      React.createElement("button", { className: "pin__back", onClick: () => { setSel(null); setPin(""); }, style: { marginBottom: 10 } },
        React.createElement(window.Icon, { name: "chevR", style: { transform: "scaleX(-1)", width: 16, height: 16 } }), "Volver"),
      React.createElement("div", { className: "pin__user", style: { justifyContent: "center" } },
        React.createElement("div", { className: "avatar", style: { width: 46, height: 46, borderRadius: 13, fontSize: 17 } }, selU.iniciales),
        React.createElement("div", null,
          React.createElement("div", { className: "pin__name", style: { fontSize: 16 } }, selU.nombre),
          React.createElement("span", { className: "badge badge--" + (selU.rol === "Mozo" ? "resv" : "busy") }, selU.rol))),
      React.createElement("div", { className: "pin__dots" + (err ? " is-err" : ""), style: { marginTop: 16 } },
        [0, 1, 2, 3].map(i => React.createElement("span", { key: i, className: "pin__dot" + (pin.length > i ? " is-on" : "") + (err ? " is-err" : "") }))),
      React.createElement("div", { className: "pin__pad", style: { marginTop: 14 } },
        teclas.map((d, i) => d === ""
          ? React.createElement("span", { key: i })
          : React.createElement("button", { key: i, className: "pin__key" + (d === "del" ? " pin__key--del" : ""), onClick: () => d === "del" ? setPin(p => p.slice(0, -1)) : tecla(d) },
              d === "del" ? React.createElement(window.Icon, { name: "x", style: { width: 18, height: 18 } }) : d))),
      React.createElement("p", { className: "t3", style: { fontSize: 11, textAlign: "center", marginTop: 12, opacity: .6 } }, "Clave de prueba: ", React.createElement("b", { style: { letterSpacing: ".15em" } }, selU.pin)));
  }

  return React.createElement(AccountModal, { kicker: "Sesión", title: "Cambiar usuario", onClose },
    React.createElement("p", { className: "t2", style: { marginTop: -8, marginBottom: 16, fontSize: 13 } }, "Selecciona con qué cuenta quieres continuar. Pedirá su clave."),
    React.createElement("div", { className: "user-pick" },
      usuarios.map(u => React.createElement("button", {
        key: u.id, className: "user-pick__item" + (usuario.id === u.id ? " is-sel" : ""),
        onClick: () => { if (usuario.id === u.id) { onClose(); return; } setSel(u.id); setPin(""); setErr(false); }
      },
        React.createElement("div", { className: "avatar", style: { width: 40, height: 40, borderRadius: 11 } }, u.iniciales),
        React.createElement("div", { className: "user-pick__meta" },
          React.createElement("div", { className: "user-pick__name" }, u.nombre),
          React.createElement("div", { className: "user-pick__role" }, u.rol + " · " + u.acceso)),
        React.createElement("span", { className: "user-pick__check" },
          usuario.id === u.id ? React.createElement("span", { className: "badge badge--busy" }, "Actual") : React.createElement(window.Icon, { name: "chevR" }))))));
}
window.CambiarUsuarioModal = CambiarUsuarioModal;
