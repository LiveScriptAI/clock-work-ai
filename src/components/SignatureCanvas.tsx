
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface SignatureCanvasProps {
  onSignatureChange: (isEmpty: boolean) => void;
  width?: number;
  height?: number;
  disabled?: boolean;
  onSignatureCapture?: (signatureData: string | null) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
  width = 320,
  height = 200,
  disabled = false,
  onSignatureCapture,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (context) {
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#000000";
      setCtx(context);
    }
  }, []);

  // Method to get signature as base64 data
  const getSignatureData = (): string | null => {
    if (!canvasRef.current || !hasSignature) return null;
    return canvasRef.current.toDataURL('image/png');
  };

  // Call the onSignatureCapture prop whenever the signature changes
  useEffect(() => {
    if (onSignatureCapture) {
      onSignatureCapture(hasSignature ? getSignatureData() : null);
    }
  }, [hasSignature, onSignatureCapture]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;
    
    ctx.beginPath();
    
    // Handle both mouse and touch events
    const { x, y } = getCoordinates(e);
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;
    
    // Handle both mouse and touch events
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    if (!hasSignature) {
      setHasSignature(true);
      onSignatureChange(false); // Not empty anymore
    }
  };

  const stopDrawing = () => {
    if (disabled) return;
    setIsDrawing(false);
    if (ctx) ctx.closePath();
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const clearSignature = () => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange(true); // Is empty now
    
    if (onSignatureCapture) {
      onSignatureCapture(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-md bg-gray-50 overflow-hidden touch-none"
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`w-full h-full ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-crosshair'}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="self-end" 
        onClick={clearSignature}
        disabled={disabled || !hasSignature}
      >
        <Eraser className="mr-2 h-4 w-4" />
        Clear Signature
      </Button>
    </div>
  );
};

export default SignatureCanvas;
