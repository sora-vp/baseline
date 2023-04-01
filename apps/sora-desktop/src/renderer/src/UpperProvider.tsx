import { ChakraProvider } from "@chakra-ui/react";

import { AppSettingProvider } from "@renderer/context/AppSetting";

import App from "./App";

const UpperProvider = () => (
  <ChakraProvider>
    <AppSettingProvider>
      <App />
    </AppSettingProvider>
  </ChakraProvider>
);

export default UpperProvider;
