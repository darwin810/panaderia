/**
 * imprimirBoleta.js
 * Genera e imprime una boleta térmica (80mm) compatible con cualquier impresora pequeña.
 * Usa una ventana emergente con CSS de impresión optimizado.
 */

export function imprimirBoleta(venta) {
  const { id, fecha_hora, total, metodo_pago, trabajador_nombre, puesto, items } = venta

  const fecha = new Date(fecha_hora)
  const fechaStr = fecha.toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
  const horaStr = fecha.toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
  const diaStr = fecha.toLocaleDateString('es-CL', { weekday: 'long' })

  // Cálculos
  const totalNum  = parseFloat(total)
  const neto      = totalNum / 1.19           // IVA incluido 19% Chile
  const iva       = totalNum - neto
  const cantItems = (items || []).reduce((s, i) => s + i.cantidad, 0)
  const refCode   = `REF-${String(id).padStart(6, '0')}-${fecha.getFullYear()}`

  const metodoIcono = {
    efectivo:      '💵 Efectivo',
    tarjeta:       '💳 Tarjeta',
    transferencia: '🏦 Transferencia',
    mach:          '📱 Mach'
  }[metodo_pago] || (metodo_pago?.toUpperCase() || 'EFECTIVO')

  // Filas de items
  const itemsHTML = (items || []).map((i, idx) => {
    const nombre  = String(i.nombre || i.nombre_producto || '').substring(0, 24)
    const cant    = i.cantidad
    const precioU = parseFloat(i.precio || i.precio_unitario || 0)
    const sub     = parseFloat(i.subtotal)
    return `
      <tr>
        <td class="td-idx">${idx + 1}</td>
        <td class="td-nombre">${nombre}</td>
        <td class="td-cant">${cant}</td>
        <td class="td-precio">$${precioU.toLocaleString('es-CL', { minimumFractionDigits: 0 })}</td>
        <td class="td-sub">$${sub.toLocaleString('es-CL', { minimumFractionDigits: 0 })}</td>
      </tr>
    `
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Boleta #${String(id).padStart(6,'0')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page { size: 80mm auto; margin: 0; }

    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      width: 80mm;
      max-width: 80mm;
      padding: 4mm 5mm 6mm 5mm;
      background: #fff;
      color: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Header */
    .encabezado    { text-align: center; margin-bottom: 4px; }
    .logo          { font-size: 28px; display: block; margin-bottom: 2px; }
    .nombre-negocio{ font-size: 17px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
    .subtitulo     { font-size: 9px; color: #555; margin-top: 1px; }
    .store-info    { font-size: 9px; color: #444; margin-top: 3px; line-height: 1.5; }
    .doc-title     { font-size: 13px; font-weight: bold; text-transform: uppercase; margin-top: 5px;
                     letter-spacing: 2px; border: 1px solid #000; padding: 2px 8px; display: inline-block; }

    /* Separadores */
    .sep       { border: none; border-top: 1px dashed #000; margin: 4px 0; }
    .sep-doble { border: none; border-top: 2px solid #000;  margin: 4px 0; }
    .sep-simple{ border: none; border-top: 1px solid #000;  margin: 3px 0; }

    /* Info rows */
    .info-row { display: flex; justify-content: space-between; font-size: 10px; margin: 1.5px 0; }
    .info-row .label { color: #555; }
    .info-row .value { font-weight: bold; text-align: right; }

    /* Worker box */
    .worker-box    { background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 4px 6px; margin: 4px 0; }
    .worker-title  { font-size: 8px; text-transform: uppercase; color: #666; margin-bottom: 2px; letter-spacing: 0.5px; }
    .worker-name   { font-size: 11px; font-weight: bold; }
    .worker-puesto { font-size: 9px; color: #444; }

    /* Tabla */
    table { width: 100%; border-collapse: collapse; margin: 4px 0; }
    thead tr { border-bottom: 1px solid #000; }
    thead th { font-size: 8px; font-weight: bold; padding: 2px 1px; text-align: left; text-transform: uppercase; }
    .th-idx, .td-idx   { width: 14px; text-align: center; font-size: 9px; color: #666; }
    .th-cant, .td-cant { text-align: center; width: 18px; }
    .th-precio, .td-precio { text-align: right; width: 54px; }
    .th-sub, .td-sub   { text-align: right; width: 54px; }
    .th-nombre, .td-nombre { text-align: left; max-width: 80px; word-break: break-word; }
    td { font-size: 10px; padding: 2px 1px; vertical-align: top; }
    tbody tr:last-child td { padding-bottom: 4px; }
    tbody tr:nth-child(even) { background: #f9f9f9; }

    /* Totales */
    .totales-block { margin-top: 2px; }
    .total-row     { display: flex; justify-content: space-between; font-size: 10px; margin: 1.5px 0; }
    .total-row.sub { color: #555; }
    .total-row.iva { color: #555; font-style: italic; }
    .total-row.grande { font-size: 16px; font-weight: bold; margin-top: 4px; padding-top: 4px; border-top: 2px solid #000; }
    .total-row.pago   { margin-top: 5px; font-size: 11px; font-weight: bold; }
    .total-row.items  { font-size: 9px; color: #555; margin-bottom: 3px; }

    /* Pie */
    .pie         { text-align: center; margin-top: 8px; font-size: 9px; color: #444; line-height: 1.6; }
    .pie .gracias{ font-size: 12px; font-weight: bold; color: #000; margin-bottom: 2px; }
    .ref-code    { font-family: 'Courier New', monospace; font-size: 9px; color: #555;
                   border: 1px dashed #ccc; border-radius: 3px; padding: 3px 6px;
                   margin-top: 5px; letter-spacing: 1px; display: inline-block; }

    @media print { body { padding: 0 5mm 8mm 5mm; } }
  </style>
</head>
<body>

  <!-- ENCABEZADO -->
  <div class="encabezado">
    <span class="logo">🥖</span>
    <div class="nombre-negocio">Panadería</div>
    <div class="subtitulo">Sistema de Punto de Venta</div>
    <div class="store-info">
      Calle Ejemplo 123 · Santiago, Chile<br>
      Tel: +56 9 1234 5678
    </div>
    <div class="doc-title">Boleta de Venta</div>
  </div>

  <hr class="sep-doble">

  <!-- INFO VENTA -->
  <div class="info-row"><span class="label">N° Boleta:</span><span class="value">#${String(id).padStart(6,'0')}</span></div>
  <div class="info-row"><span class="label">Día:</span><span class="value">${diaStr.charAt(0).toUpperCase() + diaStr.slice(1)}</span></div>
  <div class="info-row"><span class="label">Fecha:</span><span class="value">${fechaStr}</span></div>
  <div class="info-row"><span class="label">Hora:</span><span class="value">${horaStr}</span></div>

  <hr class="sep">

  <!-- TRABAJADOR -->
  <div class="worker-box">
    <div class="worker-title">Atendido por</div>
    <div class="worker-name">${trabajador_nombre || 'N/A'}</div>
    <div class="worker-puesto">📍 Puesto: ${puesto || 'N/A'}</div>
  </div>

  <hr class="sep">

  <!-- TABLA DE PRODUCTOS -->
  <table>
    <thead>
      <tr>
        <th class="th-idx">#</th>
        <th class="th-nombre">Producto</th>
        <th class="th-cant">Ct</th>
        <th class="th-precio">P/U</th>
        <th class="th-sub">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <hr class="sep">

  <!-- TOTALES -->
  <div class="totales-block">
    <div class="total-row items">
      <span>Artículos:</span>
      <span>${cantItems} unid. · ${(items||[]).length} producto${(items||[]).length !== 1 ? 's' : ''}</span>
    </div>
    <hr class="sep-simple">
    <div class="total-row sub">
      <span>Neto (sin IVA):</span>
      <span>$ ${neto.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
    </div>
    <div class="total-row iva">
      <span>IVA (19%):</span>
      <span>$ ${iva.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
    </div>
    <div class="total-row grande">
      <span>TOTAL:</span>
      <span>$ ${totalNum.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
    </div>
    <div class="total-row pago">
      <span>Pago con:</span>
      <span>${metodoIcono}</span>
    </div>
  </div>

  <hr class="sep-doble">

  <!-- PIE -->
  <div class="pie">
    <div class="gracias">¡Gracias por su compra!</div>
    <div>Vuelva pronto · Que tenga un excelente día 😊</div>
    <div style="margin-top:4px;">Este documento no tiene validez tributaria.</div>
    <div class="ref-code">${refCode}</div>
    <div style="margin-top:6px; font-size:8px; color:#888;">
      Impreso el ${fechaStr} a las ${horaStr}
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.addEventListener('afterprint', function() { window.close(); });
      }, 400);
    };
  </script>
</body>
</html>`

  // Abrir en nueva ventana pequeña centrada (tamaño ticket)
  const ancho = 420
  const alto  = 820
  const left = Math.round((window.screen.width - ancho) / 2)
  const top = Math.round((window.screen.height - alto) / 2)

  const ventana = window.open(
    '',
    'boleta_print',
    `width=${ancho},height=${alto},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes`
  )

  if (!ventana) {
    alert('⚠️ El navegador bloqueó la ventana emergente. Por favor permite ventanas emergentes para este sitio e intenta de nuevo.')
    return
  }

  ventana.document.write(html)
  ventana.document.close()
}
