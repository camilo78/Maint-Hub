import React from 'react';

interface QRLabelProps {
    equipment: {
        asset_tag?: string;
        brand: string;
        model: string;
        serial_number: string;
        category: string;
        description?: string;
        location: string;
        status: string;
        id: number;
    };
}

export default function QRLabelDesign({ equipment }: QRLabelProps) {
    const getStatusName = (status: string) => {
        switch(status) {
            case 'activo': return 'Activo';
            case 'inactivo': return 'Inactivo';
            case 'en_reparacion': return 'En Reparación';
            case 'buen_estado': return 'Buen Estado';
            case 'mal_estado': return 'Mal Estado';
            case 'dañado': return 'Dañado';
            default: return status;
        }
    };

    const printQRLabel = () => {
        if (!equipment.asset_tag) return;
        const qrData = `Tag: ${equipment.asset_tag}\nMarca: ${equipment.brand}\nModelo: ${equipment.model}\nSerie: ${equipment.serial_number}\nCategoría: ${equipment.category}${equipment.description ? '\nDescripción: ' + equipment.description : ''}\nUbicación: ${equipment.location}\nEstado: ${getStatusName(equipment.status)}\nURL: ${window.location.origin}/equipment/${equipment.id}`;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Label - ${equipment.asset_tag}</title>
                        <style>
                            @page { size: letter; margin: 0; }
                            @media print { body { margin: 0; } }
                            body { 
                                font-family: 'Arial', sans-serif; 
                                margin: 0; 
                                padding: 0; 
                                background: white;
                            }
                            .tag { 
                                width: 2.5cm; 
                                height: 4cm; 
                                padding: 1mm; 
                                box-sizing: border-box;
                                display: flex;
                                flex-direction: column;
                                background: white;
                                position: absolute;
                                top: 10mm;
                                left: 10mm;
                                border: 1px solid #ddd;
                            }
                            .qr-section { 
                                flex: 1;
                                display: flex; 
                                align-items: center; 
                                justify-content: center;
                                margin-bottom: 0.5mm;
                            }
                            .info-section { 
                                text-align: center;
                                border-top: 1px solid #ccc;
                                padding-top: 0.5mm;
                            }
                            .text-info { 
                                font-size: 7px; 
                                line-height: 1.0;
                                color: #333;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="tag">
                            <div class="qr-section">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Tag:%20${equipment.asset_tag || 'N/A'}%0AMarca:%20${equipment.brand}%0AModelo:%20${equipment.model}%0ASerie:%20${equipment.serial_number}%0ACategor%C3%ADa:%20${equipment.category}${equipment.description ? '%0ADescripci%C3%B3n:%20' + encodeURIComponent(equipment.description) : ''}%0AUbicaci%C3%B3n:%20${equipment.location}%0AEstado:%20${getStatusName(equipment.status)}%0AURL:%20${window.location.origin}/equipment/${equipment.id}" style="width: 80px; height: 80px;" />
                            </div>
                            <div class="info-section">
                                <div class="text-info">
                                    ${equipment.asset_tag || 'N/A'} | ${equipment.brand} ${equipment.model}<br>
                                    Serie: ${equipment.serial_number} | ${equipment.category}<br>
                                    ${equipment.location} | ${getStatusName(equipment.status)}
                                </div>
                            </div>
                        </div>
                        <script>
                            setTimeout(() => window.print(), 1500);
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <button 
            onClick={printQRLabel}
            className="w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 border border-gray-600 dark:border-gray-500"
        >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm2 2V5h1v1h-1zM11 4a1 1 0 100-2 1 1 0 000 2zM11 7a1 1 0 100-2 1 1 0 000 2zM11 10a1 1 0 100-2 1 1 0 000 2zM11 13a1 1 0 100-2 1 1 0 000 2zM11 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Imprimir QR
        </button>
    );
}