import { ChakraProvider, CSSReset, theme } from "@chakra-ui/react";
import SocketContext, { socket } from "../context/socket";

export default function MyApp({ Component, pageProps }) {
  return (
    <SocketContext.Provider value={socket}>
      <ChakraProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ChakraProvider>
    </SocketContext.Provider>
  );
}
