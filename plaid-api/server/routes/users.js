const express = require("express");
const escape = require("escape-html");
const {
    createUser, 
    deleteUser, 
    deleteAllUsers, 
    getUserByUserId, 
    getUserList, 
    getUserCount, 
    getUserByUsername, 
    getItemsByUserId,
    getBanksAccountsByUserId,
    getSumOfAccountsByUserId,
    getTransactionsByUserIdSortedByCategory,
    getSumOfCategoryTransactionsByUserId,
    getTopVendorNamesByUserId,
    getTransactionsCountByUserId,
} = require("../db/queries");
const { plaidClient } = require("../../plaid");
const { getLoggedInUserId, sanitizeUsers } = require("../../util");

const router = express.Router();

router.post("/create", async (request, response, next) => {
    Promise.resolve()
        .then(async () => {
            const username = escape(request.body.username);
            // const password = escape(request.body.password);
            const result = await createUser(username);
            console.log(`User creation result is ${JSON.stringify(result)}`);
            if (result.id != null) {
                result.signed_in = true;
                response.cookie("signedInUser", result.id, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    httpOnly: true,
                });
            }
            response.json(result);
        })
        .catch(err => {
            next(err);
        });
});

router.delete("/:userId", async (request, response, next) => {
    try {
        const userId = request.body.userid;
        const items = await getItemsByUserId(userId);
        await Promise.all(
            items.map(({ plaid_access_token: token }) =>
                plaidClient.itemRemove({ access_token: token })
            )
        );
        const wasDeleted = await deleteUser(userId);
        response.json({ status: wasDeleted ? 1 : 0 });
    }
    catch (err) {
        next(err);
    }
});

router.post("/delete_all", async (request, response, next) => {
    Promise.resolve()
        .then(async () => {
            const rowCount = await deleteAllUsers();
            response.json({ rowCount });
        })
        .catch(err => {
            next(err);
        });
});

router.get("/count", async (request, response, next) => {
    Promise.resolve()
        .then(async () => {
            const userCount = await getUserCount();
            response.json({ userCount });
        })
        .catch(err => {
            next(err);
        });
});

router.get("/list", async (request, response, next) => {
    Promise.resolve()
        .then(async () => {
            const users = await getUserList();
            response.json(sanitizeUsers(users));
        })
        .catch((err) => {
            next(err);
        });
});

router.post("/sign_in", async (request, response, next) => {
    try {
        const userId = escape(request.body.userId);
        response.cookie("signedInUser", userId, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });
        response.json({ signedIn: true });
    } catch (err) {
        next(err);
    }
});

router.post("/get_user", async (request, response, next) => {
    try {
        const { username } = request.body;
        const user = await getUserByUsername(username);
        if (user != null) {
            response.json(sanitizeUsers(user));
        } else {
            response.JSON(null);
        }
    } catch (err) {
        next(err);
    }
});

router.get("/:userId", async (request, response, next) => {
    const { userId } = request.params;
    const user = await getUserByUserId(userId);
    response.json(sanitizeUsers(user));
});

router.post("/sign_out", async (request, response, next) => {
    try {
        response.clearCookie("signedInUser");
        response.json({ signedOut: true });
    } catch (err) {
        next(err);
    }
});

router.get("/get_my_info", async (request, response, next) => {
    Promise.resolve()
        .then(async () => {
            console.log("test getmyinfoo");
            const loggedInUserId = getLoggedInUserId(request);
            console.log(`Logged in userId: ${loggedInUserId}`);
            let result;
            if (loggedInUserId != null) {
                const userObject = await getUserByUserId(loggedInUserId);
                if (userObject == null) {
                    response.clearCookie("signedInUser");
                    response.json({ userInfo: null });
                } else {
                    result = { id: userObject.id, username: userObject.username };
                }
            } else {
                result = null;
            }
            response.json({ userInfo: result });
        })
        .catch((err) => {
            next(err);
        })
});

router.get("/count", async (request, response, next) => {
    console.log("count");
    Promise.resolve()
        .then(async () => {
            const userCount = await getUserCount();
            console.log("usercount: ", userCount);
            response.json({ user_count: userCount.count });
        })
        .catch(err => {
            next(err);
        })
});

router.get("/:userId/accounts", async (request, response, next) => {
    try {
        const { userId } = request.params;
        const accounts = await getBanksAccountsByUserId(userId);
        if (accounts) {
            response.json(accounts);
        } else {
            response.json({ status: 0 });
        }
    } catch (err) {
        next(err);
    }
});

router.get("/:userId/accounts/totals", async (request, response, next) => {
    try {
        const { userId } = request.params;
        const totals = await getSumOfAccountsByUserId(userId);
        response.json(totals);
    } catch (err) {
        next(err);
    }
});

router.get("/:userId/items", async (request, response, next) => {
    try {
        const { userId } = request.params;
        const userItems = await getItemsByUserId(userId);
        response.json(userItems);
    } catch (err) {
        next(err);
    }
});

router.get("/:userId/transactions", async (request, response, next) => {
    try {
        const { userId } = request.params;
        const { offset = 0, limit = 100, total = 0, month = 1, year = 2023 } = request.query;
        const userTransactions = await getTransactionsByUserIdSortedByCategory(userId, month, year, offset, limit);
        const transactions = {
            transactions: userTransactions,
            transactionCount: 0,
        }
        if (Number(total) === 0 && !isNaN(total)) {
            const transactionCount = await getTransactionsCountByUserId(userId, true, 'month');
            transactions.transactionCount = Number(transactionCount.count);
        }
        response.json(transactions);
    } catch (err) {
        next(err);
    }
});

router.get("/:userId/sum_of_transactions", async (request, response, next) => {
    try {
        const { userId } = request.params;
        const userTransactions = await getSumOfCategoryTransactionsByUserId(userId, false, '');
        response.json(userTransactions);
    } catch (err) {
        next(err);
    }
});

router.get("/:userId/sum_of_transactions/monthly", async (request, response, next) => {
    try {
        const { userId } = request.params;
        const userTransactions = await getSumOfCategoryTransactionsByUserId(userId, true, 'month');
        response.json(userTransactions);
    } catch (err) {
        next(err);
    }
});

router.get("/:userId/sum_of_transactions/yearly", async (request, response, next) => {
    try {
        const { userId } = request.params;
        const userTransactions = await getSumOfCategoryTransactionsByUserId(userId, true, 'year');
        response.json(userTransactions);
    } catch (err) {
        next(err);
    }
});

router.get("/:userId/top_vendors/:limit", async (request, response, next) => {
    try {
        const {userId, limit} = request.params;
        const topVendors = await getTopVendorNamesByUserId(userId, limit > 0 ? limit : null);
        response.json(topVendors);
    } catch (err) {
        next(err);
    }
});

module.exports = router;