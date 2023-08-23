require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const { getUserCount } = require("./server/db/queries");
const banksRouter = require("./server/routes/banks");
const debugRouter = require("./server/routes/debug");
const linkEventsRouter = require("./server/routes/linkEvents");
const tokensRouter = require("./server/routes/tokens");
const { router: transactionsRouter } = require("./server/routes/transactions");
const usersRouter = require("./server/routes/users");
const institutionRouter = require("./server/routes/institutions");

const APP_PORT = process.env.APP_PORT || 8000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const enableCORSMiddleware = (req,res,next) => {
    // You could use * instead of the url below to allow any origin, 
    // but be careful, you're opening yourself up to all sorts of things!
    res.setHeader('Access-Control-Allow-Origin',  "http://localhost:8888");
    next();
};

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
app.use(enableCORSMiddleware);
app.use("*", errorHandler);

const server = app.listen(APP_PORT, function () {
    console.log(`Server is up and running at http://localhost:${APP_PORT}/`);
});

app.use("/api/banks", banksRouter);
app.use("/api/linkEvents", linkEventsRouter);
app.use("/api/tokens", tokensRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/institutions", institutionRouter);