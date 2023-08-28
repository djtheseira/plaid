const express = require("express");
const escape = require("escape-html");
const { plaidClient } = require("../../plaid");
const { getLoggedInUserId } = require("../../util");
const { 
    getItemsByUserId, 
    getItemById, 
    createTransaction, 
    updateTransaction,
    setTransactionAsRemoved, 
    updateItemTransactionCursor, 
    getTransactionsByAccountId, 
    getAccountsByUserId,
    getTransactionsByUserIdSortedByCategory,
    getTransactionsByItemIdSortedByCategory,
    getTransactionsByAccountIdSortedByCategory,
    getSumOfCategoryTransactionsByUserId,
    getSumOfCategoryTransactionsByItemId,
    getSumOfCategoryTransactionsByAccountId,
} = require("../db/queries");

const router = express.Router();

router.post("/sync", async (request, response, next) => {
    Promise.resolve()
        .then(async () => {
            const userId = getLoggedInUserId(request);
            const items = await getItemsByUserId(userId);
            console.log("items: ", items);
            const allResults = await Promise.all(
                items.map(async (item) => await syncTransactions(item.id))
            );
            response.json({ completeResults: allResults });
        })
        .catch((err) => {
            next(err);
        });
});

router.post("/sync_item", async (request, response, next) => {
    Promise.resolve()
        .then(async () => {
            const itemId = request.body.itemId;
            const item = await getItemById(itemId);
            if (item) {
                const results = await syncTransactions(item.id);
                console.log("results: ", reuslts);
                response.json({ results: reuslts });
            } else {
                response.status(400).send({
                    error_code: "NO_BANK_AVAILABLE",
                    error_message: "No bank associated with the id passed in."
                })
            }
        })
        .catch(err => {
            next(err);
        });
});

const syncTransactions = async (itemId) => {
    console.log("itemId: ", itemId);
    const {
        plaid_access_token: accessToken,
        transaction_cursor: transactionCursor,
        user_id: userId
    } = await getItemById(itemId);
    // console.log("accessToken: ", accessToken);
    // console.log("transactionCursor: ", transactionCursor);

    const summary = { added: 0, removed: 0, modified: 0 };
    const allData = await fetchNewSyncData(accessToken, transactionCursor);

    await Promise.all(
        allData.added.map(async (txnObj) => {
            const result = await createTransaction(txnObj.transaction_id,
                txnObj.account_id, txnObj.amount,
                false, txnObj.pending, txnObj.iso_currency_code,
                txnObj.personal_finance_category.primary,
                txnObj.personal_finance_category.detailed,
                (txnObj.merchant_name ?? txnObj.name),
                txnObj.date
            );
            if (result) {
                summary.added += 1;
            }
        })
    );

    await Promise.all(
        allData.modified.map(async (txnObj) => {
            const modifiedResult = await updateTransaction(txnObj.transaction_id, txn.amount,
                false, txnObj.pending, txnObj.personal_finance_category.primary,
                txnObj.personal_finance_category.detailed,
                (txnObj.merchant_name ?? txnObj.name), txnObj.date);

            if (modifiedResult) {
                summary.modified += 1;
            }
        })
    );

    await Promise.all(
        allData.removed.map(async (txnObj) => {
            const removedResult = await setTransactionAsRemoved(txnObj.transaction_id);
            if (removedResult) {
                summary.removed += 1;
            }
        })
    );

    console.log(`Last cursor: ${allData.nextCursor}`);

    await updateItemTransactionCursor(itemId, allData.nextCursor);

    console.log("Summary: ", summary);

};

const fetchNewSyncData = async (accessToken, initialCursor, retriesLeft = 3) => {
    const allData = {
        added: [],
        modified: [],
        removed: [],
        nextCursor: initialCursor
    };

    if (retriesLeft <= 0) {
        console.error("Too many retries!");
        return allData;
    }

    try {
        let keepGoing = false;
        console.log("accessToken: ", accessToken);
        console.log("initialCursor: ", initialCursor);
        do {
            const results = await plaidClient.transactionsSync({
                access_token: accessToken,
                options: {
                    include_personal_finance_category: true,
                },
                cursor: allData.nextCursor,
            });

            const newData = results.data;
            allData.added = allData.added.concat(newData.added);
            allData.modified = allData.modified.concat(newData.modified);
            allData.removed = allData.removed.concat(newData.removed);
            allData.nextCursor = newData.next_cursor;
            keepGoing = newData.has_more;
            console.log(
                `Added: ${newData.added.length} Modified: ${newData.modified.length} Removed: ${newData.removed.length} `
            );
        } while (keepGoing);
        return allData;
    }
    catch (err) {
        // If you want to see if this is a sync mutation error, you can look at
        // error?.response?.data?.error_code
        console.log(
            `Oh no! Error! ${JSON.stringify(
                err
            )} Let's try again from the beginning!`
        );
        setTimeout(() => { }, 1000);
        return fetchNewSyncData(accessToken, initialCursor, retriesLeft - 1);
    };
};

router.get("/list", async (request, response, next) => {
    Promise.resolve()
        .then(async () => {
            const limit = request.query.maxCount ?? -1;
            const offset = request.query.start ?? 0;
            // const accounts = await getAccountsByUserId(userId);
            const accountId = request.query.accountId ?? -1;
            const userId = getLoggedInUserId(request);
            if (accountId != null && accountId != "all") {
                const transactionListResponse = await getTransactionsByAccountId(accountId, limit, offset);
                response.json(transactionListResponse);
            } else if (accountId == "all") {
                const accounts = await getAccountsByUserId(userId);
                const transactionListResponse = await Promise.all(
                    accounts.map(async (account) => await getTransactionsByAccountId(account.plaid_account_id, limit, offset))
                );
                let transactions = [];// Array.prototype.concat(transactionListResponse);
                transactionListResponse.forEach(list => { if (list.length > 0) { transactions = transactions.concat.apply(transactions, list.map(sub => sub)); } });
                response.json(transactions);
            } else {
                response.status(400).send({
                    error_code: "NO_ACCOUNT_ID",
                    error_message: "Please select an account to see the transactions"
                })
            }
        })
        .catch(err => {
            next(err);
        });
});

router.get("/list_sort_category_type", async (request, response, next) => {
    try {
        const filterId = request.query.filterId;
        const filterType = request.query.filterType;
        let transactions = [];
        if (filterType === 'user') {
            transactions = await getTransactionsByUserIdSortedByCategory(filterId);
        } else if (filterType === 'accounts') {
            transactions = await getTransactionsByAccountIdSortedByCategory(filterId);
        } else if (filterType === 'bank') {
            transactions = await getTransactionsByItemIdSortedByCategory(filterId);
        }
        response.json({ status: 1, transactions });
    } catch (err) {
        next(err);
    }
});

router.get("/sum_of_category", async (request, response, next) => {
    try {
        const filterId = request.query.filterId;
        const filterType = request.query.filterType;
        let transactions = [];
        if (filterType === 'user' && filterId > 0) {
            transactions = await getSumOfCategoryTransactionsByUserId(filterId);
        } else if (filterType === 'accounts' && filterId && filterId != '' && filterId != null) {
            transactions = await getSumOfCategoryTransactionsByAccountId(filterId);
        } else if (filterType === 'bank' && filterId && filterId != '' && filterId != null) {
            transactions = await getSumOfCategoryTransactionsByItemId(filterId);
        }
        response.json({ status: 1, transactions });
    } catch (err) {
        next(err);
    }
});

module.exports = {
    router,
    syncTransactions
}