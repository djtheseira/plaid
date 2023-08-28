const express = require("express");
const escape = require("escape-html");
const { plaidClient } = require("../../plaid");
const { getInstitutionNamesByUserId, updateItemStatus, getItemById, getAccountsByItemId, getSumOfAccountsByUserId, getSumOfAccountsByItemId, getBanksAccountsByUserId, getItemByInstitutionId, deleteItem, getTransactionsByAccountId, getTransactionsByItemIdSortedByCategory } = require("../db/queries");
const { getLoggedInUserId, isValidItemStatus, validItemStatuses, sanitizeItems, sanitizeAccounts } = require("../../util");

const router = express.Router();

router.get("/list", async (request, response, next) => {
    Promise.resolve()
        .then(async () => {
            const userId = getLoggedInUserId(request);
            const items = await getInstitutionNamesByUserId(userId);
            response.json(items);
        })
        .catch(err => {
            next(err);
        });
});

router.get("/:itemId", async (request, response, next) => {
    try {
        const { itemId } = request.params;
        const item = await getItemById(id);
        response.json(item[0]);
    } catch (err) {
        next(err);
    }
});

router.get("/plaid/:plaidItemId", async (request, response, next) => {
    try {
        const { plaidItemId } = request.params;
        const item = await getItemByPlaidItemId(plaidItemId);
        response.json(item[0]);
    } catch (err) {
        next(err);
    }
});

router.delete("/:itemId", async (request, response, next) => {
    try {
        const { itemId } = request.params;
        console.log("itemId: ", itemId);
        const item = await getItemById(itemId);
        console.log("item: ", item);
        const { plaid_access_token: accessToken } = await getItemById(itemId);
        console.log("accessToken: ", accessToken);
        const plaidResponse = await plaidClient.itemRemove({
            access_token: accessToken
        });
        console.log("plaidResponse", plaidResponse.data);
        await deleteItem(itemId);
        console.log("deleted");
        response.status(204).send();
    } catch (err) {
        next(err);
    }
});

router.put("/item/:itemId", async (request, response, next) => {
    try {
        const { itemId } = request.params;
        const { status } = request.body;
        
        if (status) {
            if (!isValidItemStatus(status)) {
                response.status(400).json({
                    error_code: "INVALID_ITEM_STATUS", 
                    error_message: "Invalid item status, please use an accepted value.",
                    acceptedValues: [validItemStatuses.values()]
                })
            } else {
                await updateItemStatus(itemId, status);
                const item = await getItemById(itemId);
                response.json(sanitizeItems(item));
            }
        } else {
            response.status(400).json({
                error_code: "MISSING_INFORMATION", 
                error_message: "You must provide updated item information.",
                acceptedKeys: ["status"]
            });
        }
    } catch (err) {
        next(err);
    }
});

router.get("/:itemId/accounts", async(request, response, next) => {
    try {
        const { itemId } = request.params;
        if (itemId != null) {
            const accountListResponse = await getAccountsByItemId(itemId);
            response.json(sanitizeAccounts(accountListResponse));
        } else {
            response.status(400).send({
                error_code: "NO_ITEM_ID",
                error_message: "Please select a bank to see the accounts."
            });
        }
    } catch (err) {
        next(err);
    }
});

router.get("/:itemId/accounts/totals", async (request, response, next) => {
    try {
        const { itemId } = request.params;
        const totals = await getSumOfAccountsByItemId(itemId);
        response.json({status: 1, results: totals});
    } catch (err) {
        next(err);
    }
});

router.get("/accounts/:accountId/transactions", async (request, response, next) => {
    try {
        const { accountId } = request.params;
        const transactions = await getTransactionsByAccountId(accountId);
        response.json(transactions);
    } catch (err) {
        next(err);
    }
});

router.get("/items/:itemId/transactions/:page", async (request, response, next) => {
    try {
        const { itemId, page } = request.params;
        const transactions = await getTransactionsByItemIdSortedByCategory(itemId);
        response.json(transactions);
    } catch (err) {
        next(err);
    }
});

module.exports = router;