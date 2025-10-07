import React from 'react';

interface MinimalBarcodeProps {
    equipment: {
        asset_tag: string;
        brand: string;
        model: string;
    };
}

export default function MinimalBarcodeDesign({ equipment }: MinimalBarcodeProps) {
    const printMinimalLabel = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Minimal Label - ${equipment.asset_tag}</title>
                        <style>
                            @page { size: 4cm 2.5cm; margin: 0; }
                            @media print { body { margin: 0; } }
                            body { 
                                font-family: 'Courier New', monospace; 
                                margin: 0; 
                                padding: 0; 
                                width: 4cm; 
                                height: 2.5cm; 
                                overflow: hidden;
                            }
                            .tag { 
                                border: 3px double #000; 
                                width: 4cm; 
                                height: 2.5cm; 
                                padding: 2mm; 
                                box-sizing: border-box;
                                display: flex; 
                                flex-direction: column;
                                justify-content: space-between;
                                background: white;
                                text-align: center;
                            }
                            .asset-tag { 
                                font-size: 16px; 
                                font-weight: bold; 
                                letter-spacing: 1px;
                                border: 1px solid #000;
                                padding: 1mm;
                                background: #f0f0f0;
                            }
                            .barcode-area { 
                                flex: 1; 
                                display: flex; 
                                align-items: center; 
                                justify-content: center;
                                margin: 1mm 0;
                            }
                            .brand-info { 
                                font-size: 8px; 
                                font-weight: bold;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="tag">
                            <div class="asset-tag">${equipment.asset_tag}</div>
                            <div class="barcode-area">
                                <svg id="barcode"></svg>
                            </div>
                            <div class="brand-info">${equipment.brand} ${equipment.model}</div>
                        </div>
                        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                        <script>
                            JsBarcode("#barcode", "${equipment.asset_tag}", {
                                format: "CODE128",
                                width: 1.2,
                                height: 20,
                                displayValue: false,
                                margin: 0,
                                background: "#ffffff",
                                lineColor: "#000000"
                            });
                            setTimeout(() => window.print(), 500);
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <button 
            onClick={printMinimalLabel}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
        >
            ▬ Imprimir Minimalista
        </button>
    );
}