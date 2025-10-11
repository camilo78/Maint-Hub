import React from 'react';

interface Equipment {
    id: number;
    asset_tag: string;
    brand: string;
    model: string;
    serial_number: string;
    category: string;
    description?: string;
    location: string;
    status: string;
}

interface BulkQRGeneratorProps {
    equipment: Equipment[];
    clientId?: number;
}

export default function BulkQRGenerator({ equipment }: BulkQRGeneratorProps) {
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

    const printAllQRLabels = () => {
        if (equipment.length === 0) {
            alert('No hay equipos para generar etiquetas QR');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const labelsHtml = equipment.map((item, index) => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Tag:%20${item.asset_tag}%0AMarca:%20${item.brand}%0AModelo:%20${item.model}%0ASerie:%20${item.serial_number}%0ACategor%C3%ADa:%20${item.category}${item.description ? '%0ADescripci%C3%B3n:%20' + encodeURIComponent(item.description) : ''}%0AUbicaci%C3%B3n:%20${item.location || 'No especificada'}%0AEstado:%20${getStatusName(item.status)}%0AURL:%20${window.location.origin}/equipment/${item.id}`;
                    
                    const row = Math.floor(index / 7);
                    const col = index % 7;
                    const topPos = 10 + (row * 45);
                    const leftPos = 10 + (col * 27);
                    
                    return `
                        <div class="tag" style="top: ${topPos}mm; left: ${leftPos}mm;">
                            <div class="qr-section">
                                <img src="${qrUrl}" style="width: 80px; height: 80px;" />
                            </div>
                            <div class="info-section">
                                <div class="text-info">
                                    ${item.asset_tag} | ${item.brand} ${item.model}<br>
                                    Serie: ${item.serial_number} | ${item.category}<br>
                                    ${item.location || 'Sin ubicación'} | ${getStatusName(item.status)}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Etiquetas QR - Lote de ${equipment.length} equipos</title>
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
                            ${labelsHtml}
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
            onClick={printAllQRLabels}
            className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
        >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm2 2V5h1v1h-1zM11 4a1 1 0 100-2 1 1 0 000 2zM11 7a1 1 0 100-2 1 1 0 000 2zM11 10a1 1 0 100-2 1 1 0 000 2zM11 13a1 1 0 100-2 1 1 0 000 2zM11 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            QR Lote
        </button>
    );
}