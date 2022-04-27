import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";
import { ColorModeScript } from "@chakra-ui/react";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <ColorModeScript initialColorMode={"light"} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
