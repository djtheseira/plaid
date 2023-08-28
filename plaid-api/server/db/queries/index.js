const {
    createAccount,
    updateAccountBalance,
    getAccountsByItemId,
    getAccountsByPlaidAccountId,
    getAccountsByUserId,
    getSumOfAccountsByItemId,
    getSumOfAccountsByUserId,
    getBanksAccountsByUserId,
} = require("./accounts");

const {
    getBudgetByUserId,
    setBudgetForCategoryType,
    getBudgetActualSumComparisons,
    removeBudgetForCategoryId,
} = require("./budget");

const {
    getBudgetCategoryTypes,
    getBudgetCategories,
} = require("./categories");

const {
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
} = require("./items");

const { createLinkEvent } = require("./linkEvents");

const { createPlaidApiEvents } = require("./plaidApiEvents");

const { 
    createTransaction,
    updateTransaction,
    createOrUpdateTransactions,
    setTransactionAsRemoved,
    getTransactionByTransactionId,
    getTransactionsByAccountId,
    getTransactionsByUserIdSortedByCategory,
    getTransactionsByAccountIdSortedByCategory,
    getTransactionsByItemIdSortedByCategory,
    getSumOfCategoryTransactionsByUserId,
    getSumOfCategoryTransactionsByItemId,
    getSumOfCategoryTransactionsByAccountId,
    getTopVendorNamesByUserId,
} = require("./transactions");

const {
    createUser, 
    deleteUser,
    deleteAllUsers,
    updateUser,
    getUserByUserId,
    getUserByUsername,
    getFirstUser,
    getUserCount,
    getUserList,
    getItemsAndAccessTokensForUser,
} = require("./users");

module.exports = {
    // Accounts
    createAccount,
    updateAccountBalance,
    getAccountsByItemId,
    getAccountsByPlaidAccountId,
    getAccountsByUserId,
    getSumOfAccountsByItemId,
    getSumOfAccountsByUserId,
    getBanksAccountsByUserId,

    // Budget
    getBudgetByUserId,
    setBudgetForCategoryType,
    getBudgetActualSumComparisons,
    removeBudgetForCategoryId,

    // Categories
    getBudgetCategoryTypes,
    getBudgetCategories,

    // Items
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

    // LinkEvents
    createLinkEvent,

    // PlaidApiEvents
    createPlaidApiEvents,

    // Transactions
    createTransaction,
    updateTransaction,
    createOrUpdateTransactions,
    setTransactionAsRemoved,
    getTransactionByTransactionId,
    getTransactionsByAccountId,
    getTransactionsByUserIdSortedByCategory,
    getTransactionsByAccountIdSortedByCategory,
    getTransactionsByItemIdSortedByCategory,
    getSumOfCategoryTransactionsByUserId,
    getSumOfCategoryTransactionsByItemId,
    getSumOfCategoryTransactionsByAccountId,
    getTopVendorNamesByUserId,

    // Users
    createUser, 
    deleteUser,
    deleteAllUsers,
    updateUser,
    getUserByUserId,
    getUserByUsername,
    getFirstUser,
    getUserCount,
    getUserList,
    getItemsAndAccessTokensForUser,
}