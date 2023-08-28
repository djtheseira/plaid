const db = require("../");

const setBudgetForCategoryType = async (userId, categoryId, amount) => {
    const query = {
        text: `
            INSERT INTO budgets_table(
                user_id,
                category_id,
                allocated_amount
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, category_id) DO UPDATE SET
                allocated_amount = EXCLUDED.allocated_amount
            RETURNING *;
        `,
        values: [userId, categoryId, amount],
    };

    const { rows: budgets } = await db.query(query);
    return budgets[0];
};

const removeBudgetForCategoryId = async (userId, categoryId) => {
    const query = {
        text: `
            DELETE FROM budgets_table WHERE user_id = $1 AND category_id = $2;
        `,
        values: [userId, categoryId]
    }
    await db.query(query);
}

const getBudgetByUserId = async (userId) => {
    const query = {
        text: `
            SELECT * FROM budgets WHERE user_id = $1;
        `,
        values: [userId],
    };

    const { rows: budgets } = await db.query(query);
    return budgets;
};

const getBudgetActualSumComparisons = async (userId) => {
    const query = {
        text: `
            SELECT pc.category_id, pc.category, pc.category_type_id, pc.category_type, coalesce (x.category_total, 0) as "category_total", coalesce (b.allocated_amount, 0) as "amount_allocated" 
            FROM (
                SELECT pc.category_id , sum(t.amount) as "category_total"
                FROM transactions t
                JOIN plaid_categories pc ON t.category = pc.category
                JOIN plaid_category_types_table pctt ON pctt.id = pc.category_type_id
                WHERE pctt.category_type NOT IN ('INCOME', 'TRANSFER_IN', 'TRANSFER_OUT', 'GOVERNMENT_AND_NON_PROFIT', 'BANK_FEES', 'LOAN_PAYMENTS')
                AND t.user_id = $1
                GROUP BY pc.category_id
            ) x 
            RIGHT JOIN budgets b ON b.category_id = x.category_id
            RIGHT JOIN plaid_categories pc ON pc.category_id = b.category_id;
        `,
        values: [userId],
    };

    const { rows: budgets } = await db.query(query);
    return budgets;
};

module.exports = {
    setBudgetForCategoryType,
    getBudgetByUserId,
    getBudgetActualSumComparisons,
    removeBudgetForCategoryId,
};
