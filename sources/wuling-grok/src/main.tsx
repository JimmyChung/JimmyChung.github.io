import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SkyApp } from "@/components/sky-app";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SkyApp />
  </StrictMode>,
);

// Offline support: the farm may have no signal
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
