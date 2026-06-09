/* ============================================================
   TALISMÁN — Datos semilla (mock)
   Simula lo que en producción vendría de Supabase.
   ============================================================ */
(function () {
  const S = (n) => n; // soles helper placeholder

  /* ---------- INSUMOS (inventario dinámico: baja al vender) ---------- */
  const insumos = [
    { id: "ins_pescado",   nombre: "Pescado fresco",    unidad: "kg",  stock: 8.4,  min: 6,   ideal: 25, costo: 28 },
    { id: "ins_langost",   nombre: "Langostinos",       unidad: "kg",  stock: 3.1,  min: 4,   ideal: 15, costo: 42 },
    { id: "ins_pulpo",     nombre: "Pulpo",             unidad: "kg",  stock: 5.0,  min: 3,   ideal: 12, costo: 38 },
    { id: "ins_carne",     nombre: "Carne de res",      unidad: "kg",  stock: 12.5, min: 6,   ideal: 20, costo: 32 },
    { id: "ins_pollo",     nombre: "Pollo",             unidad: "kg",  stock: 14.0, min: 8,   ideal: 22, costo: 14 },
    { id: "ins_limon",     nombre: "Limón",             unidad: "kg",  stock: 2.2,  min: 5,   ideal: 18, costo: 6  },
    { id: "ins_cebolla",   nombre: "Cebolla roja",      unidad: "kg",  stock: 16.0, min: 5,   ideal: 20, costo: 4  },
    { id: "ins_camote",    nombre: "Camote",            unidad: "kg",  stock: 9.0,  min: 4,   ideal: 15, costo: 3  },
    { id: "ins_choclo",    nombre: "Choclo",            unidad: "u",   stock: 40,   min: 20,  ideal: 80, costo: 1.5},
    { id: "ins_arroz",     nombre: "Arroz",             unidad: "kg",  stock: 28.0, min: 10,  ideal: 40, costo: 5  },
    { id: "ins_papa",      nombre: "Papa amarilla",     unidad: "kg",  stock: 11.0, min: 6,   ideal: 25, costo: 4  },
    { id: "ins_aji",       nombre: "Ají amarillo",      unidad: "kg",  stock: 1.4,  min: 2,   ideal: 8,  costo: 9  },
    { id: "ins_aceite",    nombre: "Aceite",            unidad: "L",   stock: 18.0, min: 6,   ideal: 30, costo: 8  },
  ];

  /* ---------- ACTIVOS (inventario estático: control visual) ---------- */
  const activos = [
    { id: "act_platos",   nombre: "Platos hondos",   total: 120, enUso: 38, estado: "ok" },
    { id: "act_platosll", nombre: "Platos llanos",   total: 140, enUso: 52, estado: "ok" },
    { id: "act_vasos",    nombre: "Vasos",           total: 200, enUso: 86, estado: "ok" },
    { id: "act_copas",    nombre: "Copas",           total: 60,  enUso: 12, estado: "ok" },
    { id: "act_cubiertos",nombre: "Juegos cubiertos",total: 160, enUso: 70, estado: "ok" },
    { id: "act_jarras",   nombre: "Jarras",          total: 30,  enUso: 9,  estado: "ok" },
    { id: "act_fuentes",  nombre: "Fuentes grandes",  total: 24,  enUso: 18, estado: "warn" },
  ];

  /* ---------- PRODUCTOS (la carta) ---------- */
  // receta: insumos que descuenta cada unidad vendida
  const productos = [
    // Entradas / comida
    { id: "p_cevsimple", nombre: "Ceviche simple",        cat: "comida", sub: "Entradas",  precio: 32, tiempo: 12, vendHoy: 23, receta: [["ins_pescado",0.22],["ins_limon",0.08],["ins_cebolla",0.05],["ins_camote",0.10],["ins_choclo",1]] },
    { id: "p_cevmixto",  nombre: "Ceviche mixto",         cat: "comida", sub: "Entradas",  precio: 42, tiempo: 15, vendHoy: 18, receta: [["ins_pescado",0.15],["ins_langost",0.08],["ins_pulpo",0.07],["ins_limon",0.09],["ins_cebolla",0.05]] },
    { id: "p_leche",     nombre: "Leche de tigre",        cat: "comida", sub: "Entradas",  precio: 24, tiempo: 8,  vendHoy: 12, receta: [["ins_pescado",0.10],["ins_limon",0.06],["ins_aji",0.02]] },
    { id: "p_chicharron",nombre: "Chicharrón de pescado", cat: "comida", sub: "Entradas",  precio: 38, tiempo: 18, vendHoy: 15, receta: [["ins_pescado",0.25],["ins_aceite",0.10],["ins_camote",0.08]] },
    { id: "p_jalea",     nombre: "Jalea mixta",           cat: "comida", sub: "Fuentes",   precio: 64, tiempo: 22, vendHoy: 8,  receta: [["ins_pescado",0.2],["ins_langost",0.12],["ins_pulpo",0.1],["ins_aceite",0.15]] },
    { id: "p_arrozmar",  nombre: "Arroz con mariscos",    cat: "comida", sub: "Fondos",    precio: 46, tiempo: 20, vendHoy: 14, receta: [["ins_arroz",0.18],["ins_langost",0.1],["ins_pulpo",0.08],["ins_aji",0.03]] },
    { id: "p_arrozpoll", nombre: "Arroz chaufa de pollo", cat: "comida", sub: "Fondos",    precio: 34, tiempo: 14, vendHoy: 19, receta: [["ins_arroz",0.18],["ins_pollo",0.16],["ins_aceite",0.05]] },
    { id: "p_lomo",      nombre: "Lomo saltado",          cat: "comida", sub: "Fondos",    precio: 44, tiempo: 16, vendHoy: 21, receta: [["ins_carne",0.2],["ins_papa",0.18],["ins_cebolla",0.06],["ins_arroz",0.12]] },
    { id: "p_ajigall",   nombre: "Ají de gallina",        cat: "comida", sub: "Fondos",    precio: 32, tiempo: 18, vendHoy: 9,  receta: [["ins_pollo",0.18],["ins_aji",0.04],["ins_papa",0.1],["ins_arroz",0.12]] },
    { id: "p_sudado",    nombre: "Sudado de pescado",     cat: "comida", sub: "Fondos",    precio: 40, tiempo: 25, vendHoy: 7,  receta: [["ins_pescado",0.28],["ins_cebolla",0.06],["ins_aji",0.03]] },
    // Bebidas
    { id: "b_coca",      nombre: "Coca-Cola 500ml",       cat: "bebida", sub: "Gaseosas",  precio: 7,  vendHoy: 31, stock: 48, min: 24, costo: 3.2, receta: [] },
    { id: "b_inca",      nombre: "Inca Kola 500ml",       cat: "bebida", sub: "Gaseosas",  precio: 7,  vendHoy: 27, stock: 52, min: 24, costo: 3.2, receta: [] },
    { id: "b_agua",      nombre: "Agua mineral",          cat: "bebida", sub: "Gaseosas",  precio: 5,  vendHoy: 22, stock: 18, min: 24, costo: 1.8, receta: [] },
    { id: "b_chicha",    nombre: "Chicha morada (jarra)", cat: "bebida", sub: "Refrescos", precio: 18, vendHoy: 16, stock: 12, min: 6,  costo: 5.5, receta: [] },
    { id: "b_maracuya",  nombre: "Maracuyá (jarra)",      cat: "bebida", sub: "Refrescos", precio: 18, vendHoy: 11, stock: 9,  min: 6,  costo: 5.5, receta: [] },
    { id: "b_limonada",  nombre: "Limonada frozen",       cat: "bebida", sub: "Refrescos", precio: 12, vendHoy: 14, stock: 15, min: 8,  costo: 3.0, receta: [["ins_limon",0.1]] },
    { id: "b_cervnac",   nombre: "Cerveza Cusqueña",      cat: "bebida", sub: "Cervezas",  precio: 12, vendHoy: 24, stock: 36, min: 24, costo: 5.5, receta: [] },
    { id: "b_pisco",     nombre: "Pisco sour",            cat: "bebida", sub: "Cócteles",  precio: 22, vendHoy: 13, stock: 20, min: 8,  costo: 7.0, receta: [["ins_limon",0.05]] },
  ];

  /* ---------- DESCARTABLES (para llevar) ---------- */
  // Empaques con stock y precio propios. Se venden en órdenes "Para llevar"
  // y descuentan stock al cobrar, como el resto del inventario.
  const descartables = [
    { id: "d_tapper1", nombre: "Tápper mediano",   precio: 1.5, stock: 120, min: 40 },
    { id: "d_tapper2", nombre: "Tápper grande",    precio: 2.0, stock: 80,  min: 30 },
    { id: "d_bolsa",   nombre: "Bolsa biodegradable", precio: 0.5, stock: 200, min: 60 },
    { id: "d_cubiertos",nombre: "Juego de cubiertos", precio: 0.8, stock: 150, min: 50 },
    { id: "d_vaso",    nombre: "Vaso con tapa",     precio: 1.0, stock: 90,  min: 30 },
  ];

  /* ---------- MESAS ---------- */
  // estado: libre | ocupada | reservada | cuenta (pidió la cuenta)
  // pos: posición en el plano (% del contenedor)
  const M = (o) => o;
  const mesas = [
    M({ id:"m01", num:1,  zona:"Salón",   cap:4, estado:"ocupada",   comensales:3, mozo:"Lucía",  minAbierta:42,  pos:{x:14,y:22}, shape:"round", pedido:[["p_cevsimple",2],["b_inca",2],["p_lomo",1]] }),
    M({ id:"m02", num:2,  zona:"Salón",   cap:2, estado:"libre",     comensales:0, mozo:null,     minAbierta:0,   pos:{x:30,y:22}, shape:"round", pedido:[] }),
    M({ id:"m03", num:3,  zona:"Salón",   cap:4, estado:"ocupada",   comensales:4, mozo:"Marco",  minAbierta:18,  pos:{x:46,y:22}, shape:"round", pedido:[["p_cevmixto",2],["p_jalea",1],["b_cervnac",4],["b_chicha",1]] }),
    M({ id:"m04", num:4,  zona:"Salón",   cap:2, estado:"reservada", comensales:0, mozo:null,     minAbierta:0,   pos:{x:62,y:22}, shape:"round", pedido:[], reserva:{ cliente:"Familia Ramírez", celular:"987 654 321", personas:2, hora:"20:30", notas:"Aniversario · mesa tranquila" } }),
    M({ id:"m05", num:5,  zona:"Salón",   cap:6, estado:"ocupada",   comensales:5, mozo:"Lucía",  minAbierta:67,  pos:{x:14,y:48}, shape:"rect",  pedido:[["p_arrozmar",2],["p_ajigall",1],["p_chicharron",2],["b_agua",3],["b_pisco",2]] }),
    M({ id:"m06", num:6,  zona:"Salón",   cap:4, estado:"libre",     comensales:0, mozo:null,     minAbierta:0,   pos:{x:34,y:48}, shape:"rect",  pedido:[] }),
    M({ id:"m07", num:7,  zona:"Salón",   cap:4, estado:"cuenta",    comensales:4, mozo:"Marco",  minAbierta:88,  pos:{x:54,y:48}, shape:"rect",  pedido:[["p_lomo",2],["p_arrozpoll",2],["b_coca",4],["b_limonada",2]] }),
    M({ id:"m08", num:8,  zona:"VIP", cap:6, estado:"ocupada",   comensales:6, mozo:"Diana",  minAbierta:31,  pos:{x:82,y:20}, shape:"rect",  pedido:[["p_cevsimple",3],["p_cevmixto",1],["b_inca",3],["b_cervnac",3]] }),
    M({ id:"m09", num:9,  zona:"VIP", cap:2, estado:"libre",     comensales:0, mozo:null,     minAbierta:0,   pos:{x:82,y:40}, shape:"round", pedido:[] }),
    M({ id:"m10", num:10, zona:"VIP", cap:2, estado:"reservada", comensales:0, mozo:null,     minAbierta:0,   pos:{x:82,y:58}, shape:"round", pedido:[], reserva:{ cliente:"Carlos Mendoza", celular:"956 112 233", personas:2, hora:"21:00", notas:"Cena de negocios" } }),
    M({ id:"m11", num:11, zona:"Barra",   cap:1, estado:"ocupada",   comensales:1, mozo:"Diana",  minAbierta:12,  pos:{x:20,y:78}, shape:"round", pedido:[["b_pisco",1],["p_leche",1]] }),
    M({ id:"m12", num:12, zona:"Barra",   cap:1, estado:"libre",     comensales:0, mozo:null,     minAbierta:0,   pos:{x:34,y:78}, shape:"round", pedido:[] }),
    M({ id:"m13", num:13, zona:"Barra",   cap:1, estado:"ocupada",   comensales:1, mozo:"Marco",  minAbierta:5,   pos:{x:48,y:78}, shape:"round", pedido:[["b_cervnac",2]] }),
    M({ id:"m14", num:14, zona:"VIP", cap:8, estado:"libre",     comensales:0, mozo:null,     minAbierta:0,   pos:{x:62,y:70}, shape:"rect",  pedido:[] }),
  ];

  const zonas = [
    { nombre:"Salón",   x:6,  y:10, w:60, h:62 },
    { nombre:"VIP", x:72, y:10, w:24, h:66 },
    { nombre:"Barra",   x:12, y:70, w:46, h:22 },
  ];

  /* ---------- PERSONAL ----------
     bonif / desc = totales acumulados (S/). historial = detalle mensual.
     fechaIngreso / diaDescanso = datos de ficha. */
  const H = (mes, bonif, desc) => ({ mes, bonif, desc });
  // P = un pago ya registrado (semilla del historial de pagos)
  const P = (fecha, metodo, sueldo, bonif, desc, adelanto, total) => ({ id:"pg_"+fecha.replace(/\D/g,""), tipo:"pago", fecha, metodo, sueldo, bonif, desc, adelanto, total });
  /* frecuencia: semanal | quincenal | mensual · ultimoPago: fecha del último pago (define la próxima)
     adelantoPendiente: saldo de adelantos por descontar · pagos: historial de pagos del empleado */
  const personal = [
    { id:"e1", nombre:"Lucía Vargas",     doc:"DNI 45128890", cargo:"Mozo",       sueldo:1400, estado:"activo",   turno:"Tarde",  pago:"pagado",    ingreso:"2023-03-15", descanso:"Lunes",     frecuencia:"mensual",   ultimoPago:"2026-05-05", adelantoPendiente:0,   bonif:540, desc:40,  historial:[H("Mar 2026",180,0),H("Abr 2026",160,20),H("May 2026",200,20)], pagos:[P("2026-05-05 10:12","Efectivo",1400,200,20,0,1580)] },
    { id:"e2", nombre:"Marco Quispe",     doc:"DNI 70994215", cargo:"Mozo",       sueldo:1400, estado:"activo",   turno:"Tarde",  pago:"pagado",    ingreso:"2023-08-02", descanso:"Martes",    frecuencia:"quincenal", ultimoPago:"2026-05-22", adelantoPendiente:200, bonif:300, desc:120, historial:[H("Mar 2026",120,40),H("Abr 2026",80,50),H("May 2026",100,30)], pagos:[] },
    { id:"e3", nombre:"Diana Ríos",       doc:"DNI 48871203", cargo:"Mozo",       sueldo:1400, estado:"activo",   turno:"Noche",  pago:"pendiente", ingreso:"2024-01-20", descanso:"Miércoles", frecuencia:"semanal",   ultimoPago:"2026-05-30", adelantoPendiente:0,   bonif:420, desc:60,  historial:[H("Mar 2026",140,20),H("Abr 2026",120,20),H("May 2026",160,20)], pagos:[] },
    { id:"e4", nombre:"José Mamani",      doc:"DNI 09912874", cargo:"Chef",       sueldo:2800, estado:"activo",   turno:"Completo",pago:"pagado",   ingreso:"2022-05-10", descanso:"Domingo",   frecuencia:"mensual",   ultimoPago:"2026-05-28", adelantoPendiente:0,   bonif:680, desc:80,  historial:[H("Mar 2026",220,0),H("Abr 2026",200,40),H("May 2026",260,40)], pagos:[P("2026-05-28 09:40","Yape",2800,260,40,0,3020)] },
    { id:"e5", nombre:"Rosa Huamán",      doc:"DNI 41250097", cargo:"Cocina",     sueldo:1600, estado:"activo",   turno:"Completo",pago:"pagado",    ingreso:"2023-11-08", descanso:"Jueves",    frecuencia:"quincenal", ultimoPago:"2026-06-01", adelantoPendiente:100, bonif:260, desc:140, historial:[H("Mar 2026",100,60),H("Abr 2026",60,40),H("May 2026",100,40)], pagos:[] },
    { id:"e6", nombre:"Pedro Saldaña",    doc:"DNI 72338841", cargo:"Cajero",     sueldo:1700, estado:"activo",   turno:"Noche",  pago:"pendiente", ingreso:"2023-06-25", descanso:"Viernes",   frecuencia:"semanal",   ultimoPago:"2026-06-04", adelantoPendiente:0,   bonif:200, desc:220, historial:[H("Mar 2026",80,80),H("Abr 2026",60,80),H("May 2026",60,60)], pagos:[] },
    { id:"e7", nombre:"Elena Castro",     doc:"DNI 46019983", cargo:"Administra.",sueldo:3200, estado:"activo",   turno:"Mañana", pago:"pagado",    ingreso:"2021-02-01", descanso:"Sábado",    frecuencia:"mensual",   ultimoPago:"2026-05-31", adelantoPendiente:0,   bonif:560, desc:40,  historial:[H("Mar 2026",200,0),H("Abr 2026",180,20),H("May 2026",180,20)], pagos:[] },
    { id:"e8", nombre:"Iván Flores",      doc:"DNI 75640012", cargo:"Mozo",       sueldo:1400, estado:"descanso", turno:"—",      pago:"pagado",    ingreso:"2024-09-12", descanso:"Lunes",     frecuencia:"mensual",   ultimoPago:"2026-05-15", adelantoPendiente:0,   bonif:90,  desc:60,  historial:[H("Mar 2026",40,20),H("Abr 2026",20,20),H("May 2026",30,20)], pagos:[] },
  ];

  /* ---------- CLIENTES (boleta/factura) ---------- */
  const clientes = [
    { id:"c1", tipo:"persona", nombre:"Carlos Ramírez",      doc:"45872103", celular:"987654321" },
    { id:"c2", tipo:"persona", nombre:"María Fernández",     doc:"40219875", celular:"912345678" },
    { id:"c3", tipo:"empresa", nombre:"Inversiones del Sur SAC", doc:"20512345678", celular:"014567890" },
    { id:"c4", tipo:"empresa", nombre:"Corporación Marina EIRL",  doc:"20487654321", celular:"998112233" },
  ];

  /* ---------- CUPONES ----------
     tabla "cupones" — estructura canónica documentada en datos.jsx (Modelo de datos):
     id · codigo · tipo (porcentaje|monto) · valor · activo · fecha_expiracion · uso_maximo (opcional) · usos_actuales
     (en esta semilla mock se conservan los alias cortos que usa la lógica de caja:
      tipo pct/monto, vence = fecha_expiracion, usos = usos_actuales, maxUsos = uso_maximo) */
  const cupones = [
    { id:"cup_talis10",  codigo:"TALIS10",   tipo:"pct",   valor:10, activo:true,  vence:"2026-12-31", usos:4,  maxUsos:100, desc:"10% de descuento" },
    { id:"cup_verano15", codigo:"VERANO15",  tipo:"pct",   valor:15, activo:true,  vence:"2026-09-30", usos:12, maxUsos:50,  desc:"15% temporada de verano" },
    { id:"cup_bienven",  codigo:"BIENVENIDA",tipo:"monto", valor:20, activo:true,  vence:"2026-12-31", usos:30, maxUsos:200, desc:"S/ 20 de descuento" },
    { id:"cup_fiestas24",codigo:"FIESTAS24", tipo:"pct",   valor:20, activo:false, vence:"2025-12-31", usos:200,maxUsos:200, desc:"Vencido / agotado" },
  ];

  /* ---------- USUARIOS DEL SISTEMA (login / cambio de usuario) ---------- */
  const usuarios = [
    { id:"u1", nombre:"Elena Castro",  rol:"Administradora", iniciales:"EC", doc:"DNI 46019983", email:"elena@talisman.pe",  turno:"Mañana",  acceso:"Acceso total",        pin:"1234" },
    { id:"u2", nombre:"Pedro Saldaña", rol:"Cajero",        iniciales:"PS", doc:"DNI 72338841", email:"pedro@talisman.pe",  turno:"Noche",   acceso:"Caja y mesas",        pin:"2222" },
    { id:"u3", nombre:"José Mamani",   rol:"Chef",          iniciales:"JM", doc:"DNI 09912874", email:"jose@talisman.pe",   turno:"Completo", acceso:"Cocina e inventario", pin:"3333" },
    { id:"u4", nombre:"Lucía Vargas",  rol:"Mozo",          iniciales:"LV", doc:"DNI 45128890", email:"lucia@talisman.pe",  turno:"Tarde",   acceso:"Mesas y comandas",    pin:"4444" },
    { id:"u5", nombre:"Marco Quispe",  rol:"Mozo",          iniciales:"MQ", doc:"DNI 70994215", email:"marco@talisman.pe",  turno:"Tarde",   acceso:"Mesas y comandas",    pin:"5555" },
  ];

  /* ---------- USUARIO POR DEFECTO ---------- */
  const usuario = usuarios[0];

  /* ---------- FRASES DEL DÍA (pantalla de bienvenida) ---------- */
  const frasesDelDia = [
    { texto: "El secreto de un buen ceviche no está en el limón, sino en la frescura del mar.", autor: "Cocina del día" },
    { texto: "Cada plato que sale de la cocina lleva el nombre de la casa.", autor: "Talismán" },
    { texto: "Atiende cada mesa como si fuera la única del salón.", autor: "Servicio Talismán" },
    { texto: "El mejor insumo es el que llega fresco por la mañana.", autor: "Cocina del día" },
    { texto: "Un buen turno empieza con la barra lista y la sonrisa puesta.", autor: "Talismán" },
  ];

  /* ---------- HISTÓRICO (estadísticas / caja) ---------- */
  // ventas cerradas de hoy (antes de abrir las mesas activas)
  // Cada venta guarda su comanda (lineas = [productoId, cantidad]) para poder
  // reabrir el detalle de lo consumido desde "Últimos cobros".
  const ventasHoy = [
    { id:"v1001", mesa:5,  hora:"13:12", metodo:"Tarjeta",  comida:148, bebida:34, items:8,  documento:"Boleta",  cliente:null,
      lineas:[["p_cevsimple",2],["p_chicharron",1],["p_arrozmar",1],["b_cervnac",2],["b_agua",2]] },
    { id:"v1002", mesa:2,  hora:"13:40", metodo:"Efectivo", comida:74,  bebida:14, items:4,  documento:"Boleta",  cliente:null,
      lineas:[["p_cevmixto",1],["p_cevsimple",1],["b_coca",2]] },
    { id:"v1003", mesa:8,  hora:"14:05", metodo:"Yape",     comida:96,  bebida:48, items:7,  documento:"Boleta",  cliente:"Familia Salas",
      lineas:[["p_cevsimple",3],["b_cervnac",4]] },
    { id:"v1004", mesa:1,  hora:"14:33", metodo:"Tarjeta",  comida:212, bebida:62, items:10, documento:"Factura", cliente:"Inversiones Marfil S.A.C.",
      lineas:[["p_jalea",2],["p_arrozmar",1],["p_chicharron",1],["b_cervnac",4],["b_inca",2]] },
    { id:"v1005", mesa:11, hora:"15:01", metodo:"Efectivo", comida:32,  bebida:24, items:3,  documento:"Boleta",  cliente:null,
      lineas:[["p_cevsimple",1],["b_cervnac",2]] },
    { id:"v1006", mesa:3,  hora:"15:28", metodo:"Yape",     comida:128, bebida:36, items:6,  documento:"Boleta",  cliente:"Jorge Ttito",
      lineas:[["p_cevmixto",2],["p_lomo",1],["b_cervnac",3]] },
    { id:"v1007", mesa:6,  hora:"15:52", metodo:"Tarjeta",  comida:88,  bebida:21, items:5,  documento:"Boleta",  cliente:null,
      lineas:[["p_lomo",2],["b_coca",3]] },
  ];

  // ventas por hora (para sparkline del día)
  const ventasPorHora = [
    {h:"12", v:320},{h:"13", v:640},{h:"14", v:880},{h:"15", v:540},
    {h:"16", v:210},{h:"17", v:160},{h:"18", v:280},{h:"19", v:720},
    {h:"20", v:980},{h:"21", v:760},{h:"22", v:420},
  ];

  // serie semanal (lun-dom)
  const ventasSemana = [
    {d:"Lun", v:3820},{d:"Mar", v:3210},{d:"Mié", v:4150},{d:"Jue", v:4980},
    {d:"Vie", v:7240},{d:"Sáb", v:8910},{d:"Dom", v:6450},
  ];

  const ventasMes = [
    {m:"Sem 1", v:24300},{m:"Sem 2", v:27850},{m:"Sem 3", v:31200},{m:"Sem 4", v:29760},
  ];

  const ventasAnio = [
    {m:"Ene",v:84},{m:"Feb",v:78},{m:"Mar",v:92},{m:"Abr",v:88},{m:"May",v:97},{m:"Jun",v:34},
    {m:"Jul",v:0},{m:"Ago",v:0},{m:"Sep",v:0},{m:"Oct",v:0},{m:"Nov",v:0},{m:"Dic",v:0},
  ];

  window.TAL_DATA = {
    insumos, activos, productos, descartables, mesas, zonas, personal, usuario, usuarios, frasesDelDia, clientes, cupones,
    ventasHoy, ventasPorHora, ventasSemana, ventasMes, ventasAnio,
    // métricas de referencia (ayer) para comparativas
    ref: { ventasAyer: 4980, ticketAyer: 78, mesasAyer: 64 },
  };
})();
