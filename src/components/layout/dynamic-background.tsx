"use client";

import { useEffect, useRef } from "react";

type ThreeModule = typeof import("three");

type Cubie = {
  mesh: import("three").Group;
  coord: { x: number; y: number; z: number };
};

type Turn = {
  pivot: import("three").Group;
  cubies: Cubie[];
  axis: "x" | "y" | "z";
  direction: 1 | -1;
  progress: number;
};

const FACE_DATA = [
  { label: "TS", tint: "#2563eb" },
  { label: "JS", tint: "#ca8a04" },
  { label: "Py", tint: "#16a34a" },
  { label: "Go", tint: "#0891b2" },
  { label: "Rs", tint: "#f97316" },
  { label: "SQL", tint: "#7c3aed" },
];

const CUBE_CONFIGS = [
  { position: [-4.55, 0.88, -2.45], scale: 0.4, rotation: [0.5, -0.72, 0.18] },
  { position: [4.55, 0.72, -2.55], scale: 0.38, rotation: [0.35, 0.7, -0.12] },
  { position: [-4.75, -1.95, -2.35], scale: 0.34, rotation: [0.72, 0.45, 0.18] },
  { position: [4.72, -2.12, -2.45], scale: 0.35, rotation: [0.55, -0.5, 0.25] },
  { position: [-1.8, -3.15, -3.2], scale: 0.28, rotation: [0.6, 0.3, 0.25] },
  { position: [1.9, -3.25, -3.15], scale: 0.29, rotation: [0.38, -0.6, 0.32] },
  { position: [0.0, 2.15, -3.8], scale: 0.28, rotation: [0.52, 0.45, -0.18] },
] as const;

export function DynamicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    async function init() {
      const THREE = await import("three");
      if (disposed || !containerRef.current) return;

      const container = containerRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0.2, 8.8);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1.35));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
      keyLight.position.set(4, 6, 5);
      scene.add(keyLight);
      const rimLight = new THREE.PointLight(0x60a5fa, 12, 18);
      rimLight.position.set(-4, 1.8, 3);
      scene.add(rimLight);
      const warmLight = new THREE.PointLight(0xf97316, 8, 16);
      warmLight.position.set(4.5, -2.5, 4);
      scene.add(warmLight);
      const cyanGlow = new THREE.PointLight(0x22d3ee, 10, 12);
      cyanGlow.position.set(0, 1.2, 4);
      scene.add(cyanGlow);

      const rubiks = CUBE_CONFIGS.map((config, index) => {
        const rubik = createRubik(THREE);
        rubik.group.position.set(config.position[0], config.position[1], config.position[2]);
        rubik.group.scale.setScalar(config.scale);
        rubik.group.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
        rubik.group.userData.phase = index * 1.7;
        scene.add(rubik.group);
        return rubik;
      });

      let scroll = 0;
      let targetScroll = 0;
      let last = performance.now();
      let frame = 0;

      const updateScroll = () => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        targetScroll = window.scrollY / max;
      };

      const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      const animate = (now: number) => {
        const delta = Math.min(0.04, (now - last) / 1000);
        last = now;
        scroll += (targetScroll - scroll) * 0.08;

        rubiks.forEach((rubik, index) => {
          const phase = rubik.group.userData.phase as number;
          rubik.group.rotation.y += delta * (0.1 + scroll * 0.26) * (index % 2 ? -1 : 1);
          rubik.group.rotation.x += Math.sin(now * 0.00045 + phase) * 0.0009;
        rubik.group.position.y = CUBE_CONFIGS[index].position[1] + Math.sin(now * 0.001 + phase) * 0.14 + scroll * (index - 3) * 0.24;
        rubik.group.position.x = CUBE_CONFIGS[index].position[0] + Math.sin(scroll * Math.PI * 2 + phase) * 0.22;

          if (!rubik.turn && now - rubik.lastTurn > 1050 - scroll * 520) {
            startTurn(THREE, rubik);
            rubik.lastTurn = now;
          }
          updateTurn(THREE, rubik, delta, 2.3 + scroll * 3.3);
        });

        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };

      updateScroll();
      window.addEventListener("scroll", updateScroll, { passive: true });
      window.addEventListener("resize", resize);
      frame = requestAnimationFrame(animate);

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", updateScroll);
        window.removeEventListener("resize", resize);
        rubiks.forEach((rubik) => {
          rubik.group.traverse((obj) => {
            const mesh = obj as import("three").Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            if ("material" in obj && obj.material) {
              const material = obj.material as import("three").Material | import("three").Material[];
              if (Array.isArray(material)) material.forEach((m) => m.dispose());
              else material.dispose();
            }
          });
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    init();
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.14),transparent_26rem),radial-gradient(circle_at_82%_20%,rgba(20,184,166,0.13),transparent_28rem),radial-gradient(circle_at_48%_84%,rgba(249,115,22,0.1),transparent_30rem),linear-gradient(180deg,rgba(239,246,255,0.96),rgba(248,250,252,0.82)_42%,rgba(245,250,255,0.94))]" />
      <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_18%_18%,rgba(96,165,250,0.2),transparent_26rem),radial-gradient(circle_at_82%_20%,rgba(45,212,191,0.13),transparent_28rem),radial-gradient(circle_at_48%_84%,rgba(168,85,247,0.11),transparent_30rem),linear-gradient(180deg,rgba(7,17,31,0.98),rgba(8,18,32,0.9)_42%,rgba(10,22,38,0.96))] dark:block" />
      <div className="dynamic-grid" />
      <div ref={containerRef} className="absolute inset-0 opacity-100 [mask-image:linear-gradient(to_bottom,transparent,black_2%,black_94%,transparent)]" />
    </div>
  );
}

function createRubik(THREE: ThreeModule) {
  const group = new THREE.Group();
  const cubies: Cubie[] = [];
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xeef6ff,
    roughness: 0.04,
    metalness: 0.02,
    transmission: 0.78,
    transparent: true,
    opacity: 0.28,
    thickness: 0.34,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    specularIntensity: 1,
    depthWrite: false,
  });
  const geometry = createRoundedBoxGeometry(THREE, 0.92, 0.13, 5);

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const cubieGroup = new THREE.Group();
        const mesh = new THREE.Mesh(geometry, bodyMaterial.clone());
        mesh.renderOrder = 1;
        cubieGroup.add(mesh);
        cubieGroup.position.set(x, y, z);
        addStickers(THREE, cubieGroup, { x, y, z });
        group.add(cubieGroup);
        cubies.push({ mesh: cubieGroup, coord: { x, y, z } });
      }
    }
  }

  return { group, cubies, turn: null as Turn | null, lastTurn: 0 };
}

function createRoundedBoxGeometry(THREE: ThreeModule, size: number, radius: number, segments: number) {
  const shape = new THREE.Shape();
  const half = size / 2;
  const inner = half - radius;
  shape.moveTo(-inner, -half);
  shape.lineTo(inner, -half);
  shape.quadraticCurveTo(half, -half, half, -inner);
  shape.lineTo(half, inner);
  shape.quadraticCurveTo(half, half, inner, half);
  shape.lineTo(-inner, half);
  shape.quadraticCurveTo(-half, half, -half, inner);
  shape.lineTo(-half, -inner);
  shape.quadraticCurveTo(-half, -half, -inner, -half);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: size,
    bevelEnabled: true,
    bevelSegments: segments,
    bevelSize: radius * 0.72,
    bevelThickness: radius * 0.72,
    steps: 1,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function addStickers(THREE: ThreeModule, cubie: import("three").Group, coord: { x: number; y: number; z: number }) {
  const stickerGeometry = new THREE.PlaneGeometry(0.7, 0.7);
  const faces = [
    { show: coord.x === 1, pos: [0.535, 0, 0], rot: [0, Math.PI / 2, 0], data: FACE_DATA[0] },
    { show: coord.x === -1, pos: [-0.535, 0, 0], rot: [0, -Math.PI / 2, 0], data: FACE_DATA[1] },
    { show: coord.y === 1, pos: [0, 0.535, 0], rot: [-Math.PI / 2, 0, 0], data: FACE_DATA[2] },
    { show: coord.y === -1, pos: [0, -0.535, 0], rot: [Math.PI / 2, 0, 0], data: FACE_DATA[3] },
    { show: coord.z === 1, pos: [0, 0, 0.535], rot: [0, 0, 0], data: FACE_DATA[4] },
    { show: coord.z === -1, pos: [0, 0, -0.535], rot: [0, Math.PI, 0], data: FACE_DATA[5] },
  ] as const;

  faces.forEach((face) => {
    if (!face.show) return;
    const material = new THREE.MeshBasicMaterial({
      map: makeStickerTexture(THREE, face.data.label, face.data.tint),
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    const sticker = new THREE.Mesh(stickerGeometry, material);
    sticker.renderOrder = 20;
    sticker.position.set(face.pos[0], face.pos[1], face.pos[2]);
    sticker.rotation.set(face.rot[0], face.rot[1], face.rot[2]);
    cubie.add(sticker);
  });
}

function makeStickerTexture(THREE: ThreeModule, label: string, tint: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const radius = 46;
  ctx.clearRect(0, 0, 256, 256);

  const panelGradient = ctx.createLinearGradient(28, 20, 228, 236);
  panelGradient.addColorStop(0, "rgba(255,255,255,0.58)");
  panelGradient.addColorStop(0.45, "rgba(226,232,240,0.2)");
  panelGradient.addColorStop(1, "rgba(148,163,184,0.12)");

  ctx.shadowColor = "rgba(15,23,42,0.1)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = panelGradient;
  roundRect(ctx, 22, 22, 212, 212, radius);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 3;
  roundRect(ctx, 22, 22, 212, 212, radius);
  ctx.stroke();

  ctx.strokeStyle = "rgba(100,116,139,0.18)";
  ctx.lineWidth = 2;
  roundRect(ctx, 36, 36, 184, 184, 36);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  roundRect(ctx, 42, 42, 172, 56, 22);
  ctx.fill();

  ctx.font = label.length > 2 ? "800 66px Inter, Arial" : "900 88px Inter, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Two-pass text creates an engraved glass mark: bright upper edge, dark lower inset.
  ctx.shadowColor = "rgba(255,255,255,0.78)";
  ctx.shadowOffsetX = -1;
  ctx.shadowOffsetY = -1;
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.fillText(label, 128, 132);

  ctx.shadowColor = "rgba(15,23,42,0.24)";
  ctx.shadowOffsetX = 1.5;
  ctx.shadowOffsetY = 1.5;
  ctx.fillStyle = tintToRgba(tint, 0.42);
  ctx.fillText(label, 128, 132);

  ctx.shadowColor = "transparent";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 1;
  ctx.strokeText(label, 128, 132);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function tintToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function startTurn(THREE: ThreeModule, rubik: ReturnType<typeof createRubik>) {
  const axes = ["x", "y", "z"] as const;
  const axis = axes[Math.floor(Math.random() * axes.length)];
  const layers = [-1, 0, 1] as const;
  const layer = layers[Math.floor(Math.random() * layers.length)];
  const direction = Math.random() > 0.5 ? 1 : -1;
  const selected = rubik.cubies.filter((cubie) => cubie.coord[axis] === layer);
  const pivot = new THREE.Group();
  rubik.group.add(pivot);
  selected.forEach((cubie) => pivot.attach(cubie.mesh));
  rubik.turn = { pivot, cubies: selected, axis, direction, progress: 0 };
}

function updateTurn(THREE: ThreeModule, rubik: ReturnType<typeof createRubik>, delta: number, speed: number) {
  if (!rubik.turn) return;
  const turn = rubik.turn;
  const next = Math.min(Math.PI / 2, turn.progress + delta * speed);
  const amount = (next - turn.progress) * turn.direction;
  turn.pivot.rotation[turn.axis] += amount;
  turn.progress = next;

  if (turn.progress >= Math.PI / 2 - 0.001) {
    turn.cubies.forEach((cubie) => {
      rubik.group.attach(cubie.mesh);
      rotateCoord(cubie.coord, turn.axis, turn.direction);
      cubie.mesh.position.set(cubie.coord.x, cubie.coord.y, cubie.coord.z);
      cubie.mesh.rotation.x = Math.round(cubie.mesh.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
      cubie.mesh.rotation.y = Math.round(cubie.mesh.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
      cubie.mesh.rotation.z = Math.round(cubie.mesh.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
    });
    rubik.group.remove(turn.pivot);
    rubik.turn = null;
  }
}

function rotateCoord(coord: { x: number; y: number; z: number }, axis: "x" | "y" | "z", direction: 1 | -1) {
  const { x, y, z } = coord;
  if (axis === "x") {
    coord.y = direction === 1 ? -z : z;
    coord.z = direction === 1 ? y : -y;
  } else if (axis === "y") {
    coord.x = direction === 1 ? z : -z;
    coord.z = direction === 1 ? -x : x;
  } else {
    coord.x = direction === 1 ? -y : y;
    coord.y = direction === 1 ? x : -x;
  }
}
