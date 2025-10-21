{{--
    PLANTILLA DE FACTURA PDF - VERSIÓN OPTIMIZADA PARA PÁGINA ÚNICA
    ===============================================================
    Mejoras clave para la exportación a PDF:
    - @page Rule: Define márgenes estándar (1.5cm) para impresión en tamaño carta.
    - Layout Compacto: Se han reducido los espacios verticales para asegurar que todo el contenido quepa en una sola página.
    - Ancho de Columnas Robusto: Se utilizan clases CSS con porcentajes exactos para las columnas de la tabla, garantizando consistencia.
    - Word Wrap: La columna de descripción ahora previene desbordamientos de texto largo, una mejora crucial para la compatibilidad.
    - Diseño Refinado: Estilo minimalista y profesional, centrado en la máxima legibilidad.
--}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura {{ $factura->numero_factura }}</title>
    <style>
        /* ============================================
           1. CONFIGURACIÓN DE PÁGINA Y VARIABLES
           ============================================ */
        :root {
            --color-primary: #D10000;
            --color-dark: #212529;
            --color-text: #343a40;
            --color-muted: #6c757d;
            --color-border: #ced4da;
            --color-background: #ffffff;
            --color-table-header-bg: #343a40;
            --font-family-sans: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            --font-size-sm: 7.5pt;
            --font-size-base: 9pt;
            --font-size-md: 10pt;
            --font-size-lg: 12pt;
            --font-size-xl: 16pt;
        }

        @page {
            /* Márgenes para la página tamaño carta, clave para PDF */
            margin: 1cm !important;
            size: letter;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: var(--font-family-sans);
            font-size: var(--font-size-base);
            line-height: 1.3;
            color: var(--color-text);
        }

        /* ============================================
           2. LAYOUT Y COMPONENTES PRINCIPALES
           ============================================ */
       .header {
            /* Clave para eliminar espacios indeseados entre elementos inline-block */
            font-size: 0;
            margin-bottom: 12px;
        }
        .company-info, .invoice-box {
            /* Clave: Trata los divs como bloques en una misma línea */
            display: inline-block;
            
            /* Clave: Alinea los elementos por su borde superior */
            vertical-align: top;

            /* Restaura el tamaño de fuente que el padre reseteó */
            font-size: 9pt; /* Asegúrate que coincida con --font-size-base */
        }
        .company-info { width: 65%; }
        .company-name {
            font-size: var(--font-size-lg);
            font-weight: bold;
            color: var(--color-dark);
        }
        .company-details p {
            font-size: var(--font-size-base);
            margin-bottom: 1px;
        }
        .invoice-box {
            width: 33%;
            border: 1px solid var(--color-border);
            text-align: center;
        }
        .invoice-header {
            background-color: var(--color-dark);
            color: var(--color-background);
            padding: 6px;
        }
        .invoice-header h2 { font-size: var(--font-size-md); }
        .invoice-number {
            padding: 8px;
            font-size: var(--font-size-xl);
            font-weight: bold;
            color: var(--color-primary);
        }

        .data-section {
            display: flex;
            justify-content: space-between;
            border: 1px solid var(--color-border);
            padding: 10px;
            margin-bottom: 12px;
        }
        .data-line { margin-bottom: 3px; }
        .data-label { font-weight: bold; display: inline-block; width: 75px; }

        /* ============================================
           3. TABLA DE DETALLES (COLUMNAS OPTIMIZADAS)
           ============================================ */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .items-table th {
            background-color: var(--color-table-header-bg);
            color: var(--color-background);
            font-size: var(--font-size-sm);
            padding: 6px;
            text-align: center;
            border-bottom: 2px solid var(--color-dark);
        }
        .items-table td {
            padding: 5px 6px;
            border-bottom: 1px solid var(--color-border);
            font-size: var(--font-size-base);
            vertical-align: top;
        }
        .items-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
        
        /* Definición de anchos de columna para compatibilidad total */
        .col-w-7 { width: 7%; text-align: center; }
        .col-w-8 { width: 8%; text-align: center; }
        .col-w-12 { width: 12%; text-align: right; }
        .col-w-15 { width: 15%; text-align: right; font-weight: bold; }
        .col-w-46 { 
            width: 46%; 
            /* Clave para compatibilidad: evita que texto largo rompa el layout */
            word-wrap: break-word; 
        }

        /* ============================================
           4. SECCIÓN DE TOTALES Y PIE DE PÁGINA
           ============================================ */
        .summary-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .notes-section { flex-grow: 1; margin-right: 12px; }
        .notes-box {
            border: 1px solid var(--color-border);
            padding: 8px;
            min-height: 70px; /* Altura ajustada */
            font-size: var(--font-size-base);
        }

        .totals-section {
            width: 280px;
            border: 1px solid var(--color-dark);
        }
        .total-line {
            display: flex;
            justify-content: space-between;
            padding: 6px 8px;
            border-bottom: 1px solid var(--color-border);
        }
        .total-line:last-child { border-bottom: none; }
        .total-line.grand-total {
            background-color: var(--color-primary);
            color: var(--color-background);
            font-weight: bold;
            font-size: var(--font-size-md);
        }

        .signatures-section {
            display: flex;
            justify-content: space-around;
            margin-top: 40px; /* Espacio reducido */
        }
        .signature-block { text-align: center; width: 220px; }
        .signature-line {
            padding-top: 40px;
            border-top: 1px solid var(--color-dark);
            font-size: var(--font-size-sm);
            font-weight: bold;
        }
        
        footer {
            position: fixed;
            bottom: -20px; /* Posicionamiento ajustado */
            left: 0;
            right: 0;
            text-align: center;
            font-size: 7pt;
            color: var(--color-muted);
        }

        .void-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 90pt; /* Tamaño ajustado */
            color: rgba(0, 0, 0, 0.04);
            font-weight: bold;
            z-index: -1000;
        }
    </style>
</head>
<body>
    @if($factura->estado === 'ANULADA')
        <div class="void-watermark">ANULADA</div>
    @endif

    <header class="header">
        <div class="company-info">
            <h1 class="company-name">{{ strtoupper($factura->caiAutorizacion->nombre_comercial) }}</h1>
            <div class="company-details">
                <p><strong>RTN:</strong> {{ $factura->caiAutorizacion->rtn_emisor }}</p>
                <p>Aca va la dirección de la empresa</p>
                <p><strong>CAI:</strong> {{ $factura->cai }}</p>
                <p><strong>RANGO AUTORIZADO:</strong> {{ $factura->caiAutorizacion->prefijo }}-{{ str_pad($factura->caiAutorizacion->rango_inicial, 8, '0', STR_PAD_LEFT) }} AL {{ str_pad($factura->caiAutorizacion->rango_final, 8, '0', STR_PAD_LEFT) }}</p>
                <p><strong>FECHA LÍMITE:</strong> {{ $factura->fecha_limite_emision->format('d/m/Y') }}</p>
            </div>
        </div>
        <div class="invoice-box">
            <div class="invoice-header"><h2>FACTURA</h2></div>
            <div class="invoice-number">{{ $factura->numero_factura }}</div>
        </div>
    </header>

    <section class="data-section">
        <div style="width: 60%;">
            <div class="data-line"><span class="data-label">CLIENTE:</span><span>{{ strtoupper($factura->cliente_nombre) }}</span></div>
            <div class="data-line"><span class="data-label">RTN/DNI:</span><span>{{ $factura->cliente_rtn }}</span></div>
        </div>
        <div style="width: 38%; text-align: right;">
            <p><strong>FECHA:</strong> {{ $factura->fecha_emision->format('d/m/Y') }}</p>
            <p><strong>PAGO:</strong> {{ $factura->tipo_pago }}</p>
        </div>
    </section>

    <table class="items-table">
        <thead>
            <tr>
                <th class="col-w-7">CANT.</th>
                <th class="col-w-8">U/M</th>
                <th class="col-w-46" style="text-align: left;">DESCRIPCIÓN</th>
                <th class="col-w-12">P. UNIT.</th>
                <th class="col-w-8">ISV %</th>
                <th class="col-w-15">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            @foreach($factura->detalles as $detalle)
            <tr>
                <td class="col-w-7">{{ number_format($detalle->cantidad, 2) }}</td>
                <td class="col-w-8">{{ $detalle->unidad_medida }}</td>
                <td class="col-w-46">{{ $detalle->descripcion }}</td>
                <td class="col-w-12">{{ number_format($detalle->precio_unitario, 2) }}</td>
                <td class="col-w-8">
                    @if($detalle->tipo_gravamen === 'GRAVADO_15') 15 @elseif($detalle->tipo_gravamen === 'GRAVADO_18') 18 @else EX @endif
                </td>
                <td class="col-w-15">{{ number_format($detalle->total_linea, 2) }}</td>
            </tr>
            @endforeach
            {{-- Rellenar hasta 12 líneas para mantener un alto consistente --}}
            @for($i = 0; $i < max(0, 12 - count($factura->detalles)); $i++)
            <tr>
                <td>&nbsp;</td> <td>&nbsp;</td> <td>&nbsp;</td> <td>&nbsp;</td> <td>&nbsp;</td> <td>&nbsp;</td>
            </tr>
            @endfor
        </tbody>
    </table>

    <section class="summary-section">
        <div class="notes-section">
            <div class="notes-box">
                <p><strong>SON:</strong> {{ strtoupper($factura->total_en_letras) }}</p>
            </div>
        </div>
        <div class="totals-section">
            <div class="total-line"><span>SUBTOTAL:</span><span>L {{ number_format($factura->subtotal_exento + $factura->subtotal_gravado_15 + $factura->subtotal_gravado_18, 2) }}</span></div>
            <div class="total-line"><span>ISV 15%:</span><span>L {{ number_format($factura->isv_15, 2) }}</span></div>
            <div class="total-line"><span>ISV 18%:</span><span>L {{ number_format($factura->isv_18, 2) }}</span></div>
            <div class="total-line grand-total"><span>TOTAL A PAGAR:</span><span>L {{ number_format($factura->total_a_pagar, 2) }}</span></div>
        </div>
    </section>

    <section class="signatures-section">
        <div class="signature-block">
            <div class="signature-line">RECIBÍ CONFORME</div>
        </div>
        <div class="signature-block">
            <div class="signature-line">ENTREGADO POR</div>
        </div>
    </section>

    <footer>
        <p>Representación impresa de la factura electrónica | Autorizada por SAR</p>
    </footer>
</body>
</html>