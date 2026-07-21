import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// StrictMode intentionally omitted: its double-invoke of effects interrupts
// GSAP timelines mid-play (context revert kills the first timeline before the
// second run completes), leaving intro animations frozen. Single-render is
// correct for this animation-heavy page.
createRoot(document.getElementById('root')).render(<App />);
