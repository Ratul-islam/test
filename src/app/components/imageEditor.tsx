"use client";

import { useState, useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaInfoCircle, FaPencilAlt } from "react-icons/fa";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (image: string) => void;
  onCancel: () => void;
}

interface Point {
  x: number;
  y: number;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl,
  onSave,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState<Point[]>([]);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [hasSelection, setHasSelection] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [step, setStep] = useState(1);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;

      const maxWidth = window.innerWidth > 768 ? 600 : window.innerWidth - 40;
      const maxHeight = window.innerHeight * 0.7;
      let { width, height } = img;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height *= ratio;
      }

      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width *= ratio;
      }

      setCanvasWidth(width);
      setCanvasHeight(height);
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate and set fixed container height on initial render
  useEffect(() => {
    if (imageLoaded && containerRef.current) {
      // Set a timeout to ensure all elements are rendered
      setTimeout(() => {
        if (containerRef.current) {
          const height = containerRef.current.offsetHeight;
          setContainerHeight(height);
        }
      }, 100);
    }
  }, [imageLoaded]);

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight);
  }, [imageLoaded, canvasWidth, canvasHeight]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top,
      };
    }

    const event = e as React.MouseEvent;
    const { clientX, clientY, nativeEvent } = event;
    return {
      offsetX:
        "offsetX" in nativeEvent ? nativeEvent.offsetX : clientX - rect.left,
      offsetY:
        "offsetY" in nativeEvent ? nativeEvent.offsetY : clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setShowTutorial(false);
    const { offsetX, offsetY } = getCoordinates(e);
    setPath([{ x: offsetX, y: offsetY }]);
    setIsDrawing(true);
    setHasSelection(false);
    setStep(2);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const { offsetX, offsetY } = getCoordinates(e);
    setPath((prev) => [...prev, { x: offsetX, y: offsetY }]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#7058F6";
    ctx.lineCap = "round";

    path.forEach((pt, i) => {
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    });
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    path.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#7058F6";
      ctx.fill();
    });
  };

  const finishDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);

    if (path.length < 3) return;
    setPath((prev) => [...prev, prev[0]]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    path.forEach((pt, i) => {
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    });
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    ctx.beginPath();
    path.forEach((pt, i) => {
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    });
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#7058F6";
    ctx.stroke();

    setHasSelection(true);
    setStep(3);
  };

  const saveSelection = () => {
    if (path.length < 3) {
      onSave(imageUrl);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current) return;

    const temp = document.createElement("canvas");
    temp.width = canvasWidth;
    temp.height = canvasHeight;
    const tctx = temp.getContext("2d");
    if (!tctx) return;

    tctx.beginPath();
    path.forEach((pt, i) => {
      if (i === 0) {
        tctx.moveTo(pt.x, pt.y);
      } else {
        tctx.lineTo(pt.x, pt.y);
      }
    });
    tctx.closePath();
    tctx.clip();
    tctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight);

    try {
      onSave(temp.toDataURL("image/png"));
    } catch {
      onSave(imageUrl);
    }
  };

  const resetSelection = () => {
    setPath([]);
    setHasSelection(false);
    setStep(1);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx && imageRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isDrawing) finishDrawing(e);
  };

  if (!imageLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="bg-white rounded-xl p-4 max-w-[95vw] max-h-[95vh] flex flex-col items-center justify-center">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-500 mb-4"
            role="status"
          />
          <h3 className="text-xl font-semibold text-center">
            Loading image editor...
          </h3>
        </div>
      </div>
    );
  }

  const getTutorialContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10 pointer-events-none p-4">
            <div className="bg-white rounded-xl p-5 max-w-sm text-center pointer-events-auto">
              <FaPencilAlt className="mx-auto mb-3 text-blue-600 text-2xl" />
              <h4 className="text-lg font-bold mb-2">
                Step 1: Draw Your Selection
              </h4>
              <p className="mb-3">
                Click and drag to trace around the area of the design you want to
                keep.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Everything outside your selection will be removed.
              </p>
              <button
                onClick={() => setShowTutorial(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-3 shadow-lg z-10 pointer-events-none">
            <h4 className="text-base font-bold mb-1">Selection Complete!</h4>
            <p className="text-sm">
              Click &quot;Done&quot; to apply your selection or &quot;Reset&quot; to
              start over.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div ref={containerRef} className="bg-white rounded-xl p-4 max-w-[95vw] max-h-[95vh] flex flex-col" style={{ minHeight: containerHeight || 'auto' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold tracking-wide">
            Edit Tattoo Design
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-black transition-colors"
            aria-label="Close editor"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        <div className="text-center mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-2">
          <FaInfoCircle className="text-blue-600 flex-shrink-0" />
          <p className="text-blue-800 text-sm">
            Draw around the area you want to keep. The highlighted area will be
            used on the 3D model.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-gray-200 mb-4">
          {showTutorial && getTutorialContent()}
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={finishDrawing}
            onMouseLeave={handleMouseLeave}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={finishDrawing}
            className="touch-none"
            style={{
              width: canvasWidth || "auto",
              height: canvasHeight || "auto",
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={resetSelection}
            className="flex-1 w-full px-4 py-2 text-base tracking-wide flex items-center justify-center gap-2 bg-transparent text-black rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-gray-300"
          >
            Reset Selection
          </button>
          <button
            onClick={saveSelection}
            disabled={path.length < 3 && !hasSelection}
            className={`flex-1 w-full px-4 py-2 text-base tracking-wide flex items-center justify-center gap-2 rounded-xl transition-colors duration-300 ${
              path.length >= 3 || hasSelection
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {hasSelection ? "Done" : "Use Full Image"}
          </button>
        </div>

        <div className={`mt-4 text-sm text-gray-600 border-t border-gray-200 pt-3 ${(!hasSelection && path.length === 0) ? 'block' : 'invisible'}`}>
          <h4 className="font-semibold mb-1">Tips:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Draw a closed shape around the part of the image you want to keep
            </li>
            <li>Click &quot;Reset&quot; if you make a mistake</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;