const express = require("express");
const escape = require("escape-html");
const { plaidClient } = require("../../plaid");

const { getUserByUserId, createItem, createAccount, getItemByInstitutionId } = require("../db/queries");
const { getLoggedInUserId, prettyPrintResponse } = require("../../util");
const { syncTransactions } = require("./transactions");

const router = express.Router();

router.post("/generate_link_token", async (request, response, next) => {
    Promise.resolve()
        .then(async function () {
            const { id: userId } = await getUserByUserId(getLoggedInUserId(request));
            console.log("userid:", userId);
            const configs = {
                user: {
                    client_user_id: JSON.stringify(userId),
                },
                client_name: "DT's Budgeting",
                products: process.env.PLAID_PRODUCTS.split(","),
                country_codes: process.env.PLAID_COUNTRY_CODES.split(","),
                language: 'en',
                redirect_uri: process.env.PLAID_REDIRECT_URI
            };

            const createTokenResponse = await plaidClient.linkTokenCreate(configs);

            prettyPrintResponse(createTokenResponse);
            response.json(createTokenResponse.data);
        }).catch(function (err) {
            if (err.response != null && err.response.data != null) {
                console.log(err.response.data);
            } else {
                console.log(err);
            }

            response.json(err);
        });
});

router.post("/exchange_public_token", async (request, response, next) => {
    try {
        const {publicToken, institutionId, userId, accounts } = request.body;
        const tokenResponse = await plaidClient.itemPublicTokenExchange({
            public_token: escape(publicToken)
        });
        prettyPrintResponse(tokenResponse);
        const accessToken = tokenResponse.data.access_token;
        const plaidItemId = tokenResponse.data.item_id;
        const institutionInfo = await retrieveBankInformation(accessToken);
        const existingItem = await getItemByInstitutionId(userId, institutionId);
        if (existingItem) {
            response.json({error_message: "You have already linked an item at this institution."}).status(409);
        }
        console.log("exchange token accounts: ", accounts);
        const item = await createItem(plaidItemId, userId, accessToken, institutionId, institutionInfo.institutionName);
        await retrieveBankAccountNames(accessToken, item.id);
        await syncTransactions(item.id);

        response.json({
            status: "success"
        });
    } catch (err) {
        await (err);
        if (err.response && err.response.data) {
            prettyPrintResponse(err.response);
            response.json(err);
        } else {
            console.log(err);
            response.json(err);
        }
    }
});

const retrieveBankInformation = async (accessToken) => {
    try {
        const itemResponse = await plaidClient.itemGet({
            access_token: accessToken
        });

        let institutionId = itemResponse.data.item.institution_id;
        if (institutionId == null) {
            return -1;
        }

        const institutionResponse = await plaidClient.institutionsGetById({
            country_codes: ["US"],
            institution_id: institutionId
        });

        let institutionName = institutionResponse.data.institution.name;

        return {
            institutionId: institutionId,
            institutionName: institutionName
        };
    } catch (err) {
        await (err);
    }
};

const retrieveBankAccountNames = async (accessToken, itemId) => {
    try {
        const accountResponse = await plaidClient.accountsBalanceGet({
            access_token: accessToken
        });
        const accountsData = accountResponse.data;

        await Promise.all(
            accountsData.accounts.map(async (account) => {
                console.log("account: ", account);
                await createAccount(itemId, account, account.balances);
            })
        );
    } catch (err) {
        console.error(`Ran into an error ${await (err)}`);
    }
}

module.exports = router;