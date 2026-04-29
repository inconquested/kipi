"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";
import { Camera, StopCircle } from "lucide-react";

export interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function QRScanner({ onScan, onError, disabled }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current || disabled) return;

    try {
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        onError?.("No camera found");
        return;
      }

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          // Stop scanning once we get a result to prevent multiple triggers
          stopScanning();
          onScan(result.data);
        },
        {
          onDecodeError: (error) => {
            // QrScanner throws errors constantly when no QR is in frame, 
            // so we typically ignore them or only log them.
            if (error !== "No QR code found") {
                console.debug("QR Error:", error);
            }
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      onError?.("Failed to access camera");
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-lg overflow-hidden flex items-center justify-center">
        {/* Video element for the scanner */}
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover"
          style={{ display: isScanning ? 'block' : 'none' }}
        ></video>
        
        {!isScanning && (
          <div className="absolute flex flex-col items-center text-muted-foreground">
            <Camera className="w-12 h-12 mb-2 opacity-20" />
            <p>Camera is off</p>
          </div>
        )}
      </div>

      <div className="flex justify-center w-full">
        {!isScanning ? (
          <Button 
            onClick={startScanning} 
            disabled={disabled}
            className="w-full max-w-sm"
          >
            <Camera className="w-4 h-4 mr-2" />
            Start Scanner
          </Button>
        ) : (
          <Button 
            onClick={stopScanning} 
            variant="destructive"
            className="w-full max-w-sm"
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Stop Scanner
          </Button>
        )}
      </div>
    </div>
  );
}
