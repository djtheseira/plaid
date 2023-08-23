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
}