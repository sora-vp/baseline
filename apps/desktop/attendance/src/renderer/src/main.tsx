import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AppSettingGuard } from "@renderer/components/AppSettingGuard";
import ReactDOM from "react-dom/client";

import "@fontsource/lato";
import "@fontsource/sora";
import "@fontsource/roboto";
import App from "./App";

const theme = extendTheme({
  fonts: {
    heading: `'Roboto', sans-serif`,
    body: `'Lato', sans-serif`,
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AppSettingGuard>
        <App />
      </AppSettingGuard>
    </ChakraProvider>
  </React.StrictMode>,
);
