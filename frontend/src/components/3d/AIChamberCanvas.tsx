import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface AIChamberCanvasProps {
  className?: string;
}

export const AIChamberCanvas: React.FC<AIChamberCanvasProps> = ({
  className = "",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const isAvailable = !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
      );
      if (!isAvailable) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    // 1. Scene, Camera, Renderer
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050811, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(8, 14, 8);
    scene.add(dirLight);

    // Cyan Core Light inside Chamber
    const corePointLight = new THREE.PointLight(0x00f2fe, 3.5, 8);
    corePointLight.position.set(0, 1.2, 0);
    scene.add(corePointLight);

    // Lime Accent Light
    const limePointLight = new THREE.PointLight(0x10b981, 2.5, 6);
    limePointLight.position.set(2.5, 2.0, -1.5);
    scene.add(limePointLight);

    // 3. Isometric Grid Floor
    const gridGroup = new THREE.Group();
    const gridHelper = new THREE.GridHelper(24, 28, 0x00f2fe, 0x1e293b);
    gridHelper.position.y = -1.6;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.45;
    gridGroup.add(gridHelper);
    scene.add(gridGroup);

    // 4. Central Chamber Platform Base
    const baseGroup = new THREE.Group();
    const pedestalGeo = new THREE.BoxGeometry(3.2, 0.4, 3.2);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x111928,
      roughness: 0.2,
      metalness: 0.8,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.2;
    baseGroup.add(pedestal);

    // Glowing rim
    const rimGeo = new THREE.TorusGeometry(1.65, 0.04, 16, 64);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = -1.0;
    baseGroup.add(rim);

    // 5. Translucent Glass Chamber Cylinder
    const cylinderGeo = new THREE.CylinderGeometry(1.4, 1.4, 3.0, 36, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xc7f9ff,
      transmission: 0.88,
      opacity: 0.85,
      transparent: true,
      roughness: 0.08,
      ior: 1.52,
      thickness: 0.6,
      reflectivity: 0.9,
    });
    const cylinder = new THREE.Mesh(cylinderGeo, glassMat);
    cylinder.position.y = 0.5;
    baseGroup.add(cylinder);

    // Glass Chamber Top Cap & Base Cap
    const capGeo = new THREE.CylinderGeometry(1.48, 1.48, 0.12, 36);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = 2.06;
    const btmCap = new THREE.Mesh(capGeo, capMat);
    btmCap.position.y = -1.0;
    baseGroup.add(topCap);
    baseGroup.add(btmCap);

    // 6. Inside Chamber: Floating Core Network
    const coreGroup = new THREE.Group();
    const coreSymGeo = new THREE.TorusKnotGeometry(0.42, 0.12, 64, 16, 2, 3);
    const coreSymMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00a8ff,
      emissiveIntensity: 0.65,
      metalness: 0.9,
      roughness: 0.1,
    });
    const coreSymbol = new THREE.Mesh(coreSymGeo, coreSymMat);
    coreSymbol.position.y = 0.2;
    coreGroup.add(coreSymbol);

    // Floating internal graph nodes inside chamber
    const nodeSpheres: THREE.Mesh[] = [];
    const nodeCoords = [
      [0.6, 1.2, 0.4],
      [-0.5, 1.3, -0.3],
      [0.3, 1.5, -0.6],
      [-0.6, 0.9, 0.5],
      [0.0, 1.7, 0.2],
    ];
    const sphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const cyanNodeMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const greenNodeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    nodeCoords.forEach((coord, i) => {
      const mesh = new THREE.Mesh(sphereGeo, i % 2 === 0 ? cyanNodeMat : greenNodeMat);
      mesh.position.set(coord[0], coord[1], coord[2]);
      coreGroup.add(mesh);
      nodeSpheres.push(mesh);
    });

    // Connecting lines between nodes
    const linesPoints = [
      new THREE.Vector3(0.6, 1.2, 0.4),
      new THREE.Vector3(0.0, 1.7, 0.2),
      new THREE.Vector3(-0.5, 1.3, -0.3),
      new THREE.Vector3(0.3, 1.5, -0.6),
      new THREE.Vector3(0.6, 1.2, 0.4),
    ];
    const linesGeo = new THREE.BufferGeometry().setFromPoints(linesPoints);
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.65,
    });
    const linesMesh = new THREE.Line(linesGeo, linesMat);
    coreGroup.add(linesMesh);

    scene.add(baseGroup);
    scene.add(coreGroup);

    // 7. Satellite Modules
    // Module 1: Gyroscopic Quantum Orbiting Rings (Right side)
    const gyroGroup = new THREE.Group();
    gyroGroup.position.set(3.4, 0.9, -1.2);
    const ring1Geo = new THREE.TorusGeometry(0.7, 0.025, 16, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    const ring2Geo = new THREE.TorusGeometry(0.55, 0.025, 16, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotateX(Math.PI / 3);
    const gyroCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.8 })
    );
    gyroGroup.add(ring1);
    gyroGroup.add(ring2);
    gyroGroup.add(gyroCore);
    scene.add(gyroGroup);

    // Module 2: Tiered Data Silos (Left side)
    const silosGroup = new THREE.Group();
    silosGroup.position.set(-3.2, 0.4, -1.0);
    const siloGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.8, 24);
    const siloMatCyan = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      metalness: 0.6,
      roughness: 0.3,
    });
    const siloMatGreen = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.6,
      roughness: 0.3,
    });
    const s1 = new THREE.Mesh(siloGeo, siloMatCyan);
    s1.position.set(-0.35, 0, 0);
    const s2 = new THREE.Mesh(siloGeo, siloMatGreen);
    s2.position.set(0.35, 0.2, 0.2);
    silosGroup.add(s1);
    silosGroup.add(s2);
    scene.add(silosGroup);

    // 8. Conveyor Pipelines & Flowing Particles
    const conveyorCurves: THREE.CatmullRomCurve3[] = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.2, -1.1, 1.2),
        new THREE.Vector3(2.4, -1.3, 2.2),
        new THREE.Vector3(3.8, -1.5, 3.2),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.2, -1.1, 1.2),
        new THREE.Vector3(-2.4, -1.3, 2.2),
        new THREE.Vector3(-3.8, -1.5, 3.2),
      ]),
    ];

    conveyorCurves.forEach((curve) => {
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.16, 12, false);
      const tubeMat = new THREE.MeshPhysicalMaterial({
        color: 0x67e8f9,
        transmission: 0.8,
        opacity: 0.7,
        transparent: true,
        roughness: 0.2,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);
    });

    // Conveyor flow particles (cubes & spheres moving along paths)
    const particleItems: { mesh: THREE.Mesh; curveIndex: number; t: number; speed: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const isCube = i % 2 === 0;
      const pGeo = isCube ? new THREE.BoxGeometry(0.14, 0.14, 0.14) : new THREE.SphereGeometry(0.09, 12, 12);
      const pMat = new THREE.MeshBasicMaterial({ color: isCube ? 0x00f2fe : 0x10b981 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      scene.add(pMesh);
      particleItems.push({
        mesh: pMesh,
        curveIndex: i % 2,
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.003,
      });
    }

    // 9. Mouse Interactive Parallax
    let targetX = 0;
    let targetY = 5;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 1.5;
      targetY = 5 + y * 0.8;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 10. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 11. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera smooth lerp
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0.4, 0);

      // Rotate core symbol
      coreSymbol.rotation.x = time * 0.4;
      coreSymbol.rotation.y = time * 0.6;

      // Float internal nodes gently
      nodeSpheres.forEach((node, i) => {
        node.position.y += Math.sin(time * 2 + i) * 0.0015;
      });

      // Rotate gyro satellite
      ring1.rotation.x = time * 0.8;
      ring1.rotation.y = time * 0.5;
      ring2.rotation.z = time * 0.9;
      gyroGroup.position.y = 0.9 + Math.sin(time * 1.5) * 0.08;

      // Float silos
      silosGroup.position.y = 0.4 + Math.sin(time * 1.2) * 0.06;

      // Move pipeline particles
      particleItems.forEach((p) => {
        p.t = (p.t + p.speed) % 1;
        const curve = conveyorCurves[p.curveIndex];
        const point = curve.getPointAt(p.t);
        p.mesh.position.copy(point);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`ai-chamber-canvas-root ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "440px",
        overflow: "hidden",
      }}
      aria-label="Interactive 3D AI Intelligence Chamber"
    >
      {!webglSupported && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle, rgba(0, 242, 254, 0.1) 0%, rgba(5, 8, 17, 0.9) 80%)",
            color: "var(--accent-cyan)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Rendering high-precision SVG/CSS isometric scene...
        </div>
      )}
    </div>
  );
};
