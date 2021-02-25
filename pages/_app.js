import { ChakraProvider, CSSReset, theme } from "@chakra-ui/react";
import { Provider } from "next-auth/client";

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}
