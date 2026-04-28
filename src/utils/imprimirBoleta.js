/**
 * imprimirBoleta.js
 * Genera e imprime una boleta térmica (80mm) compatible con cualquier impresora pequeña.
 * Usa una ventana emergente con CSS de impresión optimizado.
 */

export function imprimirBoleta(venta) {
  const { id, fecha_hora, total, metodo_pago, trabajador_nombre, puesto, items } = venta

  const fecha = new Date(fecha_hora)
  const fechaStr = fecha.toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
  const horaStr = fecha.toLocaleTimeString('es-PE', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  const linea = '─'.repeat(32)
  const lineaDoble = '═'.repeat(32)

  // Construir filas de items
  const itemsHTML = (items || []).map(i => {
    const nombre = String(i.nombre || i.nombre_producto || '').substring(0, 22)
    const cant = i.cantidad
    const precioU = parseFloat(i.precio || i.precio_unitario || 0).toFixed(2)
    const sub = parseFloat(i.subtotal).toFixed(2)
    return `
      <tr>
        <td class="td-nombre">${nombre}</td>
        <td class="td-cant">${cant}</td>
        <td class="td-precio">S/${precioU}</td>
        <td class="td-sub">S/${sub}</td>
      </tr>
    `
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Boleta #${id}</title>
  <style>
    /* ── Reset & Thermal Print Base ── */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      /* 80mm paper width, auto height */
      size: 80mm auto;
      margin: 0;
    }

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

    /* ── Header ── */
    .encabezado {
      text-align: center;
      margin-bottom: 4px;
    }
    .logo {
      font-size: 26px;
      display: block;
      margin-bottom: 2px;
    }
    .nombre-negocio {
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .subtitulo {
      font-size: 9px;
      color: #444;
      margin-top: 1px;
    }

    /* ── Separadores ── */
    .sep { 
      border: none; 
      border-top: 1px dashed #000; 
      margin: 4px 0; 
    }
    .sep-doble {
      border: none;
      border-top: 2px solid #000;
      margin: 4px 0;
    }

    /* ── Info de venta ── */
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      margin: 1px 0;
    }
    .info-row .label { color: #555; }
    .info-row .value { font-weight: bold; }

    /* ── Tabla de items ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 4px 0;
    }
    thead tr {
      border-bottom: 1px solid #000;
    }
    thead th {
      font-size: 9px;
      font-weight: bold;
      padding: 2px 0;
      text-align: left;
      text-transform: uppercase;
    }
    .th-cant, .td-cant { text-align: center; width: 18px; }
    .th-precio, .td-precio { text-align: right; width: 52px; }
    .th-sub, .td-sub { text-align: right; width: 52px; }
    .th-nombre, .td-nombre { 
      text-align: left; 
      max-width: 100px;
      word-break: break-word;
    }
    td {
      font-size: 10px;
      padding: 2px 0;
      vertical-align: top;
    }
    tbody tr:last-child td {
      padding-bottom: 4px;
    }

    /* ── Total ── */
    .total-block {
      margin-top: 4px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      margin: 1px 0;
    }
    .total-row.grande {
      font-size: 15px;
      font-weight: bold;
      margin-top: 3px;
      padding-top: 3px;
      border-top: 1px solid #000;
    }

    /* ── Pie ── */
    .pie {
      text-align: center;
      margin-top: 6px;
      font-size: 9px;
      color: #444;
      line-height: 1.5;
    }
    .pie .gracias {
      font-size: 11px;
      font-weight: bold;
      color: #000;
      margin-bottom: 2px;
    }

    /* ── Fuerza impresión al abrir ── */
    @media print {
      body { padding: 0 5mm 8mm 5mm; }
    }
  </style>
</head>
<body>

  <!-- ENCABEZADO -->
  <div class="encabezado">
    <span class="logo">🥖</span>
    <div class="nombre-negocio">Panadería</div>
    <div class="subtitulo">Boleta de Venta</div>
  </div>

  <hr class="sep-doble">

  <!-- INFO VENTA -->
  <div class="info-row">
    <span class="label">Boleta N°:</span>
    <span class="value">#${String(id).padStart(6, '0')}</span>
  </div>
  <div class="info-row">
    <span class="label">Fecha:</span>
    <span class="value">${fechaStr}</span>
  </div>
  <div class="info-row">
    <span class="label">Hora:</span>
    <span class="value">${horaStr}</span>
  </div>
  <div class="info-row">
    <span class="label">Atendido por:</span>
    <span class="value">${trabajador_nombre || 'N/A'}</span>
  </div>
  <div class="info-row">
    <span class="label">Puesto:</span>
    <span class="value">${puesto || 'N/A'}</span>
  </div>

  <hr class="sep">

  <!-- TABLA DE PRODUCTOS -->
  <table>
    <thead>
      <tr>
        <th class="th-nombre">Producto</th>
        <th class="th-cant">Ct</th>
        <th class="th-precio">P.Unit</th>
        <th class="th-sub">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <hr class="sep">

  <!-- TOTAL -->
  <div class="total-block">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>S/ ${parseFloat(total).toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>IGV (0%):</span>
      <span>S/ 0.00</span>
    </div>
    <div class="total-row grande">
      <span>TOTAL:</span>
      <span>S/ ${parseFloat(total).toFixed(2)}</span>
    </div>
    <div class="total-row" style="margin-top:4px;">
      <span>Pago con:</span>
      <span>${(metodo_pago || 'efectivo').toUpperCase()}</span>
    </div>
  </div>

  <hr class="sep-doble">

  <!-- PIE -->
  <div class="pie">
    <div class="gracias">¡Gracias por su compra!</div>
    <div>Vuelva pronto 😊</div>
    <div style="margin-top:4px; font-size:8px;">
      ${fechaStr} ${horaStr}
    </div>
  </div>

  <script>
    // Imprime automáticamente al cargar y luego cierra
    window.onload = function() {
      setTimeout(function() {
        window.print();
        // Cierra la ventana después de imprimir (o cancelar)
        window.addEventListener('afterprint', function() {
          window.close();
        });
      }, 400);
    };
  </script>
</body>
</html>`

  // Abrir en nueva ventana pequeña centrada (tamaño ticket)
  const ancho = 400
  const alto = 700
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
