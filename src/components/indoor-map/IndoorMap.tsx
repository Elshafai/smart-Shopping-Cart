import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANDMARKS } from "./landmarks";
import {
  buildGrid,
  findNearestWalkable,
  simplifyPath,
  createPathfindingWorker,
  type Point,
} from "@/lib/pathfinding";
import { RotateCcw, MapPin, Loader2 } from "lucide-react";
import mallMapSrc from "@/assets/mall-map.jpeg";

interface GridCache {
  grid: Uint8Array[];
  scale: number;
  gridW: number;
  gridH: number;
  imgW: number;
  imgH: number;
}

const IndoorMap: React.FC = () => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCacheRef = useRef<GridCache | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fromLandmark, setFromLandmark] = useState<string>("");
  const [toLandmark, setToLandmark] = useState<string>("");
  const lastClickRef = useRef(0);

  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // Load image and build grid once
  useEffect(() => {
    const img = new Image();
    img.src = mallMapSrc;
    img.onload = () => {
      imgRef.current = img;

      const container = containerRef.current;
      if (!container) return;
      const maxW = container.clientWidth;
      const ratio = img.height / img.width;
      const dispW = Math.min(maxW, img.width);
      const dispH = Math.round(dispW * ratio);

      setCanvasSize({ w: dispW, h: dispH });

      // Draw image on bottom canvas
      const imgCanvas = imageCanvasRef.current;
      if (imgCanvas) {
        imgCanvas.width = dispW;
        imgCanvas.height = dispH;
        const ctx = imgCanvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, dispW, dispH);

        // Build grid once from displayed image
        const imageData = ctx.getImageData(0, 0, dispW, dispH);
        const cache = buildGrid(imageData, dispW, dispH);
        gridCacheRef.current = { ...cache, imgW: dispW, imgH: dispH };
      }

      // Setup overlay canvas
      const overlayCanvas = overlayCanvasRef.current;
      if (overlayCanvas) {
        overlayCanvas.width = dispW;
        overlayCanvas.height = dispH;
      }

      setIsLoaded(true);
    };

    // Create worker
    workerRef.current = createPathfindingWorker();

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Draw landmarks on overlay
  const drawLandmarks = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!gridCacheRef.current) return;
      const { imgW, imgH } = gridCacheRef.current;
      LANDMARKS.forEach((lm) => {
        const px = Math.round(lm.xPct * imgW);
        const py = Math.round(lm.yPct * imgH);
        ctx.fillStyle = "hsl(220, 80%, 50%)";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "hsl(0, 0%, 100%)";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(lm.name, px, py - 10);
        // Dark outline for readability
        ctx.strokeStyle = "hsl(0, 0%, 0%)";
        ctx.lineWidth = 0.5;
        ctx.strokeText(lm.name, px, py - 10);
      });
    },
    []
  );

  // Clear overlay and redraw landmarks
  const clearOverlay = useCallback(() => {
    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (!ctx || !canvasSize.w) return;
    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
    drawLandmarks(ctx);
  }, [canvasSize, drawLandmarks]);

  // Draw landmarks when loaded
  useEffect(() => {
    if (isLoaded) clearOverlay();
  }, [isLoaded, clearOverlay]);

  // Run pathfinding
  const runPathfinding = useCallback(
    (start: Point, end: Point) => {
      const cache = gridCacheRef.current;
      const worker = workerRef.current;
      if (!cache || !worker) return;

      setIsCalculating(true);

      // Snap to walkable
      const snappedStart = findNearestWalkable(cache.grid, start, cache.gridH, cache.gridW);
      const snappedEnd = findNearestWalkable(cache.grid, end, cache.gridH, cache.gridW);

      if (!snappedStart || !snappedEnd) {
        setIsCalculating(false);
        return;
      }

      // Convert grid to plain arrays for worker
      const plainGrid = cache.grid.map((row) => Array.from(row));

      worker.onmessage = (e: MessageEvent) => {
        const { path } = e.data as { path: number[][] };
        setIsCalculating(false);

        const ctx = overlayCanvasRef.current?.getContext("2d");
        if (!ctx || path.length === 0) return;

        // Convert grid coords back to pixel coords
        const pixelPath: Point[] = path.map(([x, y]) => ({
          x: x * cache.scale,
          y: y * cache.scale,
        }));

        const smoothed = simplifyPath(pixelPath, 2);

        // Draw path
        ctx.strokeStyle = "hsl(210, 100%, 50%)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(smoothed[0].y, smoothed[0].x);
        for (let i = 1; i < smoothed.length; i++) {
          ctx.lineTo(smoothed[i].y, smoothed[i].x);
        }
        ctx.stroke();
      };

      worker.postMessage({
        grid: plainGrid,
        gridH: cache.gridH,
        gridW: cache.gridW,
        start: [snappedStart.x, snappedStart.y],
        end: [snappedEnd.x, snappedEnd.y],
      });
    },
    []
  );

  // Draw a marker
  const drawMarker = useCallback(
    (point: Point, color: string) => {
      const ctx = overlayCanvasRef.current?.getContext("2d");
      if (!ctx || !gridCacheRef.current) return;
      const { scale } = gridCacheRef.current;
      const px = point.y * scale;
      const py = point.x * scale;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "hsl(0, 0%, 100%)";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    []
  );

  // Handle canvas click with throttle
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isCalculating) return;
      const now = Date.now();
      if (now - lastClickRef.current < 300) return;
      lastClickRef.current = now;

      const cache = gridCacheRef.current;
      if (!cache) return;

      const rect = overlayCanvasRef.current!.getBoundingClientRect();
      const scaleX = canvasSize.w / rect.width;
      const scaleY = canvasSize.h / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX; // pixel col
      const clickY = (e.clientY - rect.top) * scaleY; // pixel row

      const gridPoint: Point = {
        x: Math.round(clickY / cache.scale),
        y: Math.round(clickX / cache.scale),
      };

      if (!startPoint) {
        setStartPoint(gridPoint);
        setFromLandmark("");
        drawMarker(gridPoint, "hsl(140, 70%, 45%)");
      } else if (!endPoint) {
        setEndPoint(gridPoint);
        setToLandmark("");
        drawMarker(gridPoint, "hsl(0, 80%, 55%)");
        runPathfinding(startPoint, gridPoint);
      }
    },
    [startPoint, endPoint, isCalculating, canvasSize, drawMarker, runPathfinding]
  );

  // Handle landmark selection
  const handleLandmarkSelect = useCallback(
    (value: string, type: "from" | "to") => {
      const cache = gridCacheRef.current;
      if (!cache || isCalculating) return;

      const lm = LANDMARKS.find((l) => l.name === value);
      if (!lm) return;

      const gridPoint: Point = {
        x: Math.round((lm.yPct * cache.imgH) / cache.scale),
        y: Math.round((lm.xPct * cache.imgW) / cache.scale),
      };

      if (type === "from") {
        setFromLandmark(value);
        clearOverlay();
        setStartPoint(gridPoint);
        setEndPoint(null);
        drawMarker(gridPoint, "hsl(140, 70%, 45%)");
      } else {
        setToLandmark(value);
        setEndPoint(gridPoint);
        drawMarker(gridPoint, "hsl(0, 80%, 55%)");
        if (startPoint) {
          runPathfinding(startPoint, gridPoint);
        }
      }
    },
    [startPoint, isCalculating, clearOverlay, drawMarker, runPathfinding]
  );

  // Restart
  const handleRestart = useCallback(() => {
    setStartPoint(null);
    setEndPoint(null);
    setFromLandmark("");
    setToLandmark("");
    setIsCalculating(false);
    clearOverlay();
  }, [clearOverlay]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Select value={fromLandmark} onValueChange={(v) => handleLandmarkSelect(v, "from")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="From..." />
            </SelectTrigger>
            <SelectContent>
              {LANDMARKS.map((lm) => (
                <SelectItem key={lm.name} value={lm.name}>
                  {lm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Select value={toLandmark} onValueChange={(v) => handleLandmarkSelect(v, "to")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="To..." />
            </SelectTrigger>
            <SelectContent>
              {LANDMARKS.map((lm) => (
                <SelectItem key={lm.name} value={lm.name}>
                  {lm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={handleRestart}>
          <RotateCcw className="mr-1 h-4 w-4" />
          Restart
        </Button>

        {isCalculating && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating...
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {!startPoint
          ? "Click on the map or select a landmark to set the start point"
          : !endPoint
          ? "Now click or select the destination"
          : "Path displayed! Press Restart to try again."}
      </p>

      {/* Dual-layer canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg border">
        {!isLoaded && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <canvas
          ref={imageCanvasRef}
          className="block w-full"
          style={{ display: isLoaded ? "block" : "none" }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute left-0 top-0 block w-full cursor-crosshair"
          style={{ display: isLoaded ? "block" : "none" }}
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  );
};

export default IndoorMap;
