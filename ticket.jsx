/* ============================================================
   TALISMÁN — Ticket de cobro para impresora térmica (80 mm)
   Expone:
     window.buildTicket(venta, prodById, descById, extra) -> { css, html }
     window.imprimirTicket(venta, prodById, descById, extra)
   El largo del papel se calcula solo (rollo continuo, @page size auto).
   ============================================================ */
(function () {
  /* ---------- Datos del negocio (edítalos aquí) ---------- */
  var NEG = {
    marca: "TALISMÁN",
    rubro: "CEVICHERÍA · RESTOBAR",
    ruc: "20614378655",
    dir: "Av. Carlos Wiese 588 - Chao, Virú · La Libertad",
    tel: "WhatsApp 974 848 187",
    web: "@talisman",
    logo: "assets/logo-navy.png",
    igv: 0.18,
    anchoMM: 80            // ancho del rollo en mm (estándar 80 mm)
  };

  /* ---------- Helpers ---------- */
  var soles = function (n) {
    n = Math.round(n * 100) / 100;
    return "S/ " + n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  var dosFechas = function () {
    var d = new Date();
    var f = d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
    var h = d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
    return { fecha: f, hora: h };
  };
  /* Duración legible para la diferencia de horas del agregado */
  var fmtDur = function (min) {
    min = Math.max(0, Math.round(min || 0));
    if (min < 60) return "+" + min + " min";
    var h = Math.floor(min / 60), m = min % 60;
    return "+" + h + " h" + (m ? " " + m + " min" : "");
  };

  /* Importe en letras (soles) */
  function enLetras(num) {
    num = Math.round(num * 100) / 100;
    var ent = Math.floor(num), cent = Math.round((num - ent) * 100);
    var uni = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    var esp = { 10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE", 16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE", 20: "VEINTE", 21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO", 25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE" };
    var dec = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    var cen = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
    function tres(n) {
      if (n === 0) return "";
      if (n === 100) return "CIEN";
      var s = "", c = Math.floor(n / 100), r = n % 100;
      if (c) s += cen[c] + " ";
      if (r) {
        if (r < 10) s += uni[r];
        else if (r < 30) s += esp[r];
        else { var d = Math.floor(r / 10), u = r % 10; s += dec[d]; if (u) s += " Y " + uni[u]; }
      }
      return s.trim();
    }
    function full(n) {
      if (n === 0) return "CERO";
      var mill = Math.floor(n / 1000000), mil = Math.floor((n % 1000000) / 1000), r = n % 1000, s = "";
      if (mill) s += (mill === 1 ? "UN MILLÓN" : tres(mill) + " MILLONES") + " ";
      if (mil) s += (mil === 1 ? "MIL" : tres(mil) + " MIL") + " ";
      if (r) s += tres(r);
      return s.trim();
    }
    return full(ent) + " CON " + String(cent).padStart(2, "0") + "/100 SOLES";
  }

  /* Correlativo estable a partir del id de venta */
  function correlativo(venta) {
    var serie = venta.documento === "Factura" ? "F001" : "B001";
    var n = String(venta.id || "").replace(/\D/g, "");
    n = n ? n.slice(-6) : "1";
    return serie + "-" + String(parseInt(n, 10) % 1000000 || 1).padStart(6, "0");
  }

  /* ---------- CSS del ticket ---------- */
  function ticketCSS() {
    var W = NEG.anchoMM + "mm";
    return [
      "@page{size:" + W + " auto;margin:0}",
      "*{margin:0;padding:0;box-sizing:border-box}",
      ".tk{width:" + W + ";background:#fff;color:#000;",
      "  font-family:'Menlo','Consolas','Courier New',monospace;font-size:11px;line-height:1.42;",
      "  padding:5mm 4mm 7mm;letter-spacing:.1px;-webkit-font-smoothing:none}",
      ".tk *{ }",
      ".c{text-align:center}.r{text-align:right}.b{font-weight:700}",
      ".mut{color:#000;opacity:.7}",
      ".logo{display:block;margin:0 auto 6px;width:18mm;height:auto}",
      ".marca{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:24px;",
      "  letter-spacing:5px;text-align:center;line-height:1}",
      ".rubro{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:9.5px;",
      "  letter-spacing:2.5px;text-align:center;margin-top:3px}",
      ".meta{text-align:center;font-size:10px;margin-top:6px;line-height:1.5}",
      ".hr{border:0;border-top:1px dashed #000;margin:7px 0}",
      ".hrs{border:0;border-top:1px solid #000;margin:7px 0}",
      ".doc{text-align:center;border:1.5px solid #000;border-radius:2px;padding:5px 6px;margin:2px 0 7px}",
      ".doc .t{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:11px;letter-spacing:1.5px}",
      ".doc .n{font-weight:700;font-size:13px;margin-top:2px;letter-spacing:1px}",
      ".kv{display:flex;justify-content:space-between;gap:8px;font-size:10px}",
      ".kv span:first-child{opacity:.7}",
      ".kv span:last-child{text-align:right;font-weight:600}",
      ".grphd{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:9px;",
      "  letter-spacing:1.5px;opacity:.6;margin:8px 0 3px}",
      ".colhd{display:flex;font-size:9px;font-weight:700;letter-spacing:.5px;opacity:.6;",
      "  padding-bottom:3px;border-bottom:1px solid #000}",
      ".colhd .q{width:9mm}.colhd .d{flex:1}.colhd .i{width:18mm;text-align:right}",
      ".it{padding:4px 0;border-bottom:1px dotted rgba(0,0,0,.35)}",
      ".it .top{display:flex;align-items:flex-start}",
      ".it .q{width:9mm;font-weight:700}",
      ".it .d{flex:1;padding-right:4px;word-break:break-word}",
      ".it .i{width:18mm;text-align:right;font-weight:700}",
      ".it .sub{font-size:9px;opacity:.6;margin-top:1px}",
      ".tot{display:flex;justify-content:space-between;align-items:baseline;gap:8px;white-space:nowrap;font-size:10.5px;padding:2px 0}",
      ".tot.big{font-family:'Helvetica Neue',Arial,sans-serif;align-items:baseline;",
      "  border-top:1.5px solid #000;border-bottom:1.5px solid #000;margin-top:5px;padding:6px 0}",
      ".tot.big .lab{font-weight:800;font-size:13px;letter-spacing:1px}",
      ".tot.big .val{font-weight:800;font-size:18px}",
      ".letras{font-size:9.5px;margin-top:7px;line-height:1.45}",
      ".letras b{font-weight:700}",
      ".pay{font-size:10px;margin-top:7px}",
      ".pay .row{display:flex;justify-content:space-between;padding:1px 0}",
      ".cup{text-align:center;font-size:10px;border:1px dashed #000;border-radius:2px;",
      "  padding:5px;margin-top:8px}",
      ".foot{text-align:center;margin-top:10px;font-size:10px;line-height:1.6}",
      ".foot .ty{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:13px;",
      "  letter-spacing:.5px;margin-bottom:4px}",
      ".legal{text-align:center;font-size:8.5px;opacity:.65;margin-top:8px;line-height:1.5}",
      ".hash{font-size:8.5px;word-break:break-all;text-align:center;margin-top:5px;opacity:.8}",
      ".cut{text-align:center;font-size:8px;letter-spacing:2px;opacity:.45;margin-top:10px}"
    ].join("");
  }

  /* ---------- Construcción del ticket ---------- */
  function buildTicket(venta, prodById, descById, extra) {
    prodById = prodById || {}; descById = descById || {}; extra = extra || {};
    var ff = dosFechas();
    var fecha = extra.fecha || ff.fecha, hora = venta.hora || ff.hora;

    // Líneas de productos
    var lineas = (venta.lineas || []).map(function (par) {
      var p = prodById[par[0]]; if (!p) return null;
      return { nombre: p.nombre, sub: p.sub, precio: p.precio, qty: par[1], cat: p.cat, total: p.precio * par[1] };
    }).filter(Boolean);
    var comidas = lineas.filter(function (l) { return l.cat === "comida"; });
    var bebidas = lineas.filter(function (l) { return l.cat === "bebida"; });
    var descs = (venta.descartables || []).map(function (par) {
      var d = descById[par[0]]; if (!d) return null;
      return { nombre: d.nombre, precio: d.precio, qty: par[1], total: d.precio * par[1] };
    }).filter(Boolean);

    var total = venta.total != null ? venta.total : (venta.comida + venta.bebida);
    var gravada = Math.round((total / (1 + NEG.igv)) * 100) / 100;
    var igv = Math.round((total - gravada) * 100) / 100;
    var subtotal = (venta.comida || 0) + (venta.bebida || 0) + (venta.descTotal || 0);

    var unidades = lineas.reduce(function (s, l) { return s + l.qty; }, 0) + descs.reduce(function (s, d) { return s + d.qty; }, 0);

    // Pagos
    var pagos = (venta.pagos && venta.pagos.length) ? venta.pagos
      : [{ metodo: venta.metodo || "Efectivo", monto: total }];

    var H = [];
    H.push('<div class="tk">');

    /* ---- ENCABEZADO ---- */
    H.push('<img class="logo" src="' + esc(NEG.logo) + '" alt="">');
    H.push('<div class="marca">' + esc(NEG.marca) + '</div>');
    H.push('<div class="rubro">' + esc(NEG.rubro) + '</div>');
    H.push('<div class="meta">' + esc(NEG.dir) + '<br>' + esc(NEG.tel) + '<br>' + esc(NEG.web) + '</div>');
    H.push('<hr class="hr">');
    H.push('<div class="meta b" style="font-size:11px;letter-spacing:1px">RUC ' + esc(NEG.ruc) + '</div>');

    /* ---- TIPO DE COMPROBANTE ---- */
    var tipoTxt = venta.documento === "Factura" ? "DETALLE DE CONSUMO" : "BOLETA DE VENTA ELECTRÓNICA";
    H.push('<div class="doc"><div class="t">' + tipoTxt + '</div><div class="n">' + correlativo(venta) + '</div></div>');

    /* ---- DATOS DE LA VENTA ---- */
    H.push('<div class="kv"><span>Fecha</span><span>' + esc(fecha) + '  ' + esc(hora) + '</span></div>');
    H.push('<div class="kv"><span>Mesa</span><span>' + esc(venta.mesa != null ? venta.mesa : "Para llevar") + '</span></div>');
    if (venta.mozo) H.push('<div class="kv"><span>Atendió</span><span>' + esc(venta.mozo) + '</span></div>');
    H.push('<div class="kv"><span>Cliente</span><span>' + esc(venta.cliente || "Cliente varios") + '</span></div>');
    if (venta.docCliente && venta.docCliente !== "-")
      H.push('<div class="kv"><span>' + (venta.documento === "Factura" ? "RUC" : "DNI") + '</span><span>' + esc(venta.docCliente) + '</span></div>');

    H.push('<hr class="hr">');

    /* ---- DETALLE ---- */
    H.push('<div class="colhd"><span class="q">CANT</span><span class="d">DESCRIPCIÓN</span><span class="i">IMPORTE</span></div>');

    function grupo(titulo, items) {
      if (!items.length) return;
      H.push('<div class="grphd">' + titulo + '</div>');
      items.forEach(function (l) {
        H.push('<div class="it"><div class="top"><span class="q">' + l.qty + '×</span>' +
          '<span class="d">' + esc(l.nombre) + '</span>' +
          '<span class="i">' + soles(l.total) + '</span></div>' +
          '<div class="sub">' + soles(l.precio) + ' c/u' + (l.sub ? ' · ' + esc(l.sub) : '') + '</div></div>');
      });
    }
    if (lineas.length || descs.length) {
      grupo("COMIDA", comidas);
      grupo("BEBIDAS", bebidas);
      grupo("PARA LLEVAR / EMPAQUES", descs);
    } else {
      H.push('<div class="it"><div class="top"><span class="q">—</span><span class="d">Consumo de la mesa (detalle no desglosado)</span><span class="i">' + soles(total) + '</span></div></div>');
    }

    H.push('<div class="kv" style="margin-top:6px"><span>' + unidades + ' ítem(s)</span><span>Subtotal productos ' + soles(subtotal) + '</span></div>');

    /* ---- AJUSTES ---- */
    if ((venta.descuento || 0) > 0)
      H.push('<div class="tot"><span>Descuento' + (venta.cupon ? ' (' + esc(venta.cupon) + ')' : '') + '</span><span>− ' + soles(venta.descuento) + '</span></div>');
    if ((venta.recargo || 0) > 0)
      H.push('<div class="tot"><span>Recargo por tarjeta</span><span>+ ' + soles(venta.recargo) + '</span></div>');

    /* ---- IMPUESTOS / TOTAL ---- */
    H.push('<hr class="hr">');
    H.push('<div class="tot"><span>Op. Gravada</span><span>' + soles(gravada) + '</span></div>');
    H.push('<div class="tot"><span>IGV (' + Math.round(NEG.igv * 100) + '%)</span><span>' + soles(igv) + '</span></div>');
    H.push('<div class="tot big"><span class="lab">TOTAL</span><span class="val">' + soles(total) + '</span></div>');
    H.push('<div class="letras"><b>SON:</b> ' + esc(enLetras(total)) + '</div>');

    /* ---- PAGO ---- */
    H.push('<div class="pay">');
    pagos.forEach(function (p) {
      H.push('<div class="row"><span>' + esc(p.metodo) + '</span><span>' + soles(p.monto) + '</span></div>');
    });
    if (extra.recibido != null && extra.recibido !== "" && pagos.length === 1 && pagos[0].metodo === "Efectivo") {
      var rec = parseFloat(extra.recibido) || 0;
      H.push('<div class="row"><span>Recibido</span><span>' + soles(rec) + '</span></div>');
      H.push('<div class="row b"><span>Vuelto</span><span>' + soles(Math.max(0, rec - total)) + '</span></div>');
    }
    H.push('</div>');

    /* ---- PIE ---- */
    H.push('<hr class="hrs">');
    H.push('<div class="foot"><div class="ty">¡GRACIAS POR SU PREFERENCIA!</div>' +
      'Conserve su comprobante.<br>Síguenos en redes como @' + esc(NEG.marca.toLowerCase()) + '</div>');

    if (venta.documento === "Factura") {
      H.push('<div class="legal"><b style="font-size:9.5px;letter-spacing:.5px">DETALLE DE CONSUMO</b><br>' +
        'Para la factura emitida por SUNAT consultar al <b>' + esc(NEG.tel.replace(/[^0-9]/g, "")) + '</b>.</div>');
    } else {
      H.push('<div class="legal">Representación impresa de la Boleta de Venta Electrónica.<br>Consulte su comprobante en el portal de SUNAT.</div>');
    }
    var hash = (correlativo(venta) + Date.now().toString(36)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
    H.push('<div class="hash">Autorización: ' + hash + '</div>');
    H.push('<div class="cut">· · · · · · · · · · · · · · · ·</div>');
    H.push('</div>');

    return { css: ticketCSS(), html: H.join("") };
  }

  /* ---------- CSS de la comanda de cocina ---------- */
  function comandaCSS() {
    var W = NEG.anchoMM + "mm";
    return [
      "@page{size:" + W + " auto;margin:0}",
      "*{margin:0;padding:0;box-sizing:border-box}",
      ".cm{width:" + W + ";background:#fff;color:#000;",
      "  font-family:'Menlo','Consolas','Courier New',monospace;font-size:12px;line-height:1.4;",
      "  padding:5mm 4mm 8mm;-webkit-font-smoothing:none}",
      ".cm .hd{text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;",
      "  font-size:17px;letter-spacing:3px;border:2.5px solid #000;border-radius:3px;padding:8px 6px}",
      ".cm .mesa{text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;",
      "  font-size:36px;letter-spacing:1px;margin:11px 0 1px;line-height:1}",
      ".cm .llv{text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;",
      "  font-size:17px;letter-spacing:2px;border:2px dashed #000;border-radius:3px;padding:7px;margin:11px 0 1px}",
      ".cm .info{text-align:center;font-size:11px;line-height:1.55;margin-top:4px}",
      ".cm .info b{font-weight:700}",
      ".cm .agr{text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;",
      "  font-size:13px;letter-spacing:2px;border:2px dashed #000;border-radius:3px;padding:7px;margin:10px 0 4px}",
      ".cm .agrsub{text-align:center;font-size:10.5px;line-height:1.5;font-weight:700;margin-bottom:2px}",
      ".cm hr{border:0;border-top:2px solid #000;margin:9px 0}",
      ".cm .grp{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:12px;",
      "  letter-spacing:2px;margin:11px 0 4px;padding-bottom:3px;border-bottom:1px solid #000}",
      ".cm .it{display:flex;align-items:flex-start;gap:9px;padding:7px 1px;",
      "  border-bottom:1px dotted rgba(0,0,0,.4)}",
      ".cm .it .q{min-width:12mm;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;",
      "  font-size:21px;text-align:center;border:2px solid #000;border-radius:4px;line-height:1.2;padding:2px 0}",
      ".cm .it .nm{flex:1;padding-top:1px}",
      ".cm .it .nm b{font-size:15.5px;font-weight:700;display:block;line-height:1.25;word-break:break-word}",
      ".cm .it .nm small{font-size:10.5px;opacity:.6;display:block;margin-top:1px}",
      ".cm .it .pr{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:14.5px;",
      "  text-align:right;min-width:16mm;padding-top:2px;white-space:nowrap}",
      ".cm .totbox{display:flex;justify-content:space-between;align-items:baseline;",
      "  font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;border-top:2.5px solid #000;",
      "  border-bottom:2.5px solid #000;margin-top:12px;padding:7px 2px;font-size:14px;letter-spacing:1px}",
      ".cm .totbox span:last-child{font-size:19px}",
      ".cm .nota{text-align:center;font-size:9.5px;letter-spacing:.5px;margin-top:9px;font-weight:700;opacity:.7}",
      ".cm .caja{border:2.5px solid #000;border-radius:3px;padding:10px 9px;margin-top:12px;text-align:center}",
      ".cm .caja-t{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:14px;",
      "  letter-spacing:2.5px;margin-bottom:5px}",
      ".cm .caja-b{font-size:11.5px;line-height:1.5;font-weight:700}",
      ".cm .caja-b b{font-weight:800;text-decoration:underline}",
      ".cm .caja-c{font-size:10.5px;line-height:1.4;margin-top:6px;font-style:italic;opacity:.8}",
      ".cm .obs{border:2.5px solid #000;border-radius:3px;padding:8px 9px;margin-top:11px}",
      ".cm .obs .lbl{font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:11px;",
      "  letter-spacing:2px;margin-bottom:4px;display:flex;justify-content:space-between}",
      ".cm .obs .txt{font-size:13.5px;line-height:1.4;font-weight:700;white-space:pre-wrap;word-break:break-word}",
      ".cm .tot{text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;",
      "  font-size:13px;margin-top:11px;border:1.5px solid #000;border-radius:3px;padding:6px}",
      ".cm .cut{text-align:center;font-size:9px;letter-spacing:3px;opacity:.5;margin-top:12px}",
      ".cm-page{break-inside:avoid}"
    ].join("");
  }

  /* ---------- Construcción de la comanda (bar / cocina / mesero) ---------- */
  function buildComanda(data, prodById, descById) {
    prodById = prodById || {}; descById = descById || {}; data = data || {};
    var tipo = data.tipo || "cocina";
    var ff = dosFechas();
    var fecha = data.fecha || ff.fecha, hora = data.hora || ff.hora;

    var lineas = (data.pedido || []).map(function (par) {
      var p = prodById[par[0]]; if (!p) return null;
      return { nombre: p.nombre, sub: p.sub, qty: par[1], cat: p.cat, precio: p.precio, total: p.precio * par[1] };
    }).filter(Boolean);
    var comidas = lineas.filter(function (l) { return l.cat === "comida"; });
    var bebidas = lineas.filter(function (l) { return l.cat === "bebida"; });
    // La barra solo despacha cócteles y refrescos (no gaseosas ni cervezas)
    var bebidasBar = bebidas.filter(function (l) { return /c[oó]ctel|refresco/i.test(l.sub || ""); });
    var descs = (data.desc || []).map(function (par) {
      var d = descById[par[0]]; if (!d) return null;
      return { nombre: d.nombre, qty: par[1], precio: d.precio, total: d.precio * par[1] };
    }).filter(Boolean);

    // Configuración por tipo de comanda
    var CFG = {
      bar:    { titulo: "TICKET BARRA",  precios: false, comida: false, bebida: true,  desc: false },
      cocina: { titulo: "TICKET COCINA", precios: false, comida: true,  bebida: false, desc: true  },
      mesero: { titulo: "TICKET MESERO", precios: false, comida: true,  bebida: true,  desc: true  },
      // Cuenta del mesero: TODO el consumo CON precios (control de mesas por mozo).
      cuenta: { titulo: "CUENTA · MESERO", precios: true,  comida: true,  bebida: true,  desc: true  }
    };
    var cfg = CFG[tipo] || CFG.cocina;
    // Las bebidas que muestra la barra están filtradas a cócteles/refrescos
    var bebidasShown = (tipo === "bar") ? bebidasBar : bebidas;

    var vis = [];
    if (cfg.comida) vis = vis.concat(comidas);
    if (cfg.bebida) vis = vis.concat(bebidasShown);
    if (cfg.desc) vis = vis.concat(descs);
    var unidades = vis.reduce(function (s, l) { return s + l.qty; }, 0);
    var totMostrado = vis.reduce(function (s, l) { return s + l.total; }, 0);

    // Código de comanda: uno solo por mesa (se reutiliza en los agregados).
    var nro = data.nro || ("C-" + String(parseInt(String(data.id || Date.now()).replace(/\D/g, "").slice(-4), 10) % 10000 || 1).padStart(4, "0"));

    var H = [];
    H.push('<div class="cm">');
    H.push('<div class="hd">' + cfg.titulo + '</div>');
    if (data.llevar) H.push('<div class="llv">PARA LLEVAR</div>');
    else H.push('<div class="mesa">MESA ' + String(data.mesa != null ? data.mesa : "—").toString().padStart(2, "0") + '</div>');
    H.push('<div class="info">' +
      (data.mozo ? '<b>Mozo:</b> ' + esc(data.mozo) + '  ·  ' : '') +
      (data.comensales ? '<b>' + data.comensales + '</b> pax' : '') +
      '<br>' + esc(fecha) + '  ' + esc(hora) + '  ·  ' + nro + '</div>');
    // Cuenta del mesero: hora de cierre (cuándo se pidió la cuenta) + mozo a cargo.
    if (tipo === "cuenta") {
      H.push('<div class="agr">CUENTA SOLICITADA</div>');
      H.push('<div class="agrsub">Cierre de mesa ' + esc(data.horaCierre || hora) +
        '<br>Mesero a cargo: ' + esc(data.mozo || "—") + '</div>');
    }
    // Agregado a una comanda ya enviada: no se reimprimen los platos anteriores.
    if (data.esAgregado) {
      var difTxt = fmtDur(data.minDesde || 0);
      H.push('<div class="agr">+ AGREGADO A LA COMANDA</div>');
      H.push('<div class="agrsub">Pedido inicial ' + esc(data.horaInicial || hora) +
        (difTxt ? '  ·  ' + difTxt + ' después' : '') +
        '<br>Solo platos nuevos — no reimprimir los anteriores</div>');
    }
    H.push('<hr>');

    function grupo(titulo, items, isDesc) {
      if (!items.length) return;
      H.push('<div class="grp">' + titulo + '</div>');
      items.forEach(function (l) {
        var sub = (!isDesc && l.sub) ? l.sub : "";
        if (cfg.precios) sub = (sub ? sub + " · " : "") + soles(l.precio) + " c/u";
        var pr = cfg.precios ? '<span class="pr">' + soles(l.total) + '</span>' : '';
        H.push('<div class="it"><span class="q">' + l.qty + '</span>' +
          '<span class="nm"><b>' + esc(l.nombre) + '</b>' +
          (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' + pr + '</div>');
      });
    }
    if (unidades === 0) {
      H.push('<div class="it"><span class="nm"><b>Sin ítems para este ticket</b></span></div>');
    } else {
      if (cfg.comida) grupo("COMIDA", comidas, false);
      if (cfg.bebida) grupo(tipo === "bar" ? "CÓCTELES Y REFRESCOS" : "BEBIDAS", bebidasShown, false);
      if (cfg.desc) grupo("PARA LLEVAR / DESCARTABLES", descs, true);
    }

    var obs = (data.obs || "").trim();
    // Las observaciones solo se imprimen en cocina y mesero, nunca en barra.
    if (obs && tipo !== "bar") {
      H.push('<div class="obs"><div class="lbl"><span>OBSERVACIONES</span></div>' +
        '<div class="txt">' + esc(obs) + '</div></div>');
    }

    if (cfg.precios) {
      H.push('<div class="totbox"><span>TOTAL</span><span>' + soles(totMostrado) + '</span></div>');
    } else {
      H.push('<div class="tot">TOTAL: ' + unidades + ' ítem(s)' + (data.llevar ? '  ·  PARA LLEVAR' : '') + '</div>');
    }
    if (tipo === "bar") H.push('<div class="nota">No válido como comprobante de pago</div>');
    if (tipo === "cuenta") {
      H.push('<div class="caja">' +
        '<div class="caja-t">ACÉRCATE A CAJA</div>' +
        '<div class="caja-b">Presenta este detalle en caja para realizar tu pago y recibir tu <b>boleta o factura electrónica</b>.</div>' +
        '<div class="caja-c">¡Gracias por tu visita! Te esperamos pronto.</div>' +
        '</div>');
      H.push('<div class="nota">Control interno de mesa atendida · no es comprobante de pago</div>');
    }

    H.push('<div class="cut">· · · · · · CORTE · · · · · ·</div>');
    H.push('</div>');

    return { css: comandaCSS(), html: H.join("") };
  }

  /* ---------- Corte automático de papel (ESC/POS: GS V 0) ----------
     Se ejecuta al final de cada impresión. La impresión visual va por el
     navegador, así que el byte de corte se envía por un canal de impresión
     cruda si está disponible (Web Serial o un agente de impresión local).
     Si no hay impresora conectada, no hace nada (no rompe la vista previa). */
  var CMD_CORTE = "\x1D\x56\x00"; // GS V 0 = corte total de papel

  function enviarComandoRaw(bytes) {
    try {
      // 1) Agente/puente externo de impresión cruda, si la integración lo expone.
      if (typeof window.rawPrint === "function") { window.rawPrint(bytes); return true; }
      // 2) Impresora térmica conectada por Web Serial (window.__printerPort).
      var port = window.__printerPort;
      if (port && port.writable && typeof TextEncoder !== "undefined") {
        var buf = new TextEncoder().encode(bytes), writer = port.writable.getWriter();
        writer.write(buf).finally(function () { try { writer.releaseLock(); } catch (e) {} });
        return true;
      }
    } catch (e) { /* sin impresora: se ignora */ }
    return false;
  }
  function cortarPapel() { return enviarComandoRaw(CMD_CORTE); }
  window.CMD_CORTE = CMD_CORTE;
  window.cortarPapel = cortarPapel;

  /* ---------- Impresión vía iframe oculto (compartida) ---------- */
  function _printDoc(title, built) {
    var doc = '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
      '<base href="' + location.href + '"><title>' + esc(title) + '</title>' +
      '<style>' + built.css + '</style></head><body>' + built.html + '</body></html>';
    var old = document.getElementById("__ticketFrame");
    if (old) old.remove();
    var f = document.createElement("iframe");
    f.id = "__ticketFrame";
    f.setAttribute("aria-hidden", "true");
    f.style.cssText = "position:fixed;width:0;height:0;right:0;bottom:0;border:0;visibility:hidden";
    document.body.appendChild(f);
    var d = f.contentWindow.document;
    d.open(); d.write(doc); d.close();
    var printed = false;
   var go = function () {
  if (printed) return; printed = true;

  try {
    var usuario = window.useStore?.getState?.().usuario;

    if (usuario?.rol === "Mozo") {
      // 👉 EXTRAER TEXTO DEL HTML (para RawBT)
      var temp = document.createElement("div");
      temp.innerHTML = built.html;

      var texto = temp.innerText || temp.textContent || "";

      const CUT = "\x1D\x56\x00";

      window.location.href = "rawbt:" + encodeURIComponent(texto + CUT);

      // eliminar iframe
      setTimeout(function () { f.remove(); }, 300);

      return;
    }

    // 👉 ADMIN (PC) sigue normal
    f.contentWindow.focus();
    f.contentWindow.print();

  } catch (e) { }

  cortarPapel();
};
    var img = d.images && d.images[0];
    if (img && !img.complete) { img.onload = go; img.onerror = go; setTimeout(go, 1200); }
    else { setTimeout(go, 250); }
    if (f.contentWindow) f.contentWindow.onafterprint = function () { setTimeout(function () { f.remove(); }, 300); };
  }

  function imprimirTicket(venta, prodById, descById, extra) {
    _printDoc("Ticket " + correlativo(venta), buildTicket(venta, prodById, descById, extra));
  }
  function imprimirComanda(data, prodById, descById) {
    _printDoc("Comanda cocina", buildComanda(data, prodById, descById));
  }
  // Varias comandas (bar/cocina/mesero) en un mismo trabajo de impresión.
  // Cada ticket va en su propia página -> la impresora térmica corta entre uno y otro.
  function imprimirComandas(data, prodById, descById, tipos) {
    tipos = (tipos && tipos.length) ? tipos : ["cocina"];
    var html = tipos.map(function (t, i) {
      var d = {}; for (var k in data) d[k] = data[k]; d.tipo = t;
      var inner = buildComanda(d, prodById, descById).html;
      var brk = (i < tipos.length - 1) ? ' style="break-after:page;page-break-after:always"' : '';
      return '<div class="cm-page"' + brk + '>' + inner + '</div>';
    }).join("");
    _printDoc("Comandas", { css: comandaCSS(), html: html });
  }

  window.buildTicket = buildTicket;
  window.buildComanda = buildComanda;
  window.imprimirTicket = imprimirTicket;
  window.imprimirComanda = imprimirComanda;
  window.imprimirComandas = imprimirComandas;
  window.ticketCorrelativo = correlativo;
})();
