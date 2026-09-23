import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ContentItem, Brand } from '../types/content';
import { Eye, Users, Sparkles, Compass, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface ThreeSceneProps {
  brand: Brand;
  items: ContentItem[];
  selectedItemId: string | null;
  onSelectItem: (item: ContentItem) => void;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  brand,
  items,
  selectedItemId,
  onSelectItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'galaxy' | 'rings'>('carousel');
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);
  const [hoveredViews, setHoveredViews] = useState<number | null>(null);

  // References to keep state across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cardMeshesRef = useRef<{ mesh: THREE.Mesh; item: ContentItem }[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Drag rotation state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.003 });
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0c14, 0.035);

    // 2. Camera setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 3, 14);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xf59e0b, 2.5, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2.5, 50);
    pointLight2.position.set(-10, -5, -10);
    scene.add(pointLight2);

    // 5. Interactive Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    groupRef.current = mainGroup;

    // 6. Ground holographic grid
    const gridHelper = new THREE.GridHelper(30, 30, 0xd97706, 0x1e293b);
    gridHelper.position.y = -3.5;
    scene.add(gridHelper);

    // 7. Dynamic Particle Nebula (Reacts to Views and Followers)
    const particleCount = 1200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(brand.primaryColor || '#d97706');
    const color2 = new THREE.Color(brand.accentColor || '#38bdf8');

    for (let i = 0; i < particleCount; i++) {
      const radius = 6 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.7;

      particlePositions[i * 3] = radius * Math.cos(phi) * Math.sin(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * 0.6;
      particlePositions[i * 3 + 2] = radius * Math.cos(phi) * Math.cos(theta);

      const mixedColor = color1.clone().lerp(color2, Math.random());
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // 8. Central Core Hologram
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: true,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Glowing Inner Orb
    const innerOrbGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const innerOrbMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
    });
    const innerOrb = new THREE.Mesh(innerOrbGeo, innerOrbMat);
    mainGroup.add(innerOrb);

    // 9. Generate 3D Reel Cards in Carousel / Orbit Formation
    cardMeshesRef.current = [];
    const count = Math.max(items.length, 1);
    const radius = 5.2;

    items.forEach((item, index) => {
      const angle = (index / count) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = Math.sin(index * 1.5) * 0.8;

      // Card Canvas Texture for high-res 3D text
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 340;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Gradient card backdrop
        const grad = ctx.createLinearGradient(0, 0, 512, 340);
        grad.addColorStop(0, '#111827');
        grad.addColorStop(1, '#1e293b');
        ctx.fillStyle = grad;
        ctx.roundRect(10, 10, 492, 320, 24);
        ctx.fill();

        // Border glow
        ctx.lineWidth = 6;
        ctx.strokeStyle = item.status === 'published' ? '#10B981' : item.status === 'scheduled' ? '#3B82F6' : '#F59E0B';
        ctx.stroke();

        // Badge
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.roundRect(30, 30, 140, 34, 12);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`REEL #${item.itemNumber}`, 45, 54);

        // Status text
        ctx.font = '16px sans-serif';
        ctx.fillText(item.status.toUpperCase(), 190, 54);

        // Title
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 24px sans-serif';
        const titleStr = item.title.length > 24 ? item.title.slice(0, 24) + '...' : item.title;
        ctx.fillText(titleStr, 30, 120);

        // Metrics box
        ctx.fillStyle = '#0f172a';
        ctx.roundRect(30, 150, 452, 90, 16);
        ctx.fill();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '16px sans-serif';
        ctx.fillText('VERIFIED VIEWS', 50, 182);
        ctx.fillText('INTERACTIONS', 260, 182);

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(item.views.toLocaleString(), 50, 222);

        ctx.fillStyle = '#F59E0B';
        ctx.fillText((item.likes + item.shares + item.inquiries).toLocaleString(), 260, 222);

        // Footer date
        ctx.fillStyle = '#64748B';
        ctx.font = '16px sans-serif';
        ctx.fillText(`Target: ${item.targetDate || 'Flexible'}`, 30, 280);
        ctx.fillText(item.platform, 320, 280);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;

      const cardGeo = new THREE.BoxGeometry(2.4, 1.6, 0.12);
      const cardMat = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.3,
        roughness: 0.2,
        transparent: true,
        opacity: 0.95,
      });

      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardMesh.position.set(x, y, z);
      cardMesh.lookAt(0, y, 0); // Face inward or outward
      cardMesh.rotation.y += Math.PI; // Face outward to camera

      // Add to tracking list
      cardMeshesRef.current.push({ mesh: cardMesh, item });
      mainGroup.add(cardMesh);

      // Connecting holographic beam to center
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z),
      ]);
      const beamMat = new THREE.LineBasicMaterial({
        color: item.status === 'published' ? 0x10b981 : 0xd97706,
        transparent: true,
        opacity: 0.35,
      });
      const beam = new THREE.Line(beamGeo, beamMat);
      mainGroup.add(beam);
    });

    // 10. Raycasting for mouse click & hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Handle drag rotation
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;
        rotationVelocityRef.current.y = deltaX * 0.005;
        rotationVelocityRef.current.x = deltaY * 0.003;

        mainGroup.rotation.y += rotationVelocityRef.current.y;
        mainGroup.rotation.x = Math.max(-0.6, Math.min(0.6, mainGroup.rotation.x + rotationVelocityRef.current.x));

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }

      // Raycast hover
      raycaster.setFromCamera(mouse, camera);
      const meshes = cardMeshesRef.current.map((c) => c.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = cardMeshesRef.current.find((c) => c.mesh === intersects[0].object);
        if (hit) {
          setHoveredTitle(hit.item.title);
          setHoveredViews(hit.item.views);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredTitle(null);
        setHoveredViews(null);
        renderer.domElement.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      renderer.domElement.style.cursor = 'grab';

      // Check click selection
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const meshes = cardMeshesRef.current.map((c) => c.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = cardMeshesRef.current.find((c) => c.mesh === intersects[0].object);
        if (hit) {
          onSelectItem(hit.item);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // 11. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth idle rotation if not dragging
      if (!isDraggingRef.current) {
        mainGroup.rotation.y += 0.0035;
        // Damping velocity
        rotationVelocityRef.current.y *= 0.95;
      }

      // Pulsing central hologram core
      coreMesh.rotation.x = elapsedTime * 0.4;
      coreMesh.rotation.y = elapsedTime * 0.6;
      const pulse = 1 + Math.sin(elapsedTime * 3) * 0.08;
      innerOrb.scale.set(pulse, pulse, pulse);

      // Rotating particle vortex
      if (particlesRef.current) {
        particlesRef.current.rotation.y = -elapsedTime * 0.05;
      }

      // Floating card levitation
      cardMeshesRef.current.forEach(({ mesh, item }, idx) => {
        mesh.position.y += Math.sin(elapsedTime * 2 + idx) * 0.002;
        if (selectedItemId === item.id) {
          mesh.scale.set(1.15, 1.15, 1.15);
        } else {
          mesh.scale.set(1.0, 1.0, 1.0);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 12. Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [items, brand, selectedItemId, isExpanded]);

  const resetCamera = () => {
    if (groupRef.current && cameraRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(0, 3, 14);
    }
  };

  const totalViews = items.reduce((acc, curr) => acc + curr.views, 0);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-950 via-slate-900 to-black shadow-2xl transition-all duration-500 ${
        isExpanded ? 'h-[650px]' : 'h-[360px]'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Overlay Controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/80 to-transparent">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 px-3 py-1.5 border border-amber-500/30 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              3D Holographic Stage
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({items.length} Active Reels)
            </span>
          </div>

          {hoveredTitle && (
            <div className="animate-fade-in flex items-center gap-2 rounded-xl bg-slate-900/95 px-3 py-1.5 border border-cyan-500/40 text-xs backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="font-medium text-slate-100 max-w-[200px] truncate">{hoveredTitle}</span>
              {hoveredViews !== null && (
                <span className="text-cyan-300 font-mono font-bold">
                  {hoveredViews.toLocaleString()} views
                </span>
              )}
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={resetCamera}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 border border-slate-700/60 backdrop-blur-md transition-colors"
            title="Reset 3D Stage Orientation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Angle</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1.5 text-xs text-amber-300 border border-amber-500/40 backdrop-blur-md transition-colors"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Compact Stage</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Expand 3D Stage</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Floating Stats Bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/90 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span>Total Verified Reel Views:</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                {totalViews.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md">
              <Users className="h-4 w-4 text-amber-400" />
              <span>Follower Count:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {brand.currentFollowers.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-slate-400 italic text-[11px]">
            * Click any 3D card or drag to rotate orbit
          </div>
        </div>
      </div>
    </div>
  );
};
