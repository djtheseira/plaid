const db = require("../");
const { getAccountsByPlaidAccountId } = require("./accounts");

const createTransaction = async (
    transactionId,
    plaidAccountId,
    amount,
    isRemoved,
    isPending,
    isoCurrencyCode,
    transactionCategoryType,
    transactionCategory,
    merchantName,
    transactionDate
) => {
    const { id: accountId } = await getAccountsByPlaidAccountId(plaidAccountId);
    const query = {
        text: `
            INSERT INTO transactions_table(
                plaid_transaction_id,
                account_id,
                amount,
                is_removed,
                is_pending,
                iso_currency_code,
                category_type,
                category,
                merchant_name,
                transaction_date
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            )
            RETURNING *;
        `,
        values: [
            transactionId,
            accountId,
            amount,
            isRemoved,
            isPending,
            isoCurrencyCode,
            transactionCategoryType,
            transactionCategory,
            merchantName,
            transactionDate,
        ],
    };
    const { rows: transactions } = await db.query(query);
    return transactions[0];
};

const updateTransaction = async (
    transactionId,
    amount,
    isRemoved,
    isPending,
    transactionCategoryType,
    transactionCategory,
    merchantName,
    transactionDate
) => {
    const query = {
        text: `
            UPDATE transactions 
            SET amount = $2, is_removed = $3,
            is_pending = $4,
            category_type = $5,
            category = $6,
            merchant_name = $7,
            transaction_date = $8
            WHERE plaid_transaction_id = $1
            RETURNING *;
        `,
        values: [
            transactionId,
            amount,
            isRemoved,
            isPending,
            transactionCategoryType,
            transactionCategory,
            merchantName,
            transactionDate,
        ],
    };
    const { rows: transactions } = await db.query(query);
    return transactions[0];
};

/**
 * Creates or updates multiple transactions.
 *
 * @param {Object[]} transactions an array of transactions.
 */
const createOrUpdateTransactions = async (transactions) => {
    const pendingQueries = transactions.map(async (transaction) => {
        const {
            account_id: plaidAccountId,
            transaction_id: plaidTransactionId,
            personal_finance_category: categories,
            name: transactionName,
            amount,
            iso_currency_code: isoCurrencyCode,
            date: transactionDate,
            pending,
        } = transaction;
        const { id: accountId } = await getAccountsByPlaidAccountId(
            plaidAccountId
        );
        const {primary, detailed } = categories;
        try {
            const query = {
                text: `
                    INSERT INTO transactions_table
                    (
                        account_id,
                        plaid_transaction_id,
                        category_type,
                        category,
                        merchant_name,
                        amount,
                        iso_currency_code,
                        transaction_date,
                        is_pending,
                        is_removed
                    )
                    VALUES
                    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (plaid_transaction_id) DO UPDATE 
                    SET 
                        category_type = EXCLUDED.category_type,
                        category = EXCLUDED.category,
                        merchant_name = EXCLUDED.merchant_name,
                        amount = EXCLUDED.amount,
                        iso_currency_code = EXCLUDED.iso_currency_code,
                        transaction_date = EXCLUDED.transaction_date,
                        is_pending = EXCLUDED.is_pending,
                        is_removed = EXCLUDED.is_removed;
                `,
                values: [
                    accountId,
                    plaidTransactionId,
                    primary,
                    detailed,
                    transactionName,
                    amount,
                    isoCurrencyCode,
                    transactionDate,
                    pending,
                    false,
                ],
            };
            await db.query(query);
        } catch (err) {
            console.error(err);
        }
    });
    await Promise.all(pendingQueries);
};

const setTransactionAsRemoved = async (transactionId) => {
    const query = {
        text: "UPDATE transactions_table SET is_removed = true WHERE plaid_transaction_id = $1 RETURNING *;",
        values: [transactionId],
    };

    const { rows: transactions } = await db.query(query);
    return transactions[0];
};

// TODO:: USE CURSOR?
const getTransactionsByAccountId = async (
    accountId,
    limit = -1,
    offset = 0
) => {
    const query = {};
    if (limit > -1 && offset > -1) {
        query.text = `
            SELECT t.*
            FROM transactions t
            WHERE t.account_id = $1 
            AND transaction_date > (current_date - interval '1 month');
        `;
        query.values = [accountId, limit, offset];
    } else {
        query.text = `
            SELECT t.*
            FROM transactions t
            WHERE t.account_id = $1
            AND transaction_date > (current_date - interval '1 month');
        `;
        query.values = [accountId];
    }
    const { rows: transactions } = await db.query(query);
    return transactions;
};

const getTransactionByTransactionId = async (transactionId) => {
    const query = {
        text: "SELECT * FROM transactions WHERE id = $1;",
        values: [transactionId],
    };
    const { rows: transactions } = await db.query(query);
    return transactions[0];
};

const getTransactionsByUserIdSortedByCategory = async (
    userId,
    month, 
    year,
    offset = 0,
    limit = 100,
) => {
    const query = {
        text: `
            SELECT t.id, t.plaid_account_id, t.category_type, t.user_id, t.plaid_item_id,
                replace(t.category, t.category_type || '_', '') as "category",
                t.merchant_name, t.amount, t.transaction_date, t.institution_name
            FROM transactions t
            JOIN accounts a ON a.id = t.account_id
            WHERE t.user_id = $1
            AND t.is_removed = false
            AND t.is_pending = false
            AND t.transaction_date >= date_trunc('month', current_date)
            AND t.transaction_date < date_trunc('month', current_date + interval '1 month')
            ORDER BY 6 asc, t.transaction_date desc
            OFFSET $2 LIMIT $3;
        `,
        values: [userId, offset, limit],
    };
    const { rows: transactions } = await db.query(query);
    return transactions;
};

const getTransactionsCountByUserId = async (
    userId,
    useDateFilter,
    dateFilterInterval
) => {
    const query = {
        text: `
            SELECT COUNT(*)
            FROM transactions
            WHERE user_id = $1
            AND is_removed = false
            AND is_pending = false
            ${
                useDateFilter
                    ? `AND transaction_date > (current_date - interval '1 ${dateFilterInterval}')`
                    : ""
            };
        `,
        values: [userId],
    };
    const { rows: transactions } = await db.query(query);
    return transactions[0];
};

const getTransactionsByItemIdSortedByCategory = async (itemId, page = 1) => {
    const query = {
        text: `
            SELECT t.id, t.plaid_account_id, category_type, user_id, plaid_item_id, 
                replace(category, category_type || '_', '') as "category",
                merchant_name, amount, transaction_date, t.institution_name
            FROM transactions t
            WHERE t.item_id = $1
            AND is_removed = false
            AND is_pending = false
            AND transaction_date > (current_date - interval '1 month')
            ORDER BY category_type, 4, transaction_date;
        `,
        values: [itemId],
    };
    const { rows: transactions } = await db.query(query);
    return transactions;
};

const getTransactionsByAccountIdSortedByCategory = async (accountId) => {
    const query = {
        text: `
            SELECT id, plaid_account_id, category_type, 
                replace(category, category_type || '_', '') as "category",
                merchant_name, transaction_date
            FROM transactions
            WHERE account_id = $1
            AND is_removed = false
            AND is_pending = false
            AND category_type NOT IN ('LOAN_PAYMENTS', 'TRANSFER_IN', 'TRANSFER_OUT', 'INCOME')
            ORDER BY category_type, 4, transaction_date;
        `,
        values: [accountId],
    };
    const { rows: transactions } = await db.query(query);
    return transactions;
};

const getSumOfCategoryTransactionsByUserId = async (
    userId,
    useDateFilter,
    dateFilterInterval
) => {
    const query = {
        text: `
            SELECT SUM(amount), category_type
            FROM transactions
            WHERE user_id = $1
            AND is_removed = false
            AND is_pending = false
            AND category_type NOT IN ('LOAN_PAYMENTS', 'TRANSFER_IN', 'TRANSFER_OUT', 'INCOME')
            ${
                useDateFilter
                    ? `AND transaction_date > (current_date - interval '1 ${dateFilterInterval}')`
                    : ""
            }
            GROUP BY category_type;
        `,
        values: [userId],
    };
    const { rows: transactions } = await db.query(query);
    return transactions;
};

const getSumOfCategoryTransactionsByItemId = async (itemId) => {
    const query = {
        text: `
            SELECT SUM(amount), category_type, 
                replace(category, category_type || '_', '') as "category"
            FROM transactions t 
            WHERE t.item_id = $1
            AND is_removed = false
            AND is_pending = false
            AND category_type NOT IN ('LOAN_PAYMENTS', 'TRANSFER_IN', 'TRANSFER_OUT', 'INCOME')
            GROUP BY category_type, category;
        `,
        values: [itemId],
    };
    const { rows: transactions } = await db.query(query);
    return transactions;
};

const getSumOfCategoryTransactionsByAccountId = async (accountId) => {
    const query = {
        text: `
            SELECT SUM(amount), category_type, 
                replace(category, category_type || '_', '') as "category"
            FROM transactions
            WHERE account_id = $1
            AND is_removed = false
            AND is_pending = false
            AND category_type NOT IN ('LOAN_PAYMENTS', 'TRANSFER_IN', 'TRANSFER_OUT', 'INCOME')
            GROUP BY category_type, category;
        `,
        values: [accountId],
    };
    const { rows: transactions } = await db.query(query);
    return transactions;
};

const getTopVendorNamesByUserId = async (userId, limit = 5) => {
    const query = {
        text: `
            SELECT SUM(amount), merchant_name 
            FROM transactions
            WHERE user_id = $1
            AND is_removed = false
            AND is_pending = false
            AND transaction_date > (current_date - interval '1 month') 
            AND category_type NOT IN ('LOAN_PAYMENTS', 'RENT_AND_UTILITIES', 'TRANSFER_IN', 'TRANSFER_OUT', 'LOAN_PAYMENTS', 'BANK_FEES', 'INCOME')
            GROUP BY merchant_name
            ORDER BY sum desc, merchant_name
            LIMIT $2;
        `,
        values: [userId, limit],
    };
    const { rows: transactions } = await db.query(query);
    return transactions;
};

const test = async () => {
    const query = {
        text: `select * from transactions where user_id = $1 LIMIT 5;`,
        values: [1]
    }

    const data = await db.query(query);
    return data;
}

module.exports = {
    test,
    createTransaction,
    updateTransaction,
    createOrUpdateTransactions,
    setTransactionAsRemoved,
    getTransactionByTransactionId,
    getTransactionsByAccountId,
    getTransactionsByUserIdSortedByCategory,
    getTransactionsCountByUserId,
    getTransactionsByAccountIdSortedByCategory,
    getTransactionsByItemIdSortedByCategory,
    getSumOfCategoryTransactionsByUserId,
    getSumOfCategoryTransactionsByItemId,
    getSumOfCategoryTransactionsByAccountId,
    getTopVendorNamesByUserId,
};
