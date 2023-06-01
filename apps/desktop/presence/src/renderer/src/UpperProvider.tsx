import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Roboto', sans-serif`,
    body: `'Lato', sans-serif`,
  },
});

import { AppSettingProvider } from "@renderer/context/AppSetting";

import App from "./App";

const UpperProvider = () => (
  <ChakraProvider theme={theme}>
    <AppSettingProvider>
      <App />
    </AppSettingProvider>
  </ChakraProvider>
);

export default UpperProvider;
