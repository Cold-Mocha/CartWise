import { WebApp } from './web/WebApp';

// El prototipo movil (DesignCanvas + components/screens/*) se conserva en el repo
// SOLO como referencia de diseno. No se enruta ni se renderiza en ningun momento.
// La unica experiencia que se grafica es la web principal (WebApp).
export default function App() {
  return <WebApp />;
}
