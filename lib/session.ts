import { parse, serialize } from "cookie";
import type { NextApiRequest } from "next";
import type { CookieSerializeOptions } from "cookie";
import { createLoginSession, getLoginSession } from "./auth";

function parseCookies(req: NextApiRequest) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || "");
}

interface sessionInterface {
  name: string;
  secret: string;
  cookie: CookieSerializeOptions;
}

interface sessionInRequest {
  maxAge?: number;
}

interface requestInterface extends NextApiRequest {
  session?: sessionInRequest;
}

export default function session({
  name,
  secret,
  cookie: cookieOpts,
}: sessionInterface) {
  return async (
    req: requestInterface,
    res: {
      end: (...args: any[]) => Promise<void>;
      finished: any;
      writableEnded: any;
      headersSent: any;
      setHeader: (arg0: string, arg1: string) => void;
    },
    next: () => void
  ) => {
    const cookies = parseCookies(req);
    const token = cookies[name];
    let unsealed = {};

    if (token) {
      try {
        // the cookie needs to be unsealed using the password `secret`
        unsealed = await getLoginSession(token, secret);
      } catch (e) {
        // The cookie is invalid
      }
    }

    req.session = unsealed;

    // We are proxying res.end to commit the session cookie
    const oldEnd = res.end;
    res.end = async function resEndProxy(...args: any[]) {
      if (res.finished || res.writableEnded || res.headersSent) return;
      if (cookieOpts.maxAge) {
        (req.session as sessionInRequest).maxAge = cookieOpts.maxAge;
      }

      const token = await createLoginSession(req.session, secret);

      res.setHeader("Set-Cookie", serialize(name, token, cookieOpts));
      oldEnd.apply(this, args);
    };

    next();
  };
}
