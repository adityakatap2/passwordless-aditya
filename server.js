const express = require("express");
const fs = require("fs");
const session = require("express-session");
const cors = require("cors");
const logger = require("./Util/logger");
const webauthRoute = require("./routes/webauthn");
const path = require("path");

const http = require("http");
const { isJson } = require("./Util/helper");

// import config file
const config = require("./Config/local");
const cookieParser = require("cookie-parser");

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "test",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: 600000,
    },
  })
);

const server = http.createServer(app);
app.use(express.static(__dirname + "/public"));

app.use("/webauth", webauthRoute);
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

server.listen(3005, () => {
  logger.info(`server Started go to ${config.origin}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
io.sockets.on("error", (e) => console.log(e));

io.sockets.on("connection", (socket) => {
  socket.on("msg", (data) => {
    console.log(data);
  });
  socket.on("join", (id) => {
    if (isJson(id)) {
      const { room, uid } = id;

      socket.join(room);
      socket.on("registration-response", (data) => {
        socket.to(room).emit("register-client-response", { ...data, uid });
      });
      socket.on("login-response", (data) => {
        socket.to(room).emit("login-client-response", { ...data, uid });
      });
      socket.on("decline-process", (data) => {
        socket.to(room).emit("decline-process-response", { ...data, uid });
      });
    } else {
      console.log("join", id);
      socket.join(id);
      socket.on("registration-response", (data) => {
        socket.to(id).emit("register-client-response", data);
      });
      socket.on("login-response", (data) => {
        socket.to(id).emit("login-client-response", data);
      });
      socket.on("decline-process", (data) => {
        socket.to(id).emit("decline-process-response", data);
      });
    }
  });
});
