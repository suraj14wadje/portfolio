// 3D Hero Scene — Three.js wireframe icosahedron with mouse parallax
(function() {
  const wrap = document.getElementById("hero-3d");
  if (!wrap || !window.THREE) return;

  const THREE = window.THREE;
  const scene = new THREE.Scene();

  const getSize = () => Math.min(wrap.clientWidth, wrap.clientHeight) || 500;
  let size = getSize();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size, size);
  renderer.setClearColor(0x000000, 0);
  wrap.appendChild(renderer.domElement);

  // Read current accent palette from CSS vars
  const readColor = (name, fallback) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v ? new THREE.Color(v) : new THREE.Color(fallback);
  };

  const cA = readColor("--grad-a", "#a855f7");
  const cB = readColor("--grad-b", "#ec4899");
  const cC = readColor("--grad-c", "#f59e0b");

  const group = new THREE.Group();
  scene.add(group);

  // Main icosahedron — wireframe with gradient-feeling vertex colors
  const geom = new THREE.IcosahedronGeometry(1.6, 1);
  const positions = geom.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const t = (y + 1.6) / 3.2;
    tmp.copy(cA).lerp(cB, t).lerp(cC, t * t);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const wireMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
  });
  const wire = new THREE.Mesh(geom, wireMat);
  group.add(wire);

  // Inner glow sphere
  const innerGeom = new THREE.IcosahedronGeometry(1.05, 2);
  const innerMat = new THREE.MeshBasicMaterial({
    color: cA,
    transparent: true,
    opacity: 0.06,
  });
  const inner = new THREE.Mesh(innerGeom, innerMat);
  group.add(inner);

  // Vertex dots
  const dotGeom = new THREE.BufferGeometry();
  const dotPositions = [];
  for (let i = 0; i < positions.count; i++) {
    dotPositions.push(positions.getX(i), positions.getY(i), positions.getZ(i));
  }
  dotGeom.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
  const dotMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.04,
    transparent: true,
    opacity: 0.9,
  });
  const dots = new THREE.Points(dotGeom, dotMat);
  group.add(dots);

  // Orbiting torus rings
  const ringGroup = new THREE.Group();
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.005, 8, 80),
    new THREE.MeshBasicMaterial({ color: cA, transparent: true, opacity: 0.35 })
  );
  ring1.rotation.x = Math.PI / 2.2;
  ringGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.004, 8, 80),
    new THREE.MeshBasicMaterial({ color: cB, transparent: true, opacity: 0.25 })
  );
  ring2.rotation.x = Math.PI / 1.6;
  ring2.rotation.z = Math.PI / 4;
  ringGroup.add(ring2);

  scene.add(ringGroup);

  // Floating particle field
  const partGeom = new THREE.BufferGeometry();
  const partCount = 80;
  const partPos = new Float32Array(partCount * 3);
  for (let i = 0; i < partCount; i++) {
    const r = 2.7 + Math.random() * 1.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    partPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    partPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    partPos[i * 3 + 2] = r * Math.cos(phi);
  }
  partGeom.setAttribute("position", new THREE.Float32BufferAttribute(partPos, 3));
  const partMat = new THREE.PointsMaterial({
    color: cB,
    size: 0.03,
    transparent: true,
    opacity: 0.6,
  });
  const particles = new THREE.Points(partGeom, partMat);
  scene.add(particles);

  // Mouse parallax
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("mousemove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize
  const onResize = () => {
    size = getSize();
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", onResize);

  // Animate
  let raf;
  const clock = new THREE.Clock();
  const tick = () => {
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    group.rotation.y = t * 0.18 + mouse.x * 0.4;
    group.rotation.x = Math.sin(t * 0.15) * 0.15 + mouse.y * 0.3;

    ringGroup.rotation.y = t * 0.12;
    ringGroup.rotation.z = Math.sin(t * 0.1) * 0.2;

    particles.rotation.y = -t * 0.05 + mouse.x * 0.1;
    particles.rotation.x = mouse.y * 0.1;

    inner.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  // React to palette changes
  window.__hero3DRecolor = function() {
    const a = readColor("--grad-a", "#a855f7");
    const b = readColor("--grad-b", "#ec4899");
    const c = readColor("--grad-c", "#f59e0b");
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const t = (y + 1.6) / 3.2;
      tmp.copy(a).lerp(b, t).lerp(c, t * t);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    geom.attributes.color.needsUpdate = true;
    innerMat.color.copy(a);
    ring1.material.color.copy(a);
    ring2.material.color.copy(b);
    partMat.color.copy(b);
  };

  window.__hero3DSetVisible = function(v) {
    wrap.style.opacity = v ? 1 : 0;
  };
})();
