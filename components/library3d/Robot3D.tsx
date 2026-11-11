"use client";

import { forwardRef, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export type RobotMode = "idle" | "walk" | "climb" | "reach" | "carry" | "present" | "wave";

export type RobotCtrl = {
  mode: RobotMode;
  talking: boolean;
  holding: boolean;
  bookColor: string;
  look: number; // giro de cabeza extra (rad)
  moving: boolean; // en modo carry: ¿camina?
};

const damp = THREE.MathUtils.damp;

function useMaterials() {
  return useMemo(
    () => ({
      orange: new THREE.MeshPhysicalMaterial({ color: "#f2843a", roughness: 0.36, clearcoat: 1, clearcoatRoughness: 0.22, sheen: 0.4, sheenColor: new THREE.Color("#ffd2a8") }),
      orangeDark: new THREE.MeshPhysicalMaterial({ color: "#d4621c", roughness: 0.42, clearcoat: 0.6 }),
      dark: new THREE.MeshStandardMaterial({ color: "#3d241c", roughness: 0.5, metalness: 0.25 }),
      cream: new THREE.MeshPhysicalMaterial({ color: "#f4e7d6", roughness: 0.35, clearcoat: 0.8 }),
      face: new THREE.MeshPhysicalMaterial({ color: "#fbf1ee", roughness: 0.2, clearcoat: 1, emissive: "#ffd9d0", emissiveIntensity: 0.22 }),
      eye: new THREE.MeshStandardMaterial({ color: "#151213", roughness: 0.15 }),
      blush: new THREE.MeshBasicMaterial({ color: "#ff9d8a", transparent: true, opacity: 0.55 }),
      white: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
      metal: new THREE.MeshStandardMaterial({ color: "#e8e6e2", roughness: 0.25, metalness: 0.7 }),
      glow: new THREE.MeshStandardMaterial({ color: "#7cebf5", emissive: "#5fe6f5", emissiveIntensity: 3.2, toneMapped: false }),
    }),
    [],
  );
}

type Props = { ctrl: MutableRefObject<RobotCtrl>; eyeRef?: MutableRefObject<THREE.Object3D | null> };

const Robot3D = forwardRef<THREE.Group, Props>(function Robot3D({ ctrl, eyeRef }, ref) {
  const m = useMaterials();
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const eyes = useRef<THREE.Group>(null!);
  const mouth = useRef<THREE.Mesh>(null!);
  const antenna = useRef<THREE.Group>(null!);
  const book = useRef<THREE.Group>(null!);
  const bookMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#c4561e", roughness: 0.5, clearcoat: 0.4 }), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const phase = useRef(0);
  const blink = useRef({ next: 2.5, t: -1 });

  useFrame((state, dt) => {
    const c = ctrl.current;
    const t = state.clock.elapsedTime;
    const mode = c.mode;
    phase.current += dt * (mode === "walk" ? 9.5 : mode === "climb" ? 6.5 : mode === "carry" ? 9 : 2);
    const p = phase.current;
    const s = Math.sin(p);

    let lx = 0, rx = 0, alx = 0, arx = 0, alz = 0.1, arz = -0.1, bob = Math.sin(t * 2) * 0.012, hx = Math.sin(t * 0.7) * 0.04, hz = Math.sin(t * 0.9) * 0.05, lean = 0;
    switch (mode) {
      case "walk":
        lx = s * 0.6; rx = -s * 0.6; alx = -s * 0.5; arx = s * 0.5; bob = Math.abs(s) * 0.05; hz = s * 0.04; lean = 0.05;
        break;
      case "carry":
        if (c.moving) { lx = s * 0.55; rx = -s * 0.55; bob = Math.abs(s) * 0.045; }
        alx = -1.25; arx = -1.25; alz = 0.25; arz = -0.25;
        break;
      case "climb":
        alx = -2.7 + s * 0.4; arx = -2.7 - s * 0.4; lx = -0.55 + s * 0.55; rx = -0.55 - s * 0.55; bob = Math.abs(s) * 0.03; hx = -0.25;
        break;
      case "reach":
        arx = -2.2; alx = -2.7; arz = -0.15; hx = -0.3;
        break;
      case "present":
        alx = -1.1; arx = -1.1; alz = 0.3; arz = -0.3; hx = 0.22 + Math.sin(t * 1.3) * 0.03;
        break;
      case "wave":
        arx = -2.9; arz = -0.5 + Math.sin(t * 9) * 0.35; hz = 0.12; bob = Math.abs(Math.sin(t * 4.5)) * 0.03;
        break;
    }

    legL.current.rotation.x = damp(legL.current.rotation.x, lx, 12, dt);
    legR.current.rotation.x = damp(legR.current.rotation.x, rx, 12, dt);
    armL.current.rotation.x = damp(armL.current.rotation.x, alx, 9, dt);
    armR.current.rotation.x = damp(armR.current.rotation.x, arx, 9, dt);
    armL.current.rotation.z = damp(armL.current.rotation.z, alz, 9, dt);
    armR.current.rotation.z = damp(armR.current.rotation.z, arz, 9, dt);
    body.current.position.y = damp(body.current.position.y, bob, 14, dt);
    body.current.rotation.x = damp(body.current.rotation.x, lean, 8, dt);
    const talkTilt = c.talking ? Math.sin(t * 6) * 0.06 : 0;
    head.current.rotation.x = damp(head.current.rotation.x, hx, 6, dt);
    head.current.rotation.z = damp(head.current.rotation.z, hz + talkTilt, 6, dt);
    head.current.rotation.y = damp(head.current.rotation.y, c.look, 5, dt);
    // antenas que rebotan con el movimiento
    antenna.current.rotation.z = damp(antenna.current.rotation.z, Math.sin(t * 5) * (mode === "idle" ? 0.04 : 0.14), 10, dt);

    // parpadeo
    const b = blink.current;
    if (t > b.next) { b.t = t; b.next = t + 2.5 + Math.random() * 3; }
    const k = b.t > 0 ? Math.min(1, (t - b.t) / 0.16) : 1;
    eyes.current.scale.y = k < 1 ? Math.abs(Math.cos(k * Math.PI)) * 0.9 + 0.1 : 1;

    // boca al hablar
    mouth.current.scale.y = damp(mouth.current.scale.y, c.talking ? 1 + Math.abs(Math.sin(t * 17)) * 1.6 : 1, 20, dt);

    // libro en manos
    book.current.visible = c.holding;
    if (c.holding) {
      bookMat.color.set(c.bookColor);
      const presenting = mode === "present";
      target.set(0, presenting ? 0.56 : 0.6, presenting ? 0.4 : 0.3);
      book.current.position.lerp(target, 0.15);
      book.current.rotation.x = damp(book.current.rotation.x, presenting ? -0.75 : 0, 6, dt);
    }
  });

  return (
    <group ref={ref}>
      <group ref={body}>
        {/* piernas */}
        {[
          { r: legL, x: -0.12 },
          { r: legR, x: 0.12 },
        ].map(({ r, x }) => (
          <group key={x} ref={r} position={[x, 0.4, 0]}>
            <mesh material={m.dark} position={[0, -0.03, 0]} castShadow>
              <sphereGeometry args={[0.075, 20, 20]} />
            </mesh>
            <mesh material={m.orange} position={[0, -0.17, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.12, 8, 16]} />
            </mesh>
            <mesh material={m.metal} position={[0, -0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.1, 0.014, 10, 32]} />
            </mesh>
            <RoundedBox args={[0.2, 0.14, 0.27]} radius={0.06} position={[0, -0.33, 0.03]} material={m.orange} castShadow />
            <RoundedBox args={[0.205, 0.04, 0.275]} radius={0.015} position={[0, -0.39, 0.03]} material={m.dark} />
            <mesh material={m.dark} position={[0, -0.32, 0.165]}>
              <sphereGeometry args={[0.028, 12, 12]} />
            </mesh>
          </group>
        ))}

        {/* cinturón y torso */}
        <mesh material={m.dark} position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.185, 0.175, 0.06, 28]} />
        </mesh>
        <mesh material={m.orange} position={[0, 0.6, 0]} scale={[1, 1, 0.85]} castShadow>
          <capsuleGeometry args={[0.205, 0.14, 12, 28]} />
        </mesh>
        {/* placa del pecho con luz */}
        <RoundedBox args={[0.12, 0.08, 0.03]} radius={0.014} position={[0.07, 0.65, 0.168]} material={m.cream} />
        <mesh material={m.glow} position={[0.07, 0.65, 0.185]}>
          <boxGeometry args={[0.065, 0.024, 0.005]} />
        </mesh>
        {/* parches y tornillos */}
        <RoundedBox args={[0.07, 0.05, 0.02]} radius={0.01} position={[-0.09, 0.56, 0.165]} rotation={[0, 0, 0.2]} material={m.cream} />
        {[[-0.08, 0.5], [0.1, 0.52], [-0.13, 0.68]].map(([x, y]) => (
          <mesh key={`${x}${y}`} material={m.dark} position={[x, y, 0.17]}>
            <sphereGeometry args={[0.014, 10, 10]} />
          </mesh>
        ))}

        {/* brazos */}
        {[
          { r: armL, x: -0.27, side: -1 },
          { r: armR, x: 0.27, side: 1 },
        ].map(({ r, x, side }) => (
          <group key={x} ref={r} position={[x, 0.73, 0]}>
            <mesh material={m.dark} castShadow>
              <sphereGeometry args={[0.078, 20, 20]} />
            </mesh>
            <mesh material={m.orange} position={[side * 0.02, 0.03, 0]} scale={[1.15, 0.8, 1.1]} castShadow>
              <sphereGeometry args={[0.1, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            </mesh>
            <mesh material={m.orange} position={[side * 0.01, -0.15, 0]} castShadow>
              <capsuleGeometry args={[0.066, 0.14, 8, 16]} />
            </mesh>
            <mesh material={m.glow} position={[side * 0.05, -0.13, 0.045]}>
              <sphereGeometry args={[0.018, 12, 12]} />
            </mesh>
            <mesh material={m.metal} position={[side * 0.01, -0.235, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.064, 0.011, 8, 24]} />
            </mesh>
            <mesh material={m.dark} position={[side * 0.01, -0.29, 0]} castShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
            </mesh>
          </group>
        ))}

        {/* libro sostenido */}
        <group ref={book} visible={false} position={[0, 0.6, 0.3]}>
          <RoundedBox args={[0.34, 0.44, 0.08]} radius={0.012} material={bookMat} castShadow />
          <mesh position={[0, 0, 0.041]}>
            <planeGeometry args={[0.26, 0.04]} />
            <meshStandardMaterial color="#e8c27a" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.171, 0, 0]}>
            <boxGeometry args={[0.004, 0.42, 0.07]} />
            <meshStandardMaterial color="#f3ead8" />
          </mesh>
        </group>

        {/* cuello */}
        <mesh material={m.dark} position={[0, 0.83, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.08, 20]} />
        </mesh>

        {/* cabeza */}
        <group ref={head} position={[0, 0.86, 0]}>
          <mesh material={m.orange} position={[0, 0.33, 0]} scale={[1.08, 0.94, 1]} castShadow>
            <sphereGeometry args={[0.38, 48, 48]} />
          </mesh>
          {/* panel crema superior */}
          <mesh material={m.cream} position={[0, 0.33, 0]} scale={[1.09, 0.95, 1.01]} rotation={[-0.35, 0, 0]}>
            <sphereGeometry args={[0.38, 48, 24, Math.PI * 0.62, Math.PI * 0.76, 0, Math.PI * 0.22]} />
          </mesh>
          {[-0.22, 0.24].map((x) => (
            <mesh key={x} material={m.dark} position={[x, 0.5, 0.22]}>
              <sphereGeometry args={[0.012, 8, 8]} />
            </mesh>
          ))}
          {/* visor: marco y pantalla ancha */}
          <RoundedBox args={[0.5, 0.36, 0.16]} radius={0.13} smoothness={6} position={[0.03, 0.29, 0.31]} material={m.orangeDark} />
          <RoundedBox args={[0.45, 0.31, 0.14]} radius={0.12} smoothness={6} position={[0.03, 0.29, 0.335]} material={m.face} />
          <group ref={eyes} position={[0.03, 0.31, 0.405]}>
            {[-0.1, 0.1].map((x) => (
              <group key={x} position={[x, 0, 0]}>
                <mesh material={m.eye} scale={[1, 1.3, 0.4]}>
                  <sphereGeometry args={[0.055, 28, 28]} />
                </mesh>
                <mesh material={m.white} position={[0.018, 0.032, 0.02]}>
                  <sphereGeometry args={[0.012, 10, 10]} />
                </mesh>
                <mesh material={m.white} position={[-0.016, -0.03, 0.02]}>
                  <sphereGeometry args={[0.006, 8, 8]} />
                </mesh>
              </group>
            ))}
            <object3D ref={eyeRef ?? undefined} position={[0, 0, 0.05]} />
          </group>
          {/* mejillas */}
          {[-0.16, 0.16].map((x) => (
            <mesh key={x} material={m.blush} position={[0.03 + x, 0.225, 0.404]} scale={[1, 0.6, 1]}>
              <circleGeometry args={[0.028, 20]} />
            </mesh>
          ))}
          <mesh ref={mouth} material={m.eye} position={[0.03, 0.215, 0.41]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.026, 0.006, 8, 24, Math.PI]} />
          </mesh>
          {/* auricular con luz */}
          <group position={[-0.38, 0.3, 0.02]} rotation={[0, 0, Math.PI / 2]}>
            <mesh material={m.orangeDark}>
              <cylinderGeometry args={[0.14, 0.14, 0.08, 36]} />
            </mesh>
            <mesh material={m.orange} position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.11, 0.12, 0.05, 36]} />
            </mesh>
            <mesh material={m.metal} position={[0, 0.055, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.015, 28]} />
            </mesh>
            <mesh material={m.glow} position={[0, 0.065, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.02, 24]} />
            </mesh>
            <pointLight color="#7cebf5" intensity={0.6} distance={1.2} position={[0, 0.2, 0]} />
          </group>
          {/* auricular derecho pequeño */}
          <mesh material={m.orangeDark} position={[0.4, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 28]} />
          </mesh>
          {/* antenas */}
          <group ref={antenna}>
            <group position={[-0.14, 0.68, 0.02]} rotation={[0, 0, 0.38]}>
              <mesh material={m.dark}>
                <cylinderGeometry args={[0.022, 0.026, 0.13, 12]} />
              </mesh>
            </group>
            <group position={[0.17, 0.67, -0.02]} rotation={[0, 0, -0.32]}>
              <mesh material={m.dark}>
                <cylinderGeometry args={[0.022, 0.026, 0.13, 12]} />
              </mesh>
              <mesh material={m.orange} position={[0, 0.08, 0]}>
                <sphereGeometry args={[0.03, 12, 12]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
});

export default Robot3D;
