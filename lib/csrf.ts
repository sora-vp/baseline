import csurf from "csurf";

const csrf = csurf({ cookie: true });

// import type { IncomingMessage, NextApiRequestCookies, ServerResponse } from "next";
import type { NextApiResponse } from "next";

export type ssrCallbackType = {
  req: any;
  res: any;
};

const promiseWrapper = (req: any, res: any) =>
  new Promise((resolve, reject) => {
    csrf(req as any, res, (result: unknown) => {
      if (result instanceof Error) return reject(result);

      return resolve(result);
    });
  });

export const ssrCallback = ({ req, res }: ssrCallbackType) =>
  promiseWrapper(req, res);

export const commonSSRCallback = async ({ req, res }: ssrCallbackType) => {
  await promiseWrapper(req, res);

  return {
    props: {
      csrfToken: (req as unknown as { csrfToken(): string }).csrfToken(),
    },
  };
};

export function validateCsrf(req: any, res: any, next: () => void) {
  csrf(req, res, (result: unknown) => {
    if (result instanceof Error)
      return (res as NextApiResponse<ApiErrorInterface>)
        .status(401)
        .json({ error: true, message: "Invalid csrf token!" });

    next();
  });
}
