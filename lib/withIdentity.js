import { Component, useContext, createContext } from "react";
import nextCookie from "next-cookies";
import redirect from "./redirect";
import NextApp from "next/app";

const IdentityContext = createContext(null);

const loginPage = "/admin/login";

export const redirectToLogin = (ctx) => {
  if (
    (ctx && ctx.pathname === loginPage) ||
    (typeof window !== "undefined" && window.location.pathname === loginPage)
  )
    return;

  redirect(ctx, loginPage);
};

const withIdentity = (App) =>
  class IdentityProvider extends Component {
    static async getInitialProps(ctx) {
      let appProps;
      if (NextApp.getInitialProps) {
        appProps = await NextApp.getInitialProps(ctx);
      } else {
        appProps = { pageProps: {} };
      }

      const passportSession = nextCookie(ctx.ctx)[process.env.SESS_NAME];

      if (!passportSession) {
        redirectToLogin(ctx.ctx);
        return Promise.resolve({
          pageProps: null,
          session: null,
        });
      }

      const serializedCookie = Buffer.from(
        passportSession,
        "base64"
      ).toString();

      const {
        passport: { user },
      } = JSON.parse(serializedCookie);

      if (!user) {
        redirectToLogin(ctx.ctx);
      }

      const session = user;

      return {
        ...appProps,
        session,
      };
    }

    render() {
      const { session, ...appProps } = this.props;

      return (
        <IdentityContext.Provider value={session}>
          <App {...appProps} />
        </IdentityContext.Provider>
      );
    }
  };

export default withIdentity;

export const useIdentity = () => useContext(IdentityContext);
