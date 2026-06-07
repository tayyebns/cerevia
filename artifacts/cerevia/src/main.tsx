import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.addEventListener('error', (e) => {
  const msg = e.message ?? ''
  if (msg.includes('xr') || msg.includes('WebGL') || msg.includes('WebGLRenderer')) {
    e.preventDefault()
    e.stopImmediatePropagation()
  }
}, true)

window.addEventListener('unhandledrejection', (e) => {
  const msg = String(e.reason?.message ?? e.reason ?? '')
  if (msg.includes('xr') || msg.includes('WebGL') || msg.includes('WebGLRenderer')) {
    e.preventDefault()
  }
})

createRoot(document.getElementById("root")!).render(<App />);
