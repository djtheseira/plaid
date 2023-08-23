const db = require("../");

const createPlaidApiEvents = async (
    itemId,
    userId,
    plaidMethod,
    clientMethodArgs,
    response
) => {
    const {
        error_code: errorCode,
        error_type: errorType,
        request_id: requestId
    } = response;

    const query = {
        text: `
            INSERT INTO plaid_api_events_table (
                item_id,
                user_id,
                plaid_method, 
                arguments,
                request_id,
                error_type,
                error_code
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `,
        values: [itemId, userId, plaidMethod, JSON.stringify(clientMethodArgs), requestId, errorType, errorCode]
    }

    await db.query(query);
};

module.exports = {createPlaidApiEvents};