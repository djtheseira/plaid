const isArray = require('lodash/isArray');
const pick = require('lodash/pick');
const util = require('util');

/**
 * Wraps input in an array if needed.
 *
 * @param {*} input the data to be wrapped in array if needed.
 * @returns {*[]} an array based on the input.
 */
const toArray = input => (isArray(input) ? [...input] : [input]);

/**
 * Returns an array of objects that have only the given keys present.
 *
 * @param {(Object|Object[])} input a single object or an array of objects.
 * @param {string[]} keysToKeep the keys to keep in the sanitized objects.
 */
const sanitizeWith = (input, keysToKeep) =>
    toArray(input).map(obj => pick(obj, keysToKeep));

/**
 * Returns an array of sanitized accounts.
 *
 * @param {(Object|Object[])} accounts a single account or an array of accounts.
 */
const sanitizeAccounts = accounts =>
    sanitizeWith(accounts, [
        'id',
        'item_id',
        'user_id',
        'plaid_account_id',
        'name',
        'mask',
        'official_name',
        'current_balance',
        'available_balance',
        'iso_currency_code',
        'unofficial_currency_code',
        'number_of_transfers',
        'type',
        'subtype',
        'created_at',
        'updated_at',
    ]);

/**
 * Returns an array of sanitized items.
 *
 * @param {(Object|Object[])} items a single item or an array of items.
 */
const sanitizeItems = items =>
    sanitizeWith(items, [
        'item_pk',
        'id',
        'user_id',
        'plaid_institution_id',
        'plaid_access_token',
        'institution_name',
        'transaction_cursor',
        'status',
        'created_at',
        'updated_at',
    ]);

/**
 * Returns an array of sanitized users.
 *
 * @param {(Object|Object[])} users a single user or an array of users.
 */
const sanitizeUsers = users =>
    sanitizeWith(users, [
        'id',
        'username',
        'created_at',
        'updated_at',
    ]);

const validItemStatuses = new Set(['good', 'bad']);
const isValidItemStatus = status => validItemStatuses.has(status);

const prettyPrintResponse = response => {
    console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

const getLoggedInUserId = function (req) {
    console.log("req method: ", req.method);
    console.log("query or body: ", req.method == "GET" ? req.query : req.body);
    return req.method == "GET" ? req.query.userId : req.body.userId;
};

module.exports = {
    toArray,
    sanitizeAccounts,
    sanitizeItems,
    sanitizeUsers,
    validItemStatuses,
    isValidItemStatus,
    prettyPrintResponse,
    getLoggedInUserId,
};