const cookieParser = require("cookie-parser");
const compression = require("compression");
const session = require("express-session");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const passport = require("passport");
const express = require("express");
const uid = require("uid-safe");
const next = require("next");
const http = require("http");
const MongoStore = require("connect-mongo").default;

const isAuthenticated = require("./middlewares/isAuthenticated");
const Local = require("./passport/local");
const auth = require("./routes/auth");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("[MongoDB] connected"));

mongoose.connection.on("error", (err) => {
  console.log(`[MongoDB] ${err}`);
  process.exit(22);
});

app.prepare().then(() => {
  const expressApp = express();

  expressApp.use(compression());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(express.json());
  expressApp.use(cookieParser());

  expressApp.use(passport.initialize());
  expressApp.use(passport.session());
  Local(passport);

  expressApp.use(
    session({
      secret: uid.sync(18),
      name: process.env.SESS_NAME,
      resave: false,
      cookie: {
        maxAge: 86400 * 1000,
      },
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    })
  );

  expressApp.use("/auth", auth);
  expressApp.get("/admin", isAuthenticated, (req, res) => {
    app.render(req, res, "/admin", null);
  });
  expressApp.all("*", (req, res) => handle(req, res));

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
