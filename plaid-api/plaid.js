const {
    BankTransferEventType,
    Configuration,
    PlaidApi,
    PlaidEnvironments,
    Products,
    SandboxItemSetVerificationStatusRequestVerificationStatusEnum
} = require("plaid");
const { getItemByAccessToken, createPlaidApiEvents } = require("./server/db/queries");
const { prettyPrintResponse } = require("./util");
const { forEach } = require("lodash");


// We want to log requests to / responses from the Plaid API (via the Plaid client), as this data
// can be useful for troubleshooting.

/**
 * Logging function for Plaid client methods that use an access_token as an argument. Associates
 * the Plaid API event log entry with the item and user the request is for.
 *
 * @param {string} clientMethod the name of the Plaid client method called.
 * @param {Array} clientMethodArgs the arguments passed to the Plaid client method.
 * @param {Object} response the response from the Plaid client.
 */
const defaultLogger = async (clientMethod, clientMethodArgs, response) => {
    const accessToken = clientMethodArgs[0].access_token;
    const { id: itemId, user_id: userId } = await getItemByAccessToken(accessToken);

    await createPlaidApiEvents(itemId, userId, clientMethod, clientMethodArgs, response);
    prettyPrintResponse(response);
};

/**
 * Logging function for Plaid client methods that do not use access_token as an argument. These
 * Plaid API event log entries will not be associated with an item or user.
 *
 * @param {string} clientMethod the name of the Plaid client method called.
 * @param {Array} clientMethodArgs the arguments passed to the Plaid client method.
 * @param {Object} response the response from the Plaid client.
 */
const noAccessTokenLogger = async (clientMethod, clientMethodArgs, response) => {
    await createPlaidApiEvents(undefined, undefined, clientMethod, clientMethodArgs, response);
    
    // institutionsGet response is way too big to console.log due to the logo field.
    // this endpoint is logged specifically inside the route in routes/institution.js
    if (clientMethod != 'institutionsGet' && clientMethod != 'institutionsGetById') {
        prettyPrintResponse(response);
    }
};

// Plaid client methods used in this app, mapped to their appropriate logging functions.
const clientMethodLoggingFns = {
    institutionsGet: noAccessTokenLogger,
    institutionsGetById: noAccessTokenLogger,
    itemPublicTokenExchange: noAccessTokenLogger,
    itemRemove: defaultLogger,
    linkTokenCreate: noAccessTokenLogger,
    transactionsGet: defaultLogger,
    sandboxItemResetLogin: defaultLogger,
    authGet: defaultLogger,
    identityGet: defaultLogger,
    accountsBalanceGet: defaultLogger,
    processorTokenCreate: defaultLogger,
};

const plaidConfig = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
        headers: {
            "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
            "PLAID-SECRET": process.env.PLAID_SECRET,
            "Plaid-Version": "2020-09-14",
        },
    },
});

const plaidClient = new PlaidApi(plaidConfig);

const createWrapperClientMethod = (clientMethod, log) => {
    return async (...args) => {
        Promise.resolve()
            .then(async () => {
                const res = await plaidClient[clientMethod](...args);
                await log(clientMethod, args, res);
                return res;
            })
            .catch(async (err) => {
                await log(clientMethod, args, err.response.data);
                throw err;
            });
    };
}

forEach(clientMethodLoggingFns, (logFn, method) => {
    this[method] = createWrapperClientMethod(method, logFn);
});

module.exports = {plaidClient};