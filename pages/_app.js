import { ChakraProvider, CSSReset, theme } from "@chakra-ui/react";
import SocketContext, { socket } from "../lib/context/socket";
import withIdentity from "../lib/withIdentity";

function MyApp({ Component, pageProps }) {
  return (
    <SocketContext.Provider value={socket}>
      <ChakraProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ChakraProvider>
    </SocketContext.Provider>
  );
}

export default withIdentity(MyApp);
