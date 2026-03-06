import { Button } from "@/components/ui/button";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import type { DiseaseResult } from "../backend.d.ts";

interface GraphNode {
  id: string;
  label: string;
  type: "disease" | "pathway" | "protein" | "drug";
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface TooltipInfo {
  x: number;
  y: number;
  label: string;
  type: string;
  extra?: string;
}

const NODE_COLORS: Record<GraphNode["type"], { fill: string; glow: string }> = {
  disease: { fill: "#e040fb", glow: "rgba(224,64,251,0.6)" },
  pathway: { fill: "#00e5ff", glow: "rgba(0,229,255,0.5)" },
  protein: { fill: "#69ff47", glow: "rgba(105,255,71,0.5)" },
  drug: { fill: "#ffd740", glow: "rgba(255,215,64,0.5)" },
};

const NODE_RADII: Record<GraphNode["type"], number> = {
  disease: 28,
  pathway: 18,
  protein: 13,
  drug: 10,
};

function truncateLabel(s: string, maxLen: number) {
  return s.length > maxLen ? `${s.slice(0, maxLen - 2)}…` : s;
}

interface NetworkGraphProps {
  data: DiseaseResult;
}

export function NetworkGraph({ data }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<TooltipInfo | null>(null);
  const tooltipDivRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const animRef = useRef<number>(0);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragNodeRef = useRef<GraphNode | null>(null);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const isPanningRef = useRef(false);

  const buildGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cx = w / 2;
    const cy = h / 2;

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Disease node (center)
    nodes.push({
      id: "disease",
      label: data.diseaseName,
      type: "disease",
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      radius: NODE_RADII.disease,
      color: NODE_COLORS.disease.fill,
      glowColor: NODE_COLORS.disease.glow,
    });

    // Pathways (ring around disease)
    const pathwayCount = Math.min(data.pathways.length, 8);
    for (let i = 0; i < pathwayCount; i++) {
      const p = data.pathways[i];
      const angle = (i / pathwayCount) * Math.PI * 2 - Math.PI / 2;
      const r = 160;
      nodes.push({
        id: `pathway_${p.id}`,
        label: p.name,
        type: "pathway",
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 10,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 10,
        vx: 0,
        vy: 0,
        radius: NODE_RADII.pathway,
        color: NODE_COLORS.pathway.fill,
        glowColor: NODE_COLORS.pathway.glow,
      });
      edges.push({ source: "disease", target: `pathway_${p.id}` });
    }

    // Proteins (outer ring)
    const proteinCount = Math.min(data.proteins.length, 12);
    for (let i = 0; i < proteinCount; i++) {
      const prot = data.proteins[i];
      const angle =
        (i / proteinCount) * Math.PI * 2 - Math.PI / 2 + Math.PI / proteinCount;
      const r = 280;
      nodes.push({
        id: `protein_${prot.id}`,
        label: prot.name,
        type: "protein",
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        radius: NODE_RADII.protein,
        color: NODE_COLORS.protein.fill,
        glowColor: NODE_COLORS.protein.glow,
      });

      // Connect to pathway if same pathway ID
      const linkedPathway = data.pathways.find(
        (pw) => pw.id === prot.pathwayId,
      );
      if (
        linkedPathway &&
        nodes.find((n) => n.id === `pathway_${linkedPathway.id}`)
      ) {
        edges.push({
          source: `pathway_${linkedPathway.id}`,
          target: `protein_${prot.id}`,
        });
      } else if (pathwayCount > 0) {
        // Connect to nearest pathway
        const pidx = i % pathwayCount;
        edges.push({
          source: `pathway_${data.pathways[pidx].id}`,
          target: `protein_${prot.id}`,
        });
      }
    }

    // Drugs (outermost)
    const drugCount = Math.min(data.drugs.length, 10);
    for (let i = 0; i < drugCount; i++) {
      const drug = data.drugs[i];
      const angle = (i / drugCount) * Math.PI * 2 + Math.PI / drugCount;
      const r = 380;
      nodes.push({
        id: `drug_${drug.id}`,
        label: drug.name,
        type: "drug",
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 25,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 25,
        vx: 0,
        vy: 0,
        radius: NODE_RADII.drug,
        color: NODE_COLORS.drug.fill,
        glowColor: NODE_COLORS.drug.glow,
      });

      // Connect to protein
      const linkedProtein = data.proteins.find(
        (p) => p.id === drug.targetProteinId,
      );
      if (
        linkedProtein &&
        nodes.find((n) => n.id === `protein_${linkedProtein.id}`)
      ) {
        edges.push({
          source: `protein_${linkedProtein.id}`,
          target: `drug_${drug.id}`,
        });
      } else if (proteinCount > 0) {
        const pidx = i % proteinCount;
        edges.push({
          source: `protein_${data.proteins[pidx].id}`,
          target: `drug_${drug.id}`,
        });
      } else if (pathwayCount > 0) {
        const pidx = i % pathwayCount;
        edges.push({
          source: `pathway_${data.pathways[pidx].id}`,
          target: `drug_${drug.id}`,
        });
      }
    }

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [data]);

  const applyForces = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const REPEL = 3500;
    const ATTRACT = 0.012;
    const DAMPING = 0.88;
    const MIN_DIST = 5;

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || MIN_DIST;
        const force = REPEL / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const src = nodes.find((n) => n.id === edge.source);
      const tgt = nodes.find((n) => n.id === edge.target);
      if (!src || !tgt) continue;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || MIN_DIST;
      const ideal =
        src.type === "disease" && tgt.type === "pathway"
          ? 160
          : src.type === "pathway" && tgt.type === "protein"
            ? 140
            : 110;
      const force = (dist - ideal) * ATTRACT;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      src.vx += fx;
      src.vy += fy;
      tgt.vx -= fx;
      tgt.vy -= fy;
    }

    // Apply velocities
    const canvas = canvasRef.current;
    if (!canvas) return;

    for (const node of nodes) {
      if (node.id === "disease") continue; // disease stays centered
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;
    }
  }, []);

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x: tx, y: ty, scale } = transformRef.current;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    // Draw edges
    for (const edge of edges) {
      const src = nodes.find((n) => n.id === edge.source);
      const tgt = nodes.find((n) => n.id === edge.target);
      if (!src || !tgt) continue;

      // Determine edge style based on relationship type
      let lineWidth = 2;
      let alpha = 0.7;
      if (src.type === "disease" && tgt.type === "pathway") {
        lineWidth = 3;
        alpha = 0.9;
      } else if (src.type === "pathway" && tgt.type === "protein") {
        lineWidth = 2.5;
        alpha = 0.8;
      } else if (src.type === "protein" && tgt.type === "drug") {
        lineWidth = 2;
        alpha = 0.75;
      }

      // Glow pass (wider, semi-transparent)
      const glowGradient = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
      glowGradient.addColorStop(
        0,
        src.glowColor.replace(/[\d.]+\)$/, `${alpha * 0.5})`),
      );
      glowGradient.addColorStop(
        1,
        tgt.glowColor.replace(/[\d.]+\)$/, `${alpha * 0.4})`),
      );
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.strokeStyle = glowGradient;
      ctx.lineWidth = lineWidth + 4;
      ctx.stroke();

      // Core line pass (sharp, bright)
      const coreGradient = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
      coreGradient.addColorStop(
        0,
        `${src.color}${Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      coreGradient.addColorStop(
        1,
        `${tgt.color}${Math.round(alpha * 0.85 * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.strokeStyle = coreGradient;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Arrowhead at target node edge
      const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
      const arrowLen = 10;
      const arrowWidth = 0.45;
      const ax = tgt.x - Math.cos(angle) * (tgt.radius + 3);
      const ay = tgt.y - Math.sin(angle) * (tgt.radius + 3);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(
        ax - Math.cos(angle - arrowWidth) * arrowLen,
        ay - Math.sin(angle - arrowWidth) * arrowLen,
      );
      ctx.lineTo(
        ax - Math.cos(angle + arrowWidth) * arrowLen,
        ay - Math.sin(angle + arrowWidth) * arrowLen,
      );
      ctx.closePath();
      ctx.fillStyle = `${tgt.color}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.fill();
    }

    // Draw nodes
    for (const node of nodes) {
      // Glow
      const glow = ctx.createRadialGradient(
        node.x,
        node.y,
        node.radius * 0.5,
        node.x,
        node.y,
        node.radius * 2.5,
      );
      glow.addColorStop(0, node.glowColor);
      glow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      const radialGrad = ctx.createRadialGradient(
        node.x - node.radius * 0.3,
        node.y - node.radius * 0.3,
        0,
        node.x,
        node.y,
        node.radius,
      );
      radialGrad.addColorStop(0, `${node.color}cc`);
      radialGrad.addColorStop(1, `${node.color}88`);
      ctx.fillStyle = radialGrad;
      ctx.fill();
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      const maxChars =
        node.type === "disease"
          ? 16
          : node.type === "pathway"
            ? 14
            : node.type === "protein"
              ? 12
              : 11;
      const label = truncateLabel(node.label, maxChars);
      const fontSize =
        node.type === "disease" ? 13 : node.type === "pathway" ? 11 : 10;
      ctx.font = `700 ${fontSize}px 'Inter', 'Sora', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const labelY = node.y + node.radius + 13;
      const textWidth = ctx.measureText(label).width;
      const padX = 5;
      const padY = 3;

      // Dark pill background for contrast
      ctx.beginPath();
      ctx.roundRect(
        node.x - textWidth / 2 - padX,
        labelY - fontSize / 2 - padY,
        textWidth + padX * 2,
        fontSize + padY * 2,
        4,
      );
      ctx.fillStyle = "rgba(4, 6, 20, 0.78)";
      ctx.fill();

      // Text shadow (glow)
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 6;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, node.x, labelY);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cvs = canvas;
    function resizeCanvas() {
      const parent = cvs.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;
      const ctx2 = cvs.getContext("2d");
      if (ctx2) ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    const parent = canvas.parentElement;
    resizeCanvas();

    if (parent) resizeObserver.observe(parent);

    buildGraph();

    let tick = 0;
    function loop() {
      if (tick < 200) {
        applyForces();
        tick++;
      }
      drawGraph();
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      resizeObserver.disconnect();
    };
  }, [buildGraph, applyForces, drawGraph]);

  // Mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function getCanvasPos(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const { x: tx, y: ty, scale } = transformRef.current;
      return {
        x: (e.clientX - rect.left - tx) / scale,
        y: (e.clientY - rect.top - ty) / scale,
      };
    }

    function findNodeAt(cx: number, cy: number) {
      return nodesRef.current.find((n) => {
        const dx = n.x - cx;
        const dy = n.y - cy;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
      });
    }

    function onMouseMove(e: MouseEvent) {
      const { x: cx, y: cy } = getCanvasPos(e);
      const rect = canvas!.getBoundingClientRect();

      if (dragNodeRef.current) {
        dragNodeRef.current.x = cx;
        dragNodeRef.current.y = cy;
        dragNodeRef.current.vx = 0;
        dragNodeRef.current.vy = 0;
        return;
      }

      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        transformRef.current.x = panStartRef.current.tx + dx;
        transformRef.current.y = panStartRef.current.ty + dy;
        return;
      }

      const node = findNodeAt(cx, cy);
      if (node) {
        canvas!.style.cursor = "grab";
        if (tooltipDivRef.current) {
          tooltipRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            label: node.label,
            type: node.type,
          };
          tooltipDivRef.current.style.display = "block";
          tooltipDivRef.current.style.left = `${e.clientX - rect.left + 12}px`;
          tooltipDivRef.current.style.top = `${e.clientY - rect.top - 12}px`;
          tooltipDivRef.current.querySelector(".tooltip-label")!.textContent =
            node.label;
          tooltipDivRef.current.querySelector(".tooltip-type")!.textContent =
            node.type.charAt(0).toUpperCase() + node.type.slice(1);
        }
      } else {
        canvas!.style.cursor = "default";
        if (tooltipDivRef.current) {
          tooltipDivRef.current.style.display = "none";
        }
      }
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseDown(e: MouseEvent) {
      const { x: cx, y: cy } = getCanvasPos(e);
      const node = findNodeAt(cx, cy);
      if (node && node.id !== "disease") {
        dragNodeRef.current = node;
        isDraggingRef.current = true;
        canvas!.style.cursor = "grabbing";
      } else {
        isPanningRef.current = true;
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          tx: transformRef.current.x,
          ty: transformRef.current.y,
        };
        canvas!.style.cursor = "move";
      }
    }

    function onMouseUp() {
      dragNodeRef.current = null;
      isDraggingRef.current = false;
      isPanningRef.current = false;
      canvas!.style.cursor = "default";
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      transformRef.current.scale = Math.min(
        3,
        Math.max(0.2, transformRef.current.scale * delta),
      );
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleZoomIn = () => {
    transformRef.current.scale = Math.min(3, transformRef.current.scale * 1.2);
  };
  const handleZoomOut = () => {
    transformRef.current.scale = Math.max(
      0.2,
      transformRef.current.scale / 1.2,
    );
  };
  const handleReset = () => {
    transformRef.current = { x: 0, y: 0, scale: 1 };
  };

  return (
    <div className="relative w-full" style={{ height: "520px" }}>
      {/* Legend */}
      <div
        className="absolute top-3 left-3 z-10 rounded-xl p-3 text-xs space-y-1.5"
        style={{
          background: "oklch(0.08 0.02 270 / 0.85)",
          border: "1px solid oklch(0.82 0.17 198 / 0.15)",
          backdropFilter: "blur(8px)",
        }}
      >
        {(["disease", "pathway", "protein", "drug"] as const).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: NODE_COLORS[type].fill,
                boxShadow: `0 0 6px ${NODE_COLORS[type].fill}`,
              }}
            />
            <span
              className="capitalize"
              style={{ color: "oklch(0.75 0.06 260)" }}
            >
              {type}
            </span>
          </div>
        ))}
        <div className="pt-1 text-xs" style={{ color: "oklch(0.5 0.06 260)" }}>
          Drag nodes • Scroll to zoom
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {[
          {
            icon: <ZoomIn className="w-4 h-4" />,
            onClick: handleZoomIn,
            label: "Zoom in",
          },
          {
            icon: <ZoomOut className="w-4 h-4" />,
            onClick: handleZoomOut,
            label: "Zoom out",
          },
          {
            icon: <RotateCcw className="w-4 h-4" />,
            onClick: handleReset,
            label: "Reset",
          },
        ].map(({ icon, onClick, label }) => (
          <Button
            key={label}
            variant="outline"
            size="icon"
            onClick={onClick}
            title={label}
            className="w-8 h-8 rounded-lg"
            style={{
              background: "oklch(0.10 0.03 270 / 0.85)",
              border: "1px solid oklch(0.82 0.17 198 / 0.25)",
              color: "oklch(0.75 0.10 240)",
            }}
          >
            {icon}
          </Button>
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-xl"
        style={{
          background: "oklch(0.06 0.02 270)",
          border: "1px solid oklch(0.82 0.17 198 / 0.12)",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipDivRef}
        className="absolute pointer-events-none z-20 rounded-lg px-3 py-2 text-xs"
        style={{
          display: "none",
          background: "oklch(0.10 0.04 270 / 0.95)",
          border: "1px solid oklch(0.82 0.17 198 / 0.3)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 16px oklch(0.04 0.015 270 / 0.8)",
          maxWidth: "200px",
        }}
      >
        <div
          className="tooltip-label font-semibold"
          style={{ color: "oklch(0.92 0.04 240)" }}
        />
        <div
          className="tooltip-type capitalize mt-0.5"
          style={{ color: "oklch(0.82 0.17 198)" }}
        />
      </div>
    </div>
  );
}
