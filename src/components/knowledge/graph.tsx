"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: string;
  radius: number;
  color: string;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
}

interface ForceGraphProps {
  nodes: Array<{ id: string; label: string; group: string }>;
  edges: Array<{ source: string; target: string }>;
  onNodeClick?: (id: string, label: string) => void;
}

export interface ForceGraphHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
}

const WIDTH = 900;
const HEIGHT = 700;

const categoryColors: Record<string, string> = {
  Development: "#2563eb",
  Infrastructure: "#059669",
  "Frontend Development": "#dc2626",
  "Artificial Intelligence": "#f97316",
  Security: "#7c3aed",
  "Mobile Development": "#16a34a",
};

export const ForceGraph = forwardRef<ForceGraphHandle, ForceGraphProps>(
  function ForceGraph({ nodes: rawNodes, edges: rawEdges, onNodeClick }, ref) {
    const svgRef = useRef<SVGSVGElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(undefined);
    const router = useRouter();

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        const el = svgRef.current;
        if (!el || !zoomRef.current) return;
        const svg = d3.select(el);
        const t = d3.zoomTransform(el);
        svg.transition().duration(300).call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(t.x, t.y).scale(Math.min(4, t.k * 1.4))
        );
      },
      zoomOut: () => {
        const el = svgRef.current;
        if (!el || !zoomRef.current) return;
        const svg = d3.select(el);
        const t = d3.zoomTransform(el);
        svg.transition().duration(300).call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(t.x, t.y).scale(Math.max(0.3, t.k * 0.7))
        );
      },
      zoomReset: () => {
        const el = svgRef.current;
        if (!el || !zoomRef.current) return;
        d3.select(el).transition().duration(300).call(
          zoomRef.current.transform,
          d3.zoomIdentity
        );
      },
    }), []);

    useEffect(() => {
      const el = svgRef.current;
      if (!el || rawNodes.length === 0) return;
      const svg = d3.select(el);
      svg.selectAll("*").remove();

      const width = WIDTH;
      const height = HEIGHT;

      const nodes: SimNode[] = rawNodes.map((n, i) => ({
        ...n,
        radius: 14 - i * 0.6,
        color: categoryColors[n.group] ?? "#64748b",
      }));

      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      const links: SimLink[] = rawEdges
        .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
        .map((e) => ({ source: e.source, target: e.target }));

      const g = svg.append("g");

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 4])
        .on("zoom", (e) => g.attr("transform", e.transform));
      zoomRef.current = zoom;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (svg as any).call(zoom);

      const simulation = d3.forceSimulation<SimNode>(nodes)
        .force("link", d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide<SimNode>().radius((d) => d.radius + 10));

      const link = g.append("g")
        .selectAll<SVGLineElement, SimLink>("line")
        .data(links)
        .join("line")
        .attr("stroke", "#94a3b8")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

      const node = g.append("g")
        .selectAll<SVGGElement, SimNode>("g")
        .data(nodes)
        .join("g")
        .style("cursor", "pointer")
        .on("click", (_e, d) => {
          onNodeClick?.(d.id, d.label);
          router.push(`/blog/${d.id}`);
        });

      node.append("circle")
        .attr("r", (d) => d.radius)
        .attr("fill", (d) => d.color)
        .attr("fill-opacity", 0.8)
        .attr("stroke", (d) => d3.color(d.color)?.darker(0.3)?.toString() || d.color)
        .attr("stroke-width", 2);

      node.append("text")
        .text((d) => d.label.length > 20 ? d.label.slice(0, 20) + "..." : d.label)
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("dy", (d) => d.radius + 14)
        .attr("fill", "currentColor")
        .attr("class", "fill-foreground");

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => (d.source as SimNode).x!)
          .attr("y1", (d) => (d.source as SimNode).y!)
          .attr("x2", (d) => (d.target as SimNode).x!)
          .attr("y2", (d) => (d.target as SimNode).y!);

        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

      return () => { simulation.stop(); };
    }, [rawNodes, rawEdges, router, onNodeClick]);

    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
      />
    );
  }
);
