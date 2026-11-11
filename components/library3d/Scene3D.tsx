"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, RoundedBox, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Robot3D, { type RobotCtrl } from "./Robot3D";
import type { BookId } from "@/lib/chapters";
import { LADDER, LADDER_ANGLE, LADDER_LEN, SHELF, SLOTS, buildDecoBooks, slotById, slotCenter, type Slot } from "@/lib/library3d";

export type ScenePhase = "idle" | "ack" | "walking" | "climbing" | "grabbing" | "descending" | "presenting" | "diving" | "reading" | "returning";

export type SceneCommand = { book: BookId; nonce: number } | null;

// Capas DOM que la escena posiciona proyectando puntos 3D a pantalla
export type SceneOverlay = {
  bubble: MutableRefObject<HTMLDivElement | null>;
  label: MutableRefObject<HTMLDivElement | null>;
  labelText: MutableRefObject<HTMLSpanElement | null>;
};

type Hovered = { id: BookId | null; pos: THREE.Vector3 };

type Props = {
  command: SceneCommand;
  readerOpen: boolean;
  talking: boolean;
  overlay: SceneOverlay;
  reduced: boolean;
  busy: boolean;
  onPhase: (p: ScenePhase) => void;
  onRead: () => void;
  onBookClick: (id: BookId) => void;
  onRobotClick: () => void;
  onReady: () => void;
  bookTitles: Record<BookId, string>; // nombres de los libros en el idioma elegido
  day: boolean; // modo claro: sale el sol y la biblioteca se ilumina
};

// ---------- utilidades ----------
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const smooth = (k: number) => k * k * (3 - 2 * k);
const lerp = THREE.MathUtils.lerp;
const angleLerp = (a: number, b: number, k: number) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
};

type Step = { d: number; s?: () => void; u?: (k: number) => void; e?: () => void; until?: () => boolean };

const HOME = new THREE.Vector3(0.4, 0, 3.4);
const PRESENT = new THREE.Vector3(0, 0, 3.6);

function ladderPoint(x: number, along: number) {
  return new THREE.Vector3(x, along * Math.cos(LADDER_ANGLE), LADDER.baseZ - along * Math.sin(LADDER_ANGLE));
}

function baseCamera(aspect: number) {
  if (aspect < 0.75) return { pos: new THREE.Vector3(0, 2.5, 12.8), look: new THREE.Vector3(0, 2.25, 0) };
  if (aspect < 1.3) return { pos: new THREE.Vector3(0, 2.2, 13.2), look: new THREE.Vector3(0, 2.0, 0) };
  return { pos: new THREE.Vector3(0, 2.1, 10.6), look: new THREE.Vector3(0, 2.0, 0) };
}

// ---------- texturas procedurales ----------
function useWoodFloor() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    const g = c.getContext("2d")!;
    const tones = ["#4a2e1e", "#52331f", "#45291a", "#4f3220", "#583822"];
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 4; j++) {
        const off = (i % 2) * 128;
        g.fillStyle = tones[(i * 7 + j * 3) % tones.length];
        g.fillRect(j * 256 - off, i * 64, 256, 64);
        g.fillRect(j * 256 - off + 1024, i * 64, 256, 64);
        g.fillStyle = "rgba(0,0,0,0.35)";
        g.fillRect(j * 256 - off, i * 64, 2, 64);
      }
      g.fillStyle = "rgba(0,0,0,0.4)";
      g.fillRect(0, i * 64, 1024, 2);
    }
    for (let k = 0; k < 2400; k++) {
      g.fillStyle = `rgba(255,220,180,${Math.random() * 0.03})`;
      g.fillRect(Math.random() * 1024, Math.random() * 1024, 40 + Math.random() * 120, 1);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 6);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
}

function useWallpaper() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#2b1e17";
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#33241b";
    for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 14, 256);
    g.fillStyle = "rgba(232,194,122,0.06)";
    for (let y = 16; y < 256; y += 64) for (let x = 7; x < 256; x += 32) {
      g.beginPath();
      g.arc(x, y, 3, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(14, 5);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

// ---------- día / noche ----------
// k va de 0 (noche) a 1 (día) y lo leen las luces, las ventanas y el fondo.
type DayRef = MutableRefObject<number>;
const NIGHT_BG = new THREE.Color("#140e0a");
const DAY_BG = new THREE.Color("#c9ad86");
const mix = (a: string, b: string) => {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  return (k: number, out: THREE.Color) => out.copy(ca).lerp(cb, k);
};

function DayCycle({ day, k }: { day: boolean; k: DayRef }) {
  const { scene } = useThree();
  useFrame((_, dt) => {
    k.current = THREE.MathUtils.damp(k.current, day ? 1 : 0, 2.2, dt);
    const bg = scene.background as THREE.Color | null;
    if (bg?.isColor) bg.copy(NIGHT_BG).lerp(DAY_BG, k.current);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(NIGHT_BG).lerp(DAY_BG, k.current);
  });
  return null;
}

// Rayo de sol: un plano translúcido que va de la ventana al piso.
function SunBeam({ from, to, k }: { from: [number, number, number]; to: [number, number, number]; k: DayRef }) {
  const ref = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  useLayoutEffect(() => {
    const dir = b.clone().sub(a).normalize();
    ref.current.position.copy(a).add(b).multiplyScalar(0.5);
    ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  });
  useFrame(({ clock }) => {
    mat.current.opacity = k.current * (0.04 + Math.sin(clock.elapsedTime * 0.8) * 0.008);
    ref.current.visible = k.current > 0.02;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.7, len, 0.02]} />
      <meshBasicMaterial ref={mat} color="#fff1c9" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

// Ventana: cielo nocturno con luna o cielo azul con sol y nubes, según k.
const skyColor = mix("#1d3557", "#4f9be0");
const skyEmissive = mix("#5f8fd6", "#3d8fdc");
const orbColor = mix("#fff6d8", "#fff3b0");
function SkyWindow({ x, k }: { x: number; k: DayRef }) {
  const glass = useRef<THREE.MeshStandardMaterial>(null!);
  const orb = useRef<THREE.Mesh>(null!);
  const orbMat = useRef<THREE.MeshBasicMaterial>(null!);
  const halo = useRef<THREE.MeshBasicMaterial>(null!);
  const clouds = useRef<THREE.Group>(null!);
  const cloudMats = useRef<THREE.MeshBasicMaterial[]>([]);
  useFrame(({ clock }) => {
    const v = k.current;
    skyColor(v, glass.current.color);
    skyEmissive(v, glass.current.emissive);
    glass.current.emissiveIntensity = 0.55 + v * 0.1;
    orbColor(v, orbMat.current.color);
    orb.current.scale.setScalar(1 + v * 0.35);
    halo.current.opacity = v * 0.7;
    clouds.current.position.x = Math.sin(clock.elapsedTime * 0.15 + x) * 0.18;
    for (const m of cloudMats.current) m.opacity = v * 0.9;
  });
  return (
    <group position={[x, 3.6, -0.34]} scale={0.8}>
      <mesh>
        <boxGeometry args={[2.2, 3.4, 0.12]} />
        <meshStandardMaterial color="#5a3721" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[1.9, 3.1]} />
        <meshStandardMaterial ref={glass} color="#1d3557" emissive="#5f8fd6" emissiveIntensity={0.55} />
      </mesh>
      {/* halo del sol */}
      <mesh position={[0.45, 0.85, 0.07]}>
        <circleGeometry args={[0.62, 40]} />
        <meshBasicMaterial ref={halo} color="#ffd36a" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* luna / sol */}
      <mesh ref={orb} position={[0.45, 0.85, 0.075]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial ref={orbMat} color="#fff6d8" toneMapped={false} />
      </mesh>
      {/* nubes */}
      <group ref={clouds} position={[-0.3, -0.2, 0.072]}>
        {[
          [0, 0, 0.17],
          [0.2, 0.05, 0.13],
          [-0.18, 0.02, 0.12],
          [0.45, -0.55, 0.1],
          [0.62, -0.5, 0.08],
        ].map(([cx, cy, r], i) => (
          <mesh key={i} position={[cx, cy, 0]}>
            <circleGeometry args={[r, 24]} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) cloudMats.current[i] = m;
              }}
              color="#ffffff"
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      {/* marco en cruz */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.06, 3.1, 0.03]} />
        <meshStandardMaterial color="#5a3721" />
      </mesh>
      <mesh position={[0, 0.2, 0.08]}>
        <boxGeometry args={[1.9, 0.06, 0.03]} />
        <meshStandardMaterial color="#5a3721" />
      </mesh>
    </group>
  );
}

// ---------- habitación ----------
function Room({ k }: { k: DayRef }) {
  const floor = useWoodFloor();
  const wall = useWallpaper();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={floor} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 5, -0.4]} receiveShadow>
        <planeGeometry args={[40, 12]} />
        <meshStandardMaterial map={wall} roughness={0.9} />
      </mesh>
      {/* zócalo */}
      <mesh position={[0, 0.6, -0.36]}>
        <boxGeometry args={[40, 1.2, 0.06]} />
        <meshStandardMaterial color="#3a2417" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.22, -0.33]}>
        <boxGeometry args={[40, 0.05, 0.1]} />
        <meshStandardMaterial color="#6b4228" roughness={0.5} />
      </mesh>

      {/* alfombra */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 3.3]} receiveShadow>
        <circleGeometry args={[2.4, 64]} />
        <meshStandardMaterial color="#6b1f24" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 3.3]}>
        <ringGeometry args={[1.95, 2.1, 64]} />
        <meshStandardMaterial color="#d9a55a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 3.3]}>
        <ringGeometry args={[0.7, 0.78, 64]} />
        <meshStandardMaterial color="#d9a55a" roughness={1} />
      </mesh>

      {/* ventanas: luna de noche, sol de día */}
      {[-5.75, 5.75].map((x) => (
        <SkyWindow key={x} x={x} k={k} />
      ))}
      <SunBeam from={[-5.75, 3.9, -0.2]} to={[-3.4, 0.02, 4]} k={k} />
      <SunBeam from={[5.75, 3.9, -0.2]} to={[3.4, 0.02, 4]} k={k} />

      {/* lámparas colgantes */}
      {[-2.6, 2.6].map((x) => (
        <group key={x} position={[x, 7.4, 2.2]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 1.6, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <coneGeometry args={[0.42, 0.42, 40, 1, true]} />
            <meshStandardMaterial color="#1f3b33" side={THREE.DoubleSide} roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.36, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#ffe2b0" toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.6, 0]} color="#ffb769" intensity={9} distance={9} decay={1.6} />
        </group>
      ))}

      {/* mesita con vela y libros apilados */}
      <group position={[4.9, 0, 2.6]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.06, 40]} />
          <meshStandardMaterial color="#5a3721" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.12, 0.7, 16]} />
          <meshStandardMaterial color="#3d2416" />
        </mesh>
        {["#2f5446", "#7d3f22", "#3a4069"].map((c, i) => (
          <RoundedBox key={c} args={[0.5 - i * 0.05, 0.08, 0.36]} radius={0.01} position={[-0.12, 0.77 + i * 0.085, 0]} rotation={[0, i * 0.25, 0]} castShadow>
            <meshStandardMaterial color={c} roughness={0.6} />
          </RoundedBox>
        ))}
        <mesh position={[0.25, 0.83, 0.1]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.22, 16]} />
          <meshStandardMaterial color="#f1e6d0" />
        </mesh>
        <Flame position={[0.25, 0.97, 0.1]} />
      </group>
    </group>
  );
}

function Flame({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  const light = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const f = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
    ref.current.scale.set(1, f, 1);
    light.current.intensity = 1.6 * f;
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <coneGeometry args={[0.022, 0.08, 12]} />
        <meshBasicMaterial color="#ffcf7a" toneMapped={false} />
      </mesh>
      <pointLight ref={light} color="#ff9a3c" distance={3} decay={2} intensity={1.6} />
    </group>
  );
}

// ---------- estantería ----------
function Shelf() {
  const W = SHELF.width;
  const H = SHELF.baseY + SHELF.rows * SHELF.rowH;
  const D = SHELF.depth;
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5c3820", roughness: 0.55, metalness: 0.05 }), []);
  const woodDark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2214", roughness: 0.8 }), []);
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c99a4b", roughness: 0.25, metalness: 0.9 }), []);
  const bayW = W / SHELF.bays;
  return (
    <group>
      <mesh position={[0, H / 2, -D / 2 + 0.02]} material={woodDark} receiveShadow>
        <boxGeometry args={[W, H, 0.04]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 + 0.06), H / 2 + 0.05, 0]} material={wood} castShadow receiveShadow>
          <boxGeometry args={[0.14, H + 0.1, D + 0.04]} />
        </mesh>
      ))}
      {Array.from({ length: SHELF.bays - 1 }, (_, i) => (
        <mesh key={i} position={[-W / 2 + (i + 1) * bayW, H / 2, 0]} material={wood} castShadow receiveShadow>
          <boxGeometry args={[0.07, H, D]} />
        </mesh>
      ))}
      {Array.from({ length: SHELF.rows + 1 }, (_, r) => (
        <group key={r}>
          <mesh position={[0, SHELF.baseY + r * SHELF.rowH, 0]} material={wood} castShadow receiveShadow>
            <boxGeometry args={[W, SHELF.plank, D]} />
          </mesh>
          <mesh position={[0, SHELF.baseY + r * SHELF.rowH - 0.035, D / 2 + 0.005]} material={woodDark}>
            <boxGeometry args={[W, 0.03, 0.02]} />
          </mesh>
        </group>
      ))}
      {/* zócalo y cornisa */}
      <mesh position={[0, SHELF.baseY / 2, 0.02]} material={woodDark} receiveShadow>
        <boxGeometry args={[W + 0.1, SHELF.baseY, D]} />
      </mesh>
      <mesh position={[0, H + 0.12, 0.03]} material={wood} castShadow>
        <boxGeometry args={[W + 0.5, 0.18, D + 0.14]} />
      </mesh>
      <mesh position={[0, H + 0.24, 0.05]} material={woodDark}>
        <boxGeometry args={[W + 0.62, 0.06, D + 0.2]} />
      </mesh>
      {/* riel de bronce para la escalera */}
      <mesh position={[0, LADDER.topY - 0.06, LADDER.topZ - 0.04]} rotation={[0, 0, Math.PI / 2]} material={brass}>
        <cylinderGeometry args={[0.025, 0.025, W + 0.3, 16]} />
      </mesh>
      {[-W / 2, -W / 4, 0, W / 4, W / 2].map((x) => (
        <mesh key={x} position={[x, LADDER.topY - 0.06, (LADDER.topZ + D / 2) / 2 - 0.04]} rotation={[Math.PI / 2, 0, 0]} material={brass}>
          <cylinderGeometry args={[0.012, 0.012, LADDER.topZ - D / 2, 8]} />
        </mesh>
      ))}
      {/* plaquitas doradas en cada bahía */}
      {Array.from({ length: SHELF.bays }, (_, i) => (
        <mesh key={i} position={[-W / 2 + (i + 0.5) * bayW, H + 0.12, D / 2 + 0.105]} material={brass}>
          <boxGeometry args={[0.36, 0.08, 0.01]} />
        </mesh>
      ))}
    </group>
  );
}

function DecoBooks() {
  const data = useMemo(buildDecoBooks, []);
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const bands = useRef<THREE.InstancedMesh>(null!);
  const offsets = useRef(new Float32Array(data.length));
  const hovered = useRef(-1);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const bandIdx = useMemo(() => data.map((b, i) => (b.band ? i : -1)).filter((i) => i >= 0), [data]);

  const write = (i: number) => {
    const b = data[i];
    tmp.position.set(b.x, b.y, b.z + offsets.current[i]);
    tmp.rotation.set(0, 0, b.tilt);
    tmp.scale.set(b.w, b.h, b.d);
    tmp.updateMatrix();
    mesh.current.setMatrixAt(i, tmp.matrix);
  };
  const writeBand = (j: number) => {
    const b = data[bandIdx[j]];
    tmp.position.set(b.x, b.y + b.h * 0.32, b.z + b.d / 2 + 0.002 + offsets.current[bandIdx[j]]);
    tmp.rotation.set(0, 0, b.tilt);
    tmp.scale.set(b.w * 0.98, 0.022, 0.004);
    tmp.updateMatrix();
    bands.current.setMatrixAt(j, tmp.matrix);
  };

  useLayoutEffect(() => {
    const c = new THREE.Color();
    data.forEach((b, i) => {
      write(i);
      mesh.current.setColorAt(i, c.set(b.color).offsetHSL(0, 0, (((i * 13) % 7) - 3) * 0.012));
    });
    bandIdx.forEach((_, j) => writeBand(j));
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    bands.current.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useFrame((_, dt) => {
    let dirty = false;
    const off = offsets.current;
    for (let i = 0; i < off.length; i++) {
      const target = i === hovered.current ? 0.09 : 0;
      if (Math.abs(off[i] - target) > 0.0005) {
        off[i] = THREE.MathUtils.damp(off[i], target, 14, dt);
        write(i);
        dirty = true;
      }
    }
    if (dirty) {
      mesh.current.instanceMatrix.needsUpdate = true;
      bandIdx.forEach((_, j) => writeBand(j));
      bands.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, data.length]}
        castShadow
        receiveShadow
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          hovered.current = e.instanceId ?? -1;
        }}
        onPointerOut={() => (hovered.current = -1)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={bands} args={[undefined, undefined, bandIdx.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d8b064" metalness={0.8} roughness={0.35} />
      </instancedMesh>
    </group>
  );
}

type BookAnim = { id: BookId | null; pull: number; hidden: boolean };

// Placa de bronce con el nombre de la sección (textura de canvas, cambia con el idioma)
function usePlaqueTexture(title: string) {
  const tex = useMemo(() => {
    const W = 512;
    const H = 112;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#f3d58f");
    grad.addColorStop(0.5, "#c99a4b");
    grad.addColorStop(1, "#8f6428");
    g.fillStyle = grad;
    g.beginPath();
    g.roundRect(4, 4, W - 8, H - 8, 18);
    g.fill();
    g.strokeStyle = "rgba(60,35,10,0.55)";
    g.lineWidth = 4;
    g.beginPath();
    g.roundRect(14, 14, W - 28, H - 28, 12);
    g.stroke();
    let size = 52;
    g.font = `700 ${size}px Georgia, "Times New Roman", serif`;
    while (g.measureText(title).width > W - 70 && size > 26) {
      size -= 2;
      g.font = `700 ${size}px Georgia, "Times New Roman", serif`;
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(255,240,200,0.55)";
    g.fillText(title, W / 2, H / 2 + 3);
    g.fillStyle = "#3a230f";
    g.fillText(title, W / 2, H / 2 + 1);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [title]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function InteractiveBook({ slot, title, anim, disabled, onClick, hovered }: { slot: Slot; title: string; anim: MutableRefObject<BookAnim>; disabled: boolean; onClick: () => void; hovered: MutableRefObject<Hovered> }) {
  const group = useRef<THREE.Group>(null!);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: slot.color, roughness: 0.45, clearcoat: 0.5, emissive: new THREE.Color(slot.color), emissiveIntensity: 0 }), [slot.color]);
  const [hover, setHover] = useState(false);
  const [cx, cy, cz] = slotCenter(slot);
  const plaqueTex = usePlaqueTexture(title);
  const plaque = useRef<THREE.Mesh>(null!);
  const plaqueMat = useRef<THREE.MeshStandardMaterial>(null!);
  // La placa cuelga bajo la repisa donde está el libro
  const plaqueY = SHELF.baseY + slot.row * SHELF.rowH - 0.135;
  const handlers = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHover(true);
      document.body.style.cursor = disabled ? "default" : "pointer";
    },
    onPointerOut: () => {
      setHover(false);
      document.body.style.cursor = "";
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!disabled) onClick();
    },
  };

  useFrame(({ clock }, dt) => {
    const a = anim.current;
    const mine = a.id === slot.id;
    const hoverZ = hover && !mine ? 0.3 : 0;
    const pullZ = mine ? a.pull * 0.55 : 0;
    const g = group.current;
    g.position.z = THREE.MathUtils.damp(g.position.z, cz + hoverZ + pullZ, 10, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, hover && !mine ? -0.28 : 0, 8, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, hover && !mine ? -0.06 : 0, 8, dt);
    g.visible = !(mine && a.hidden);
    mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, hover ? 0.35 : 0.06 + Math.sin(clock.elapsedTime * 2 + cx) * 0.04, 8, dt);
    plaqueMat.current.emissiveIntensity = THREE.MathUtils.damp(plaqueMat.current.emissiveIntensity, hover ? 0.55 : 0.08, 8, dt);
    const ps = THREE.MathUtils.damp(plaque.current.scale.x, hover ? 1.12 : 1, 10, dt);
    plaque.current.scale.set(ps, ps, 1);
    if (hover && !mine) {
      hovered.current.id = slot.id;
      g.getWorldPosition(hovered.current.pos);
      hovered.current.pos.y += slot.h / 2 + 0.1;
    } else if (hovered.current.id === slot.id) hovered.current.id = null;
  });

  return (
    <>
    {/* placa con el nombre de la sección */}
    <mesh ref={plaque} position={[cx, plaqueY, SHELF.depth / 2 + 0.035]} {...handlers}>
      <planeGeometry args={[0.98, 0.215]} />
      <meshStandardMaterial ref={plaqueMat} map={plaqueTex} emissiveMap={plaqueTex} emissive="#ffffff" emissiveIntensity={0.08} metalness={0.35} roughness={0.35} />
    </mesh>
    <group ref={group} position={[cx, cy, cz]}>
      <RoundedBox args={[slot.w, slot.h, slot.d]} radius={0.012} material={mat} castShadow {...handlers} />
      {[0.36, -0.36].map((k) => (
        <mesh key={k} position={[0, slot.h * k, slot.d / 2 + 0.002]}>
          <boxGeometry args={[slot.w * 0.98, 0.026, 0.004]} />
          <meshStandardMaterial color="#e8c27a" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, slot.d / 2 + 0.002]}>
        <boxGeometry args={[slot.w * 0.5, slot.h * 0.42, 0.003]} />
        <meshStandardMaterial color="#000" transparent opacity={0.18} />
      </mesh>
    </group>
    </>
  );
}

// ---------- escalera corrediza ----------
function Ladder({ xRef, target }: { xRef: MutableRefObject<number>; target: MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null!);
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a5a34", roughness: 0.5 }), []);
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c99a4b", roughness: 0.25, metalness: 0.9 }), []);
  const rungs = Math.floor(LADDER_LEN / 0.34);
  useFrame((_, dt) => {
    xRef.current = THREE.MathUtils.damp(xRef.current, target.current, 2.4, dt);
    g.current.position.x = xRef.current;
  });
  return (
    <group ref={g} position={[3.2, 0, LADDER.baseZ]} rotation={[-LADDER_ANGLE, 0, 0]}>
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, LADDER_LEN / 2, 0]} material={wood} castShadow>
          <boxGeometry args={[0.07, LADDER_LEN, 0.1]} />
        </mesh>
      ))}
      {Array.from({ length: rungs }, (_, i) => (
        <mesh key={i} position={[0, 0.3 + i * 0.34, 0]} rotation={[0, 0, Math.PI / 2]} material={brass} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.6, 12]} />
        </mesh>
      ))}
      {[-0.3, 0.3].map((x) => (
        <group key={`w${x}`}>
          <mesh position={[x, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} material={brass}>
            <cylinderGeometry args={[0.045, 0.045, 0.05, 16]} />
          </mesh>
          <mesh position={[x, LADDER_LEN - 0.02, -0.06]} rotation={[0, 0, Math.PI / 2]} material={brass}>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------- libro que vuela de regreso ----------
function FlyingBook({ fly }: { fly: MutableRefObject<{ active: boolean; from: THREE.Vector3; to: THREE.Vector3; k: number; color: string; slot: Slot | null }> }) {
  const g = useRef<THREE.Group>(null!);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.45, clearcoat: 0.5 }), []);
  useFrame(() => {
    const f = fly.current;
    g.current.visible = f.active;
    if (!f.active || !f.slot) return;
    const k = ease(f.k);
    g.current.position.lerpVectors(f.from, f.to, k);
    g.current.position.y += Math.sin(k * Math.PI) * 1.2;
    g.current.rotation.set(0, (1 - k) * Math.PI * 2, 0);
    mat.color.set(f.color);
    const s = f.slot;
    g.current.scale.set(s.w, s.h, s.d);
  });
  return (
    <group ref={g} visible={false}>
      <mesh material={mat} castShadow>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <Sparkles count={14} scale={[3, 1.5, 3]} size={4} speed={1.4} color="#ffd38a" />
    </group>
  );
}

// ---------- director: cámara + robot + secuencias ----------
function Director(props: Props & { ladderX: MutableRefObject<number>; ladderTarget: MutableRefObject<number> }) {
  const { command, readerOpen, talking, overlay, reduced, onPhase, onRead, onBookClick, onRobotClick, ladderX, ladderTarget, bookTitles } = props;
  const hovered = useRef<Hovered>({ id: null, pos: new THREE.Vector3() });
  const proj = useMemo(() => new THREE.Vector3(), []);
  const robot = useRef<THREE.Group>(null!);
  const eye = useRef<THREE.Object3D | null>(null);
  const ctrl = useRef<RobotCtrl>({ mode: "wave", talking: false, holding: false, bookColor: "#c4561e", look: 0, moving: false });
  const pos = useRef(HOME.clone());
  const rotY = useRef(-0.25);
  const anim = useRef<BookAnim>({ id: null, pull: 0, hidden: false });
  const fly = useRef({ active: false, from: new THREE.Vector3(), to: new THREE.Vector3(), k: 0, color: "#fff", slot: null as Slot | null });
  const queue = useRef<Step[]>([]);
  const cur = useRef<{ step: Step; t: number } | null>(null);
  const camMode = useRef<"free" | "dive" | "inside">("free");
  const INSIDE = useMemo(() => ({ pos: new THREE.Vector3(-0.4, 2.6, 6.2), look: new THREE.Vector3(0, 2.7, 0) }), []);
  const camLook = useRef(new THREE.Vector3(0, 3.6, 0));
  const diveFrom = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() });
  const follow = useRef(0);
  const busy = useRef(false);
  const wasReading = useRef(false);
  const { camera, size, pointer } = useThree();
  const persp = camera as THREE.PerspectiveCamera;
  const speed = reduced ? 3 : 1;

  useEffect(() => {
    ctrl.current.talking = talking;
  }, [talking]);

  // intro: cámara desde lejos y saludo
  useEffect(() => {
    camera.position.set(0, 6.5, 24);
    const t = setTimeout(() => (ctrl.current.mode = "idle"), 2600);
    return () => clearTimeout(t);
  }, [camera]);

  const run = (steps: Step[]) => {
    queue.current = steps;
    cur.current = null;
  };

  const walkSteps = (to: THREE.Vector3, carry: boolean): Step[] => {
    const from = new THREE.Vector3();
    let dir = 0;
    let startRot = 0;
    let dist = 0;
    return [
      {
        d: 0.3 / speed,
        s: () => {
          from.copy(pos.current);
          dist = from.distanceTo(to);
          dir = Math.atan2(to.x - from.x, to.z - from.z);
          startRot = rotY.current;
          ctrl.current.mode = carry ? "carry" : "walk";
          ctrl.current.moving = true;
        },
        u: (k) => (rotY.current = angleLerp(startRot, dir, smooth(k))),
      },
      {
        get d() {
          return Math.max(0.35, dist / 2.1) / speed;
        },
        u: (k) => {
          pos.current.lerpVectors(from, to, k < 0.12 ? (k * k) / 0.24 : k > 0.88 ? 1 - ((1 - k) * (1 - k)) / 0.24 : k);
        },
        e: () => {
          pos.current.copy(to);
          ctrl.current.moving = false;
          ctrl.current.mode = carry ? "carry" : "idle";
        },
      },
    ];
  };

  const turnTo = (target: number, d = 0.4): Step => {
    let start = 0;
    return { d: d / speed, s: () => (start = rotY.current), u: (k) => (rotY.current = angleLerp(start, target, smooth(k))) };
  };

  // --- pedir un libro ---
  useEffect(() => {
    if (!command) return;
    const slot = slotById(command.book);
    const [bx, by] = slotCenter(slot);
    const feetY = Math.max(0, by - 1.02);
    const along = feetY / Math.cos(LADDER_ANGLE);
    const foot = new THREE.Vector3(bx, 0, LADDER.baseZ + 0.45);
    busy.current = true;
    anim.current = { id: null, pull: 0, hidden: false };
    ctrl.current.holding = false;

    const onLadder = (a: number) => {
      const p = ladderPoint(bx, a);
      pos.current.set(p.x, p.y, p.z + 0.24);
    };

    run([
      { d: 0.55 / speed, s: () => { onPhase("ack"); ctrl.current.mode = "idle"; ctrl.current.look = 0.3; } },
      // la escalera rueda hacia el libro mientras Nigi camina
      {
        d: 0.01,
        s: () => {
          ctrl.current.look = 0;
          onPhase("walking");
          ladderTarget.current = bx;
        },
      },
      ...walkSteps(foot, false),
      { d: 0.05, until: () => Math.abs(ladderX.current - bx) < 0.03 },
      turnTo(Math.PI, 0.45),
      { d: 0.35 / speed, s: () => (ctrl.current.mode = "climb"), u: (k) => pos.current.set(bx, k * 0.12, lerp(foot.z, LADDER.baseZ + 0.24, k)) },
      // subir
      {
        d: Math.max(0.6, along / 1.5) / speed,
        s: () => onPhase("climbing"),
        u: (k) => {
          onLadder(ease(k) * along);
          follow.current = k;
        },
      },
      // alcanzar y sacar el libro
      { d: 0.5 / speed, s: () => { ctrl.current.mode = "reach"; onPhase("grabbing"); anim.current.id = slot.id; } , u: (k) => (anim.current.pull = ease(k)) },
      { d: 0.35 / speed, s: () => { anim.current.hidden = true; ctrl.current.holding = true; ctrl.current.bookColor = slot.color; ctrl.current.mode = "climb"; } },
      // bajar
      {
        d: Math.max(0.5, along / 1.9) / speed,
        s: () => onPhase("descending"),
        u: (k) => {
          onLadder((1 - ease(k)) * along);
          follow.current = 1 - k;
        },
      },
      { d: 0.35 / speed, s: () => (ctrl.current.mode = "carry"), u: (k) => pos.current.set(bx, 0, lerp(LADDER.baseZ + 0.24, foot.z, k)) },
      ...walkSteps(PRESENT, true),
      turnTo(0, 0.5),
      { d: 1.25 / speed, s: () => { ctrl.current.mode = "present"; onPhase("presenting"); } },
      // zambullida en el ojo de Nigi
      {
        d: (reduced ? 0.3 : 1.35),
        s: () => {
          onPhase("diving");
          camMode.current = "dive";
          diveFrom.current.pos.copy(camera.position);
          diveFrom.current.look.copy(camLook.current);
        },
        u: (k) => {
          const e = new THREE.Vector3();
          eye.current?.getWorldPosition(e);
          const fwd = new THREE.Vector3(Math.sin(rotY.current), 0, Math.cos(rotY.current));
          const target = e.clone().addScaledVector(fwd, 0.1);
          const kk = ease(k);
          camera.position.lerpVectors(diveFrom.current.pos, target, kk);
          camLook.current.lerpVectors(diveFrom.current.look, e, Math.min(1, kk * 1.4));
          persp.fov = lerp(40, 22, kk);
          persp.updateProjectionMatrix();
        },
        e: () => {
          // detrás del lector: la biblioteca se ve desenfocada "a través de los ojos"
          camMode.current = "inside";
          camera.position.copy(INSIDE.pos);
          camLook.current.copy(INSIDE.look);
          persp.fov = 40;
          persp.updateProjectionMatrix();
          onRead();
        },
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  // --- cerrar el lector: volver, devolver el libro volando ---
  useEffect(() => {
    if (readerOpen) {
      wasReading.current = true;
      return;
    }
    if (!wasReading.current) return;
    wasReading.current = false;
    const slot = anim.current.id ? slotById(anim.current.id) : null;
    run([
      {
        d: 0.01,
        s: () => {
          onPhase("returning");
          camMode.current = "free";
          persp.fov = 40;
          persp.updateProjectionMatrix();
          ctrl.current.mode = "carry";
        },
      },
      { d: 0.9 / speed },
      {
        d: 1.3 / speed,
        s: () => {
          if (!slot) return;
          ctrl.current.holding = false;
          ctrl.current.mode = "wave";
          const from = new THREE.Vector3();
          robot.current.localToWorld(from.set(0, 0.8, 0.4));
          fly.current = { active: true, from, to: new THREE.Vector3(...slotCenter(slot)), k: 0, color: slot.color, slot };
        },
        u: (k) => (fly.current.k = k),
        e: () => {
          fly.current.active = false;
          anim.current = { id: null, pull: 0, hidden: false };
        },
      },
      ...walkSteps(HOME, false),
      turnTo(-0.25, 0.4),
      { d: 0.01, s: () => { busy.current = false; ctrl.current.mode = "idle"; onPhase("idle"); } },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readerOpen]);

  useFrame((state, dt) => {
    // cola de pasos
    if (!cur.current && queue.current.length) {
      cur.current = { step: queue.current.shift()!, t: 0 };
      cur.current.step.s?.();
    }
    if (cur.current) {
      const c = cur.current;
      c.t += dt;
      const k = Math.min(1, c.t / Math.max(0.0001, c.step.d));
      c.step.u?.(k);
      if (k >= 1 && (!c.step.until || c.step.until())) {
        c.step.e?.();
        cur.current = null;
      }
    }

    // robot
    robot.current.position.copy(pos.current);
    robot.current.rotation.y = rotY.current;

    // cámara
    const base = baseCamera(size.width / size.height);
    if (camMode.current === "free") {
      const f = smooth(Math.min(1, follow.current));
      const rx = pos.current.x;
      const portrait = size.width / size.height < 0.75;
      const px = portrait ? 0 : pointer.x * 0.55;
      const py = portrait ? 0 : pointer.y * 0.3;
      const fx = portrait ? 0.8 : 0.18 * f;
      const lx = portrait ? 0.85 : 0.3 * f;
      const wantPos = base.pos.clone().add(new THREE.Vector3(px + rx * fx, py + pos.current.y * 0.35 * f, -f * (portrait ? 2.5 : 1.2)));
      const wantLook = base.look.clone().add(new THREE.Vector3(rx * lx, pos.current.y * 0.5 * f, 0));
      const l = state.clock.elapsedTime < 3 ? 1.6 : 3;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, wantPos.x, l, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, wantPos.y, l, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, wantPos.z, l, dt);
      camLook.current.x = THREE.MathUtils.damp(camLook.current.x, wantLook.x, l, dt);
      camLook.current.y = THREE.MathUtils.damp(camLook.current.y, wantLook.y, l, dt);
      camLook.current.z = THREE.MathUtils.damp(camLook.current.z, wantLook.z, l, dt);
    }
    camera.lookAt(camLook.current);

    // proyectar globo de diálogo y etiqueta del libro
    const toScreen = (v: THREE.Vector3) => {
      proj.copy(v).project(camera);
      return [(proj.x * 0.5 + 0.5) * size.width, (-proj.y * 0.5 + 0.5) * size.height, proj.z] as const;
    };
    const b = overlay.bubble.current;
    if (b) {
      const [x, y] = toScreen(new THREE.Vector3(pos.current.x, pos.current.y + 1.62, pos.current.z));
      b.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
    }
    const l = overlay.label.current;
    if (l) {
      const h = hovered.current;
      if (h.id && camMode.current === "free") {
        const [x, y] = toScreen(h.pos);
        l.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
        l.style.opacity = "1";
        if (overlay.labelText.current) overlay.labelText.current.textContent = bookTitles[h.id];
      } else l.style.opacity = "0";
    }
  });

  return (
    <>
      <group
        ref={robot}
        onClick={(e) => {
          e.stopPropagation();
          if (busy.current) return;
          ctrl.current.mode = "wave";
          setTimeout(() => !busy.current && (ctrl.current.mode = "idle"), 1800);
          onRobotClick();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <Robot3D ctrl={ctrl} eyeRef={eye} />
      </group>
      {SLOTS.map((s) => (
        <InteractiveBook key={s.id} slot={s} title={bookTitles[s.id]} anim={anim} hovered={hovered} disabled={props.busy} onClick={() => onBookClick(s.id)} />
      ))}
      <FlyingBook fly={fly} />
    </>
  );
}

const ambColor = mix("#ffd9b0", "#fff1de");
const hemiSky = mix("#ffd7a8", "#fff4e0");
const hemiGround = mix("#2a1a10", "#6b5040");
function Lights({ shadows, k }: { shadows: boolean; k: DayRef }) {
  const amb = useRef<THREE.AmbientLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const spot = useRef<THREE.SpotLight>(null!);
  const moon = useRef<THREE.DirectionalLight>(null!);
  const sunL = useRef<THREE.DirectionalLight>(null!);
  const sunR = useRef<THREE.DirectionalLight>(null!);
  useFrame(() => {
    const v = k.current;
    amb.current.intensity = 0.28 + v * 0.85;
    ambColor(v, amb.current.color);
    hemi.current.intensity = 0.45 + v * 1.1;
    hemiSky(v, hemi.current.color);
    hemiGround(v, hemi.current.groundColor);
    spot.current.intensity = 2.6 + v * 0.9;
    moon.current.intensity = 0.45 * (1 - v);
    sunL.current.intensity = v * 2.2;
    sunR.current.intensity = v * 1.8;
  });
  return (
    <>
      <ambientLight ref={amb} intensity={0.28} color="#ffd9b0" />
      <hemisphereLight ref={hemi} args={["#ffd7a8", "#2a1a10", 0.45]} />
      <spotLight
        ref={spot}
        position={[4.5, 9, 8]}
        angle={0.55}
        penumbra={0.8}
        intensity={2.6}
        decay={0}
        color="#ffe0b8"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        target-position={[0, 2.4, 0]}
      />
      <directionalLight ref={moon} position={[-9, 5, 4]} intensity={0.45} color="#8fb6ff" />
      {/* luz de sol entrando por las ventanas */}
      <directionalLight ref={sunL} position={[-9, 7, 1]} intensity={0} color="#ffe7b8" />
      <directionalLight ref={sunR} position={[9, 7, 1]} intensity={0} color="#ffe7b8" />
      <pointLight position={[0, 1.2, 5]} intensity={0.6} color="#7cebf5" distance={6} decay={1.5} />
    </>
  );
}

function ReadyNotifier({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

export default function Scene3D(props: Props) {
  const ladderX = useRef(3.2);
  const ladderTarget = useRef(3.2);
  const dayK = useRef(props.day ? 1 : 0);
  const [mobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  const shadows = !mobile;
  return (
    <Canvas
      shadows={shadows}
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ fov: 40, near: 0.05, far: 80, position: [0, 6.5, 24] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={() => (document.body.style.cursor = "")}
    >
      <color attach="background" args={["#140e0a"]} />
      <fog attach="fog" args={["#140e0a", 14, 34]} />
      <DayCycle day={props.day} k={dayK} />
      <Suspense fallback={null}>
        <Lights shadows={shadows} k={dayK} />
        <Room k={dayK} />
        <Shelf />
        <DecoBooks />
        <Ladder xRef={ladderX} target={ladderTarget} />
        <Director {...props} ladderX={ladderX} ladderTarget={ladderTarget} />
        <ContactShadows position={[0, 0.01, 2.6]} scale={12} blur={2.6} far={3} opacity={0.55} resolution={512} />
        <Sparkles count={mobile ? 50 : 110} scale={[14, 7, 6]} position={[0, 3.4, 2]} size={2.2} speed={0.25} opacity={0.5} color="#ffd9a0" />
        {!mobile && (
          <EffectComposer multisampling={4}>
            <Bloom intensity={0.75} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur />
            <Vignette offset={0.22} darkness={0.75} />
          </EffectComposer>
        )}
        <ReadyNotifier onReady={props.onReady} />
      </Suspense>
    </Canvas>
  );
}
