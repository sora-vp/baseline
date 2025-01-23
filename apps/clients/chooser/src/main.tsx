import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "non.geist";
import "non.geist/mono";
import "@fontsource-variable/noto-sans-sundanese";
import "./index.css";

import { AnimatePresence } from "motion/react";

import { Toaster } from "@sora-vp/ui/toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AnimatePresence mode="wait">
      <App />
    </AnimatePresence>
    <Toaster richColors />
  </React.StrictMode>,
);
