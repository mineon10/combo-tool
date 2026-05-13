import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Projection3DVisualizer({ basis, target, projection }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    canvasRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    // Draw basis vectors (subspace)
    if (basis && basis.length > 0) {
      basis.forEach((vec, idx) => {
        const v = new THREE.Vector3(...vec.slice(0, 3));
        const arrow = new THREE.ArrowHelper(
          v.normalize(),
          new THREE.Vector3(0, 0, 0),
          v.length(),
          0x2ecc71 // Green for basis
        );
        scene.add(arrow);
      });

      // Draw a plane/mesh to represent the subspace (simplified visualization)
      if (basis.length >= 2) {
        const v1 = new THREE.Vector3(...basis[0].slice(0, 3)).normalize().multiplyScalar(4);
        const v2 = new THREE.Vector3(...basis[1].slice(0, 3)).normalize().multiplyScalar(4);

        const geometry = new THREE.BufferGeometry();
        const vertices = [
          0, 0, 0,
          v1.x, v1.y, v1.z,
          v1.x + v2.x, v1.y + v2.y, v1.z + v2.z,
          v2.x, v2.y, v2.z,
        ];
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        const indices = [0, 1, 2, 0, 2, 3];
        geometry.setIndex(indices);

        const material = new THREE.MeshBasicMaterial({
          color: 0x2ecc71,
          transparent: true,
          opacity: 0.1,
          side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
      }
    }

    // Draw target vector
    if (target && target.length > 0) {
      const targetVec = new THREE.Vector3(...target.slice(0, 3));
      const arrowTarget = new THREE.ArrowHelper(
        targetVec.normalize(),
        new THREE.Vector3(0, 0, 0),
        targetVec.length(),
        0xe74c3c // Red for target
      );
      scene.add(arrowTarget);
    }

    // Draw projection
    if (projection && projection.length > 0) {
      const projVec = new THREE.Vector3(...projection.slice(0, 3));
      const arrowProj = new THREE.ArrowHelper(
        projVec.normalize(),
        new THREE.Vector3(0, 0, 0),
        projVec.length(),
        0x3498db // Blue for projection
      );
      scene.add(arrowProj);
    }

    // Draw connection line (from projection to target)
    if (target && projection && target.length > 0 && projection.length > 0) {
      const targetVec = new THREE.Vector3(...target.slice(0, 3));
      const projVec = new THREE.Vector3(...projection.slice(0, 3));

      const geometry = new THREE.BufferGeometry();
      const vertices = [
        projVec.x, projVec.y, projVec.z,
        targetVec.x, targetVec.y, targetVec.z,
      ];
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

      const material = new THREE.LineBasicMaterial({ color: 0xf39c12, linewidth: 2 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);

      // Add a dot at the projection point
      const dotGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x3498db });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.copy(projVec);
      scene.add(dot);
    }

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Gentle rotation
      scene.rotation.z += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
        camera.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.005);
        camera.lookAt(0, 0, 0);
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', null);
      renderer.domElement.removeEventListener('mousemove', null);
      renderer.domElement.removeEventListener('mouseup', null);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (canvasRef.current && canvasRef.current.children.length > 0) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, [basis, target, projection]);

  return <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
