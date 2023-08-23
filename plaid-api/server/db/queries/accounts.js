const {getItemByPlaidItemId} = require("./items");
const db = require("../");

const createAccount = async (
    plaidItemId, 
    account, 
    balances,
) => {

    const {
        available: availableBalance,
        current: currentBalance,
        iso_currency_code: isoCurrencyCode,
        unofficial_currency_code: unofficialCurrencyCode
    } = balances;
    const { account_id: plaidAccountId, name, mask, subtype, type } = account;

    const query = {
        text: `
            INSERT INTO accounts_table (
                item_id, 
                plaid_account_id,
                name, 
                mask, 
                official_name, 
                current_balance, 
                available_balance,
                iso_currency_code, 
                unofficial_currency_code,
                type, 
                subtype
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            )
            RETURNING *;
        `,
        values: [
            plaidItemId,
            plaidAccountId,
            name,
            mask,
            '',
            currentBalance,
            availableBalance,
            isoCurrencyCode,
            unofficialCurrencyCode,
            type,
            subtype
        ]
    }
    const { rows } = await db.query(query);
    return rows[0];
};

const updateAccountBalance = async(plaidAccountId, availableBalance, currentBalance) => {
    const query = {
        text: "UPDATE accounts SET available_balance = $2, current_balance = $3 WHERE plaid_account_id = $1 RETURNING *;",
        values: [plaidAccountId, availableBalance, currentBalance]
    }
    const { rows:accounts } = await db.query(query);
    return accounts;
};

const getAccountsByPlaidAccountId = async (plaidAccountId) => {
    const query = {
        text: "SELECT * FROM accounts WHERE plaid_account_id = $1 ORDER BY id;",
        values: [plaidAccountId]
    }
    const { rows:accounts} = await db.query(query);
    return accounts[0];
}

const getAccountsByItemId = async (itemId) => {
    const query = {
        text: "SELECT * FROM accounts WHERE item_id = $1 ORDER BY id",
        values: [itemId]
    }
    const { rows:accounts } = await db.query(query);
    return accounts;
}

const getAccountsByUserId  = async (userId) => {
    const query = {
        text: "SELECT * FROM accounts WHERE user_id = $1 ORDER BY id;",
        values: [userId]
    }
    const { rows:accounts } = await db.query(query);
    return accounts;
}

const getSumOfAccountsByItemId = async (itemId) => {
    const query = {
        text: "SELECT SUM(current_balance) FROM accounts WHERE item_id = $1;",
        values: [itemId]
    };
    const { rows:totals } = await db.query(query);
    return totals;
}

const getSumOfAccountsByUserId = async (userId) => {
    const query = {
        text: "SELECT item_id, SUM(current_balance) FROM accounts WHERE user_id = $1 GROUP BY item_id;",
        values: [userId]
    };
    const { rows:totals } = await db.query(query);
    return totals;
}

const getBanksAccountsByUserId = async (userId) => {
    const query = {
        text: `
            SELECT *
            FROM accounts a 
            WHERE user_id = $1;
        `,
        values: [userId]
    }
    const { rows : accounts} = await db.query(query);
    return accounts;
};

module.exports = {
    createAccount,
    updateAccountBalance,
    getAccountsByItemId,
    getAccountsByPlaidAccountId,
    getAccountsByUserId,
    getSumOfAccountsByItemId,
    getSumOfAccountsByUserId,
    getBanksAccountsByUserId,
}

