'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CameraOff } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (scannedCode: string) => void;
}

declare global {
    interface Window {
        ZXing: any;
    }
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [error, setError] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<any>(null);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    console.log('[Scanner] useEffect iniciado.');
    let animationFrameId: number;

    const startScanner = async () => {
      if (typeof window.ZXing === 'undefined') {
        console.error('[Scanner] La librería ZXing no está cargada.');
        setError('La librería de escaneo no se pudo cargar. Refresca la página.');
        setHasCameraPermission(false);
        return;
      }
      
      console.log('[Scanner] ZXing cargado. Creando BrowserMultiFormatReader.');
      codeReaderRef.current = new window.ZXing.BrowserMultiFormatReader();

      try {
        console.log('[Scanner] Solicitando acceso a la cámara...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        setHasCameraPermission(true);
        console.log('[Scanner] Acceso a la cámara concedido.');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const videoElement = videoRef.current;
        if (videoElement) {
          const scanFrame = () => {
            if (videoElement && codeReaderRef.current && videoElement.readyState >= 2) { 
              try {
                const result = codeReaderRef.current.decodeFromVideoElement(videoElement);
                if (result && result.text) {
                  console.log('[Scanner] Código de barras detectado:', result.text);
                  onScanRef.current(result.text);
                  return; 
                }
              } catch (err) {
                // console.log('[Scanner] No se encontró código de barras en el frame.');
              }
            }
            animationFrameId = requestAnimationFrame(scanFrame);
          };

          const handleCanPlay = () => {
            console.log('[Scanner] Evento "canplay" disparado. Reproduciendo video e iniciando escaneo.');
            videoElement.play().catch(e => {
                console.error("[Scanner] Error al reproducir el video:", e);
                setError("No se pudo iniciar la cámara. Inténtalo de nuevo.");
                setHasCameraPermission(false);
            });
            scanFrame();
          };

          videoElement.addEventListener('canplay', handleCanPlay, { once: true });
        }

      } catch (err) {
        console.error('[Scanner] Error al acceder a la cámara:', err);
        setError('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
        setHasCameraPermission(false);
      }
    };

    startScanner();

    return () => {
      console.log('[Scanner] Limpiando useEffect...');
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        console.log('[Scanner] Stream de cámara detenido.');
      }
      if (videoRef.current) {
        videoRef.current.pause();
        const srcObject = videoRef.current.srcObject;
        if (srcObject instanceof MediaStream) {
            srcObject.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
        console.log('[Scanner] Elemento de video limpiado.');
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-1/2 border-4 border-dashed border-primary rounded-lg opacity-75"></div>
        </div>
      </div>

      {hasCameraPermission === false && (
        <Alert variant="destructive" className="mt-4">
          <CameraOff className="h-4 w-4" />
          <AlertTitle>Error de Cámara</AlertTitle>
          <AlertDescription>
            {error || "No se pudo acceder a la cámara. Revisa los permisos."}
          </AlertDescription>
        </Alert>
      )}

      {hasCameraPermission === true && !error && (
        <p className="text-muted-foreground text-center mt-4">
          Apunta la cámara al código de barras del producto.
        </p>
      )}
    </div>
  );
}
