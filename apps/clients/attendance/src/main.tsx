import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "non.geist";
import "non.geist/mono";
import "@fontsource-variable/noto-sans-sundanese";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
