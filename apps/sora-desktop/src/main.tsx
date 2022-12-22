import React, { lazy } from "react";
import ReactDOM from "react-dom/client";

const UpperProvider = lazy(() => import("./UpperProvider"));

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <UpperProvider />
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
