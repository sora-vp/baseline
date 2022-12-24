import { Suspense, lazy } from "react";

import { AppSettingProvider } from "@/context/AppSetting";
import Loading from "@/components/PreScan/Loading";

const App = lazy(() => import("./App"));

const UpperProvider = () => (
  <AppSettingProvider>
    {/* <Suspense fallback={<Loading />}>
      <App />
    </Suspense> */}
  </AppSettingProvider>
);

export default UpperProvider;
