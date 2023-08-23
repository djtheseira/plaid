const db = require("../");

const createLinkEvent = async ({
    type,
    userId,
    link_session_id: linkSessionId,
    request_id: requestId,
    error_type: errorType,
    error_code: errorCode,
    status: status
}) => {
    const query = {
        text: `
            INSERT INTO link_events_table (
                type,
                user_id,
                link_session_id,
                request_id,
                error_type,
                error_code,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `,
        values: [
            type,
            userId,
            linkSessionId,
            requestId,
            errorType,
            errorCode,
            status
        ]
    };
    await db.query(query);
};

module.exports = {
    createLinkEvent
};