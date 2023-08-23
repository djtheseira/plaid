const express = require("express");
const escape = require("escape-html");
const { plaidClient } = require("../../plaid");
const { getInstitutionNamesByUserId, updateItemStatus, getItemById, getAccountsByItemId, getSumOfAccountsByUserId, getSumOfAccountsByItemId, getBanksAccountsByUserId, getItemByInstitutionId, deleteItem } = require("../db/queries");
const { getLoggedInUserId, isValidItemStatus, validItemStatuses, sanitizeItems, sanitizeAccounts, toArray } = require("../../util");

const router = express.Router();

router.get("/", async (request, response, next) => {
    try {
        let {count = 200, offset = 0} = request.query;
        const radix = 10;
        count = parseInt(count, radix);
        offset = parseInt(offset, radix);
        const plaidRequest = {
            count: count,
            offset: offset,
            options: {
                include_optional_metadata: true,
            }
        };
        const institutionResponse = await plaidClient.institutionsGet(plaidRequest);
        const institutions = institutionResponse.data.institutions;
        response.json(toArray(institutions));
    } catch(err) {
        next(err);
    }
});

router.get("/:institutionId", async (request, response, next) => {
    try {
        let {institutionId} = request.params;
        const plaidRequest = {
            institution_id: institutionId,
            country_codes: ["US"],
            options: {
                include_optional_metadata: true,
            }
        };
        const institutionResponse = await plaidClient.institutionsGetById(plaidRequest);
        const institutions = institutionResponse.data.institutions;
        response.json(toArray(institutions));
    } catch(err) {
        next(err);
    }
});

module.exports = router;