import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

const GLB_PATH = '/astraband_opt.glb'

// Start fetching the GLB as soon as this module loads - not on mount
useGLTF.preload(GLB_PATH)

function BandModel() {
  const { scene } = useGLTF(GLB_PATH)
  const cloned = useMemo(() => scene.clone(true), [scene])
  const ref = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4
  })

  return (
    <group ref={ref} scale={2.0} position={[0, -0.2, 0]}>
      <primitive object={cloned} />
    </group>
  )
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-4, -2, -4]} intensity={0.4} color="#8b7cf8" />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#a898ff" />
      <Environment preset="city" />
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
        <Suspense fallback={null}>
          <BandModel />
        </Suspense>
      </Float>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  )
}

export default function BandViewer() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
