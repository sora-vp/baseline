import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AppSettingProvider } from "@renderer/context/AppSetting";

import App from "./App";

const theme = extendTheme({
  fonts: {
    heading: `'Roboto', sans-serif`,
    body: `'Lato', sans-serif`,
  },
});

const UpperProvider = () => (
  <ChakraProvider theme={theme}>
    <AppSettingProvider>
      <App />
    </AppSettingProvider>
  </ChakraProvider>
);

export default UpperProvider;
