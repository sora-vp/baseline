import React from "react";
import ReactDOM from "react-dom/client";

import "@fontsource/lato"
import "@fontsource/sora"
import "@fontsource/roboto"

import UpperProvider from "./UpperProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UpperProvider />
  </React.StrictMode>
);
