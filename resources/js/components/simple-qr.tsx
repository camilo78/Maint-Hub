import React, { useEffect, useRef } from 'react';

interface SimpleQRProps {
    value: string;
    size?: number;
}

export default function SimpleQR({ value, size = 80 }: SimpleQRProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
            script.onload = () => {
                const QRCode = (window as any).QRCode;
                if (QRCode && canvasRef.current) {
                    QRCode.toCanvas(canvasRef.current, value, {
                        width: size,
                        margin: 2
                    });
                }
            };
            document.head.appendChild(script);
            
            return () => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
            };
        }
    }, [value, size]);

    return (
        <div className="inline-block p-2 bg-white border border-gray-300 rounded">
            <canvas ref={canvasRef} />
        </div>
    );
}