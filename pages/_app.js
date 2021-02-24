import { ChakraProvider, CSSReset } from "@chakra-ui/react";

export default function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <CSSReset />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
