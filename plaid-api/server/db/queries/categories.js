const db = require("../");

const getBudgetCategoryTypes = async () => {
    const query = {
        text: `
            SELECT *
            FROM plaid_category_types_table
            WHERE category_type NOT IN ('INCOME', 'MEDICAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'GOVERNMENT_AND_NON_PROFIT', 'BANK_FEES', 'LOAN_PAYMENTS');
        `
    }
    const { rows: categoryTypes } = await db.query(query);
    return categoryTypes;
}

const getBudgetCategories = async () => {
    const query = {
        text: `
            SELECT *
            FROM plaid_categories pc
            WHERE category_type NOT IN ('INCOME', 'MEDICAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'GOVERNMENT_AND_NON_PROFIT', 'BANK_FEES', 'LOAN_PAYMENTS')
            ORDER BY category_type, category;
        `
    }
    const { rows: categories } = await db.query(query);
    return categories;
}

module.exports = {
    getBudgetCategoryTypes,
    getBudgetCategories,
}