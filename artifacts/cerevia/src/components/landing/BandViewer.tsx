import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

const GLB_PATH = '/astraband.glb'

function BandModel() {
  const { scene } = useGLTF(GLB_PATH)
  const ref = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4
  })

  return (
    <group ref={ref} scale={2.2} position={[0, -0.2, 0]}>
      <primitive object={scene} />
    </group>
  )
}

function PlaceholderBand() {
  const outerRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (outerRef.current) outerRef.current.rotation.y += delta * 0.5
    if (innerRef.current) innerRef.current.rotation.y -= delta * 0.3
    if (outerRef.current) {
      outerRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15
    }
  })

  return (
    <group>
      {/* Outer torus — band shape */}
      <mesh ref={outerRef}>
        <torusGeometry args={[1.1, 0.18, 32, 80]} />
        <meshStandardMaterial
          color="#6b5ce7"
          roughness={0.15}
          metalness={0.7}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Inner accent ring */}
      <mesh ref={innerRef}>
        <torusGeometry args={[0.92, 0.04, 16, 80]} />
        <meshStandardMaterial
          color="#a898ff"
          roughness={0.1}
          metalness={0.9}
          emissive="#5a4fd4"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Sensor bump */}
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[0.38, 0.12, 0.22]} />
        <meshStandardMaterial color="#1a1830" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

function SceneContent({ hasGlb }: { hasGlb: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-4, -2, -4]} intensity={0.4} color="#8b7cf8" />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#a898ff" />
      <Environment preset="city" />
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
        {hasGlb ? (
          <Suspense fallback={<PlaceholderBand />}>
            <BandModel />
          </Suspense>
        ) : (
          <PlaceholderBand />
        )}
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

interface BandViewerProps {
  hasGlb?: boolean
}

export default function BandViewer({ hasGlb = false }: BandViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent hasGlb={hasGlb} />
      </Canvas>
    </div>
  )
}
