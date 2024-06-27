import React from "react";
import ReactDOM from "react-dom/client";

import "non.geist";
import "non.geist/mono";

import App from "./App";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
