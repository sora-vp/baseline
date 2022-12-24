import React from "react";
import ReactDOM from "react-dom/client";

import UpperProvider from "./UpperProvider";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <UpperProvider />
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
