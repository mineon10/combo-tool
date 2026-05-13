import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function PermutationMatrix3D({ matrix, permutation }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !matrix) return;

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
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    canvasRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create permutation matrix visualization
    const n = matrix.length;
    const cellSize = 0.8;
    const spacing = cellSize * 1.1;
    const offset = (spacing * n) / 2;

    // Create cells for matrix
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = j * spacing - offset + spacing / 2;
        const y = -i * spacing + offset - spacing / 2;
        const z = 0;

        let color;
        if (matrix[i][j] === 1) {
          color = 0x3498db; // Blue for 1s
        } else {
          color = 0x34495e; // Dark grey for 0s
        }

        const geometry = new THREE.BoxGeometry(cellSize * 0.9, cellSize * 0.9, 0.1);
        const material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.3,
          roughness: 0.4,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        scene.add(cube);

        // Add edges
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 })
        );
        line.position.copy(cube.position);
        scene.add(line);
      }
    }

    // Render (no animation/rotation)
    renderer.render(scene, camera);

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
      renderer.dispose();
      if (canvasRef.current && canvasRef.current.children.length > 0) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, [matrix]);

  return <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
