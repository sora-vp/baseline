import { SWRConfig } from "swr";
import { ChakraProvider } from "@chakra-ui/react";

import type { AppProps } from "next/app";

import "react-datepicker/dist/react-datepicker.css";
import "@/component/DatePicker/chakra-support.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
      }}
    >
      <ChakraProvider resetCSS>
        <Component {...pageProps} />
      </ChakraProvider>
    </SWRConfig>
  );
}

export default MyApp;
