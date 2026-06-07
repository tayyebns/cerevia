declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string
      alt?: string
      'camera-controls'?: boolean | string
      'auto-rotate'?: boolean | string
      'auto-rotate-delay'?: string
      'rotation-per-second'?: string
      'camera-orbit'?: string
      'field-of-view'?: string
      'disable-zoom'?: boolean | string
      'interaction-prompt'?: string
      poster?: string
    }
  }
}
