/* ============================================================
   TALISMÁN — Exportación a PDF (impresión a ventana limpia)
   ============================================================ */
(function () {
  const M = (n) => "S/ " + Math.round(n || 0).toLocaleString("es-PE");

  function printHTML(titulo, bodyHTML) {
    const css = `
      *{box-sizing:border-box;margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;}
      body{padding:36px 40px;color:#102A3C;background:#fff;}
      .h{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #ee7400;padding-bottom:14px;margin-bottom:22px;}
      .h .b{font-size:22px;font-weight:800;letter-spacing:.14em;}
      .h .b span{color:#ee7400;}
      .h .meta{text-align:right;font-size:11px;color:#5E7B8F;line-height:1.5;}
      h1{font-size:17px;margin:22px 0 10px;color:#102A3C;}
      .kpis{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;}
      .kpi{flex:1;min-width:130px;border:1px solid #e2e6ea;border-radius:10px;padding:12px 14px;}
      .kpi .l{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#8197A6;}
      .kpi .v{font-size:20px;font-weight:800;margin-top:4px;}
      .kpi .v.g{color:#1F9D6B;} .kpi .v.o{color:#ee7400;}
      table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px;}
      th{text-align:left;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:#8197A6;border-bottom:2px solid #e2e6ea;padding:8px 6px;}
      td{padding:7px 6px;border-bottom:1px solid #eef1f3;}
      .r{text-align:right;}
      .tot{font-weight:800;}
      .foot{margin-top:30px;font-size:10px;color:#8197A6;border-top:1px solid #e2e6ea;padding-top:12px;}
      @media print{body{padding:0 6px;}}
    `;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${titulo}</title><style>${css}</style></head>
      <body>
        <div class="h">
          <div class="b">TALIS<span>MÁN</span></div>
          <div class="meta">Cevichería · Restobar<br>${titulo}<br>${new Date().toLocaleString("es-PE")}</div>
        </div>
        ${bodyHTML}
        <div class="foot">Documento generado por el sistema de gestión Talismán · Reporte interno</div>
      </body></html>`;
    const f = document.createElement("iframe");
    f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(f);
    const doc = f.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    f.contentWindow.focus();
    setTimeout(() => { try { f.contentWindow.print(); } catch (e) {} setTimeout(() => f.remove(), 1500); }, 350);
  }
  window.printReporte = printHTML;

  /* ---------- CAJA / DÍA ---------- */
  window.exportarCajaPDF = function (caja, ventas, detalle, costoProducto) {
    const kpis = `<div class="kpis">
      <div class="kpi"><div class="l">Total vendido</div><div class="v o">${M(caja.totalCobrado)}</div></div>
      <div class="kpi"><div class="l">Ganancia</div><div class="v g">${M(caja.ganancia)}</div></div>
      <div class="kpi"><div class="l">Costo</div><div class="v">${M(caja.costoTotal)}</div></div>
      <div class="kpi"><div class="l">Mesas atendidas</div><div class="v">${caja.nTrans}</div></div>
      <div class="kpi"><div class="l">Descuentos cupón</div><div class="v">${M(caja.descuentos)}</div></div>
    </div>`;
    const metodos = Object.entries(caja.porMetodo || {}).map(([k, v]) => `<tr><td>${k}</td><td class="r">${M(v)}</td></tr>`).join("");
    const prods = detalle.map(p => { const c = costoProducto(p) * p.qty; return `<tr><td>${p.nombre}</td><td class="r">${p.qty}</td><td class="r">${M(p.ingreso)}</td><td class="r">${M(c)}</td><td class="r">${M(p.ingreso - c)}</td></tr>`; }).join("");
    const cupones = ventas.filter(v => v.cupon).map(v => `<tr><td>${v.cupon}</td><td>Mesa ${v.mesa}</td><td class="r">−${M(v.descuento)}</td></tr>`).join("") || `<tr><td colspan="3">Sin cupones aplicados</td></tr>`;
    const body = `
      <h1>Resumen del día</h1>${kpis}
      <h1>Productos vendidos</h1>
      <table><thead><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Venta</th><th class="r">Costo</th><th class="r">Ganancia</th></tr></thead>
      <tbody>${prods}</tbody></table>
      <h1>Métodos de pago</h1>
      <table><tbody>${metodos}</tbody></table>
      <h1>Cupones aplicados</h1>
      <table><thead><tr><th>Cupón</th><th>Mesa</th><th class="r">Descuento</th></tr></thead><tbody>${cupones}</tbody></table>`;
    printHTML("Cierre de caja", body);
  };

  /* ---------- ESTADÍSTICAS ---------- */
  window.exportarEstadisticasPDF = function (info) {
    const kpis = `<div class="kpis">
      <div class="kpi"><div class="l">Periodo</div><div class="v">${info.periodo}</div></div>
      <div class="kpi"><div class="l">Total ventas</div><div class="v o">${M(info.total)}</div></div>
      <div class="kpi"><div class="l">Mejor punto</div><div class="v">${info.mejor}</div></div>
      <div class="kpi"><div class="l">Promedio</div><div class="v">${M(info.prom)}</div></div>
    </div>`;
    const top = info.top.map((p, i) => `<tr><td>${String(i + 1).padStart(2, "0")}</td><td>${p.nombre}</td><td class="r">${p.qty}</td><td class="r">${M(p.ingreso)}</td></tr>`).join("");
    const met = Object.entries(info.porMetodo || {}).map(([k, v]) => `<tr><td>${k}</td><td class="r">${M(v)}</td></tr>`).join("");
    const body = `
      <h1>Rendimiento · ${info.periodo}</h1>${kpis}
      <h1>Producto top</h1>
      <table><thead><tr><th>#</th><th>Producto</th><th class="r">Cant.</th><th class="r">Ingreso</th></tr></thead><tbody>${top}</tbody></table>
      <h1>Distribución comida / bebida</h1>
      <table><tbody><tr><td>Comida</td><td class="r">${info.pctComida}%</td></tr><tr><td>Bebidas</td><td class="r">${info.pctBebida}%</td></tr></tbody></table>
      <h1>Métodos de pago</h1>
      <table><tbody>${met}</tbody></table>`;
    printHTML("Estadísticas", body);
  };

  /* ---------- BOLETA DE PAGO EMPLEADO ---------- */
  window.exportarBoletaEmpleado = function (e, det) {
    const body = `
      <h1>Boleta de pago</h1>
      <table><tbody>
        <tr><td>Empleado</td><td class="r tot">${e.nombre}</td></tr>
        <tr><td>Documento</td><td class="r">${e.doc}</td></tr>
        <tr><td>Cargo</td><td class="r">${e.cargo}</td></tr>
        <tr><td>Turno</td><td class="r">${e.turno}</td></tr>
        <tr><td>Periodo</td><td class="r">${det.periodo}</td></tr>
      </tbody></table>
      <h1>Liquidación</h1>
      <table><tbody>
        <tr><td>Sueldo base</td><td class="r">${M(det.base)}</td></tr>
        <tr><td>Bonificaciones</td><td class="r">${M(det.bonos)}</td></tr>
        <tr><td>Descuentos</td><td class="r">− ${M(det.descuentos)}</td></tr>
        ${det.adelanto ? `<tr><td>Adelanto entregado</td><td class="r">− ${M(det.adelanto)}</td></tr>` : ""}
        <tr><td class="tot">Total a pagar</td><td class="r tot">${M(det.total)}</td></tr>
        ${det.metodo ? `<tr><td>Método de pago</td><td class="r">${det.metodo}</td></tr>` : ""}
      </tbody></table>`;
    printHTML("Boleta de pago", body);
  };

  /* ---------- COMPROBANTE (boleta/factura) ---------- */
  window.exportarComprobante = function (d) {
    const body = `
      <h1>${d.tipo}</h1>
      <table><tbody>
        <tr><td>Cliente</td><td class="r tot">${d.cliente}</td></tr>
        <tr><td>${d.tipo === "Factura" ? "RUC" : "DNI"}</td><td class="r">${d.docCliente}</td></tr>
        <tr><td>Mesa</td><td class="r">${d.mesa}</td></tr>
        <tr><td>Fecha</td><td class="r">${d.fecha}</td></tr>
        <tr><td class="tot">Monto total</td><td class="r tot">${M(d.monto)}</td></tr>
      </tbody></table>`;
    printHTML(d.tipo + " · Mesa " + d.mesa, body);
  };

  /* ---------- ENVÍO POR WHATSAPP (boleta/factura) ----------
     Abre WhatsApp con el número del cliente y un mensaje prellenado con el enlace. */
  window.linkComprobante = function (d) { return "https://talisman.pe/comprobante/" + d.id; };
  window.enviarComprobanteWhatsApp = function (d, celular) {
    let tel = String(celular || "").replace(/\D/g, "");
    if (!tel) return { ok: false, error: "El cliente no tiene número registrado" };
    if (tel.length <= 9) tel = "51" + tel; // código de país Perú si viene local
    const link = window.linkComprobante(d);
    const doc = (d.tipo || "Boleta").toLowerCase();
    const msg = `Hola, aquí tienes tu ${doc}: ${link}`;
    window.open("https://wa.me/" + tel + "?text=" + encodeURIComponent(msg), "_blank");
    return { ok: true };
  };
})();
