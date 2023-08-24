const db = require("..");

const createItem = async (
    plaidItemId,
    userId,
    plaidAccessToken,
    plaidInstitutionId,
    institutionName
) => {
    const query = {
        text: `
            INSERT INTO items_table(
                user_id, 
                plaid_access_token, 
                plaid_item_id,
                plaid_institution_id, 
                institution_name,
                status
            )
            VALUES
                ($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `,
        values: [
            userId,
            plaidAccessToken,
            plaidItemId,
            plaidInstitutionId,
            institutionName,
            "good",
        ],
    };

    const { rows } = await db.query(query);
    return rows[0];
};

const deleteItem = async (itemId) => {
    const query = {
        text: "DELETE FROM items_table WHERE id = $1;",
        values: [itemId],
    };
    await db.query(query);
};

const updateItemStatus = async (itemId, status) => {
    const query = {
        text: "UPDATE items SET status = $2 WHERE plaid_item_id = $1 RETURNING *;",
        values: [itemId, status],
    };
    const { rows: items } = await db.query(query);
    return items[0];
};

const updateItemTransactionCursor = async (itemId, transactionCursor) => {
    const query = {
        text: "UPDATE items SET transaction_cursor = $2 WHERE plaid_item_id = $1 RETURNING *;",
        values: [itemId, transactionCursor],
    };
    const { rows: items } = await db.query(query);
    return items[0];
};

const getItemByAccessToken = async (plaidAccessToken) => {
    const query = {
        text: "SELECT * FROM items WHERE plaid_access_token = $1;",
        values: [plaidAccessToken],
    };
    await db.query(query);
    const { rows: item } = await db.query(query);
    return item[0];
};

const getItemById = async (item_pk) => {
    const query = {
        text: "SELECT * FROM items WHERE id = $1;",
        values: [item_pk],
    };
    await db.query(query);
    const { rows: item } = await db.query(query);
    return item[0];
};

const getItemByPlaidItemId = async (id) => {
    const query = {
        text: "SELECT * FROM items WHERE plaid_item_id = $1;",
        values: [id],
    };
    await db.query(query);
    const { rows: item } = await db.query(query);
    return item[0];
};

const getItemByInstitutionId = async (userId, plaidInstitutionId) => {
    const query = {
        text: "SELECT * FROM items WHERE plaid_institution_id = $2 AND user_id = $1;",
        values: [userId, plaidInstitutionId],
    };
    await db.query(query);
    const { rows: item } = await db.query(query);
    return item[0];
};

const getItemsByUserId = async (userId) => {
    const query = {
        text: "SELECT * FROM items WHERE user_id = $1;",
        values: [userId],
    };
    const { rows: items } = await db.query(query);
    return items;
};

const getInstitutionNamesByUserId = async (userId) => {
    const query = {
        text: "SELECT id, institution_name FROM items WHERE user_id =  $1",
        values: [userId],
    };
    const { rows: items } = await db.query(query);
    return items;
};

module.exports = {
    createItem,
    deleteItem,
    updateItemStatus,
    updateItemTransactionCursor,
    getItemByAccessToken,
    getItemById,
    getItemByPlaidItemId,
    getItemByInstitutionId,
    getItemsByUserId,
    getInstitutionNamesByUserId,
};
