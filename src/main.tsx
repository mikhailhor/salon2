import { createRoot } from "react-dom/client";
/* Only the two subsets and the three weights this page actually renders.
   The default barrel CSS pulled in 27 font files / ~800 KB of base64 into
   the single HTML file — a large parse cost before anything could paint. */
import "@fontsource/vazirmatn/arabic-300.css";
import "@fontsource/vazirmatn/arabic-400.css";
import "@fontsource/vazirmatn/arabic-700.css";
import "@fontsource/vazirmatn/latin-400.css";
import "@fontsource/vazirmatn/latin-700.css";
import "./index.css";
import App from "./App";

/* No StrictMode: its development-only double mount would run the asset
   warm-up and every scroll observer twice while previewing the site. */
createRoot(document.getElementById("root")!).render(<App />);
