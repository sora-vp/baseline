import { Suspense, lazy } from "react";
import { ChakraProvider } from "@chakra-ui/react";

import { AppSettingProvider } from "@/context/AppSetting";
import Loading from "@/components/PreScan/Loading";

const App = lazy(() => import("./App"));

const UpperProvider = () => (
  <ChakraProvider>
    <AppSettingProvider>
      <Suspense fallback={<Loading />}>
        <App />
      </Suspense>
    </AppSettingProvider>
  </ChakraProvider>
);

export default UpperProvider;
