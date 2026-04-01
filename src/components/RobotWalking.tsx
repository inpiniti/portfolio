'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

/* ── Camera: 뷰포트 크기에 따라 거리/앵글 자동 조정 ── */
function CameraRig() {
  const { camera, size } = useThree();

  useEffect(() => {
    const pCam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;

    // 좁을수록 (aspect < 1) 더 멀리서 봐야 전신이 보임
    const baseZ = 14;
    const z = aspect >= 1 ? baseZ : baseZ / aspect;

    camera.position.set(0, 2, Math.min(z, 30));

    // 좁은 화면에서는 x 오프셋 줄여서 로봇을 중앙에 가깝게
    const lookAtX = aspect >= 1 ? -2.0 : -0.6 * aspect;
    camera.lookAt(new THREE.Vector3(lookAtX, 1.7, 0));

    pCam.fov = 36;
    pCam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

/* ── Robot model ─────────────────────────────────── */
function Robot() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/RobotExpressive.glb');
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });
    const walk = actions['Walking'];
    if (walk) walk.reset().fadeIn(0.3).play();
    return () => { mixer.stopAllAction(); };
  }, [actions, mixer, scene]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/* ── Scene ───────────────────────────────────────── */
export function RobotWalking() {
  return (
    <Canvas
      camera={{ position: [0, 2, 14], fov: 36 }}
      style={{ background: 'transparent', width: '100%', height: '100%', pointerEvents: 'none' }}
      gl={{ alpha: true, antialias: true }}
    >
      <CameraRig />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} />
      <Robot />
    </Canvas>
  );
}

useGLTF.preload('/models/RobotExpressive.glb');
