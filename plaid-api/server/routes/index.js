const banksRouter = require("./banks");
const budgetRouter = require("./budget");
const categoriesRouter = require("./categories");
const debugRouter = require("./debug");
const linkEventsRouter = require("./linkEvents");
const tokensRouter = require("./tokens");
const { router: transactionsRouter } = require("./transactions");
const usersRouter = require("./users");
const institutionRouter = require("./institutions");
const servicesRouter = require("./services");

module.exports = {
    banksRouter,
    budgetRouter,
    categoriesRouter,
    debugRouter,
    institutionRouter,
    linkEventsRouter,
    servicesRouter,
    tokensRouter,
    transactionsRouter,
    usersRouter,
}