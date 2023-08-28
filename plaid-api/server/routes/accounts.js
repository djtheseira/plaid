const express = require("express");
const escape = require("escape-html");
const { plaidClient } = require("../../plaid");
const { getInstitutionNamesByUserId, updateItemStatus, getItemById, getAccountsByItemId, getSumOfAccountsByUserId, getSumOfAccountsByItemId, getBanksAccountsByUserId, getItemByInstitutionId, deleteItem, getTransactionsByAccountId, getTransactionsByItemIdSortedByCategory } = require("../db/queries");
const { getLoggedInUserId, isValidItemStatus, validItemStatuses, sanitizeItems, sanitizeAccounts } = require("../../util");

const router = express.Router();

module.exports = router;