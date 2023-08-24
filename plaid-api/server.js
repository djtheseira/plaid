require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const socketIo = require('socket.io');

const { getUserCount } = require("./server/db/queries");
const banksRouter = require("./server/routes/banks");
const debugRouter = require("./server/routes/debug");
const linkEventsRouter = require("./server/routes/linkEvents");
const tokensRouter = require("./server/routes/tokens");
const { router: transactionsRouter } = require("./server/routes/transactions");
const usersRouter = require("./server/routes/users");
const institutionRouter = require("./server/routes/institutions");
const servicesRouter = require("./server/routes/services");

const APP_PORT = process.env.APP_PORT || 8000;

const app = express();
// let tunnel;

const server = app.listen(APP_PORT, async function () {
    console.log(`Server is up and running at http://localhost:${APP_PORT}/`);
    // tunnel = await localtunnel({ port: APP_PORT });
    // console.log(`tunnel opened: ${tunnel.url}`);
});
const io = socketIo(server);

app.use((request, response, next) => {
    request.io = io;
    next();
});

io.on("connection", socket => {
    console.log("socket connected");
    socket.on("disconnect", () => {
        console.log("socket disconnected");
    })
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:3000"
}));


// nodemon({
//     script: "server.js",
// })
// .on("start", () => {
//     console.log("NODEMON START");
// })
// .on("crash", () => {
//     console.log("NODEMON CRASH");
//     if (!tunnel) return;
//     tunnel.close();
// })
// .on("restart", (files) => {
//     console.log("NODEMON RESTARTED");
//     if (!tunnel) return;
//     tunnel.close();
// })
// .on("quit", () => {
//     console.log("NODEMON QUIT, CLOSE TUNNEL");
//     if (!tunnel) return;
//     tunnel.close();
// });

// const enableCORSMiddleware = (req,res,next) => {
//     // You could use * instead of the url below to allow any origin, 
//     // but be careful, you're opening yourself up to all sorts of things!
//     res.setHeader('Access-Control-Allow-Origin',  "http://localhost:3000");
//     next();
// };
// app.use(enableCORSMiddleware);

const errorHandler = (err, request, response, next) => {
    console.error(`Your error:`);
    console.error(err);

    if (err.response?.data != null) {
        response.status(500).send(err.response.data);
    } else {
        response.status(500).send({
            error_code: "OTHER_ERROR",
            error_message: "Something unexpected happened!!"
        });
    }
};

const authChecker = (request, response, next) => {
    console.log("request: ", request.path == "/api/users/count");
    if (getUserCount() > 0 || request.path == "/api/users/create") {
        next();
    } else {
        response.status(400).send({
            error_code: "NO_USER_EXISTS",
            error_message: "Create a user before attempting to retrieve any information"
        })
    }
};

// app.use("*", authChecker);

app.use("/api/banks", banksRouter);
app.use("/api/debug", debugRouter);
app.use("/api/linkEvents", linkEventsRouter);
app.use("/api/tokens", tokensRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/institutions", institutionRouter);
app.use("/api/services", servicesRouter)

app.use(errorHandler);