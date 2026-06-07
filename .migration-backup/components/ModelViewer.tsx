'use client'
import Script from 'next/script'

export function ModelViewer() {
  return (
    <>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
        strategy="afterInteractive"
      />
      {/* @ts-ignore -- custom element registered by model-viewer script */}
      <model-viewer
        src="/medical_syringe.glb"
        camera-controls
        auto-rotate
        auto-rotate-delay="0"
        rotation-per-second="90deg"
        camera-orbit="0deg 90deg auto"
        field-of-view="auto"
        disable-zoom
        interaction-prompt="none"
        alt="Rotating model of the Cerevia medication syringe"
        style={{
          width: '100%',
          height: '100%',
          minHeight: 420,
          background: 'transparent',
        }}
      />
    </>
  )
}
