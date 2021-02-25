const cookieParser = require("cookie-parser");
const socketIO = require("socket.io");
const express = require("express");
const next = require("next");
const http = require("http");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const Auth = require("./middlewares/Auth");

  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(cookieParser());
  Auth(expressApp);

  expressApp.all("*", (req, res) => {
    return handle(req, res);
  });

  const server = http.createServer(expressApp);

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });

  const Sock = socketIO(server);

  Sock.on("connection", (socc) => {
    socc.on("vote", (data) => socc.broadcast.emit("admin:upvote", data));

    socc.on("new user", ({ time }) =>
      socc.broadcast.emit("admin:new user", { time })
    );
  });
});
