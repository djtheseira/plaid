import axios from "axios";
import React from "react";
import { toast } from "react-toastify";
import { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { DuplicateItemToastMessage } from "../components";

const baseURL = "http://localhost:8000/api";

const api = axios.create({
    baseURL,
    headers: {
        "Cache-Control": "no-cache, no-store,must-revalidate",
        Pragma: "no-cache",
        Expires: 0
    }
});

export default api;

// current user
export const getLoginUser = (username: string) => api.post("/users/get_user", {username});

// users
export const getUsers = () => api.get("/users/list");
export const getUsersCount = () => api.get("/users/count");
export const getUserById = (userId: number) => api.get(`/users/${userId}`);
export const addNewUser = (username: string) => api.post("/users/create", {username});
export const deleteUserByUserId = (userId: number) => api.delete(`/users/${userId}`)

// items
export const getItemById = (id: number) => api.get(`/banks/${id}`);
export const getItemsByUserId = (id: number) => api.get(`/users/${id}/items`);
export const getItemByItemPlaidId = (plaidId: string) => api.get(`/banks/plaid/${plaidId}`);
export const deleteItemById = (itemId: number) => api.delete(`banks/${itemId}`);
export const setItemState = (itemId: number, status: string) => api.put(`/items/${itemId}`, {status});

// link
export const getLinkToken = (userId: number, itemId: number) => api.post("/tokens/generate_link_token", {userId, itemId});

// accounts
export const getAccountsByItem = (itemId: number) => api.get(`/banks/${itemId}/accounts`);
export const getAccountsByUser = (userId: number) => api.get(`/users/${userId}/accounts`);
export const getAccountBalanceByItem = (itemId: number) => api.get(`/banks/${itemId}/accounts/totals`);
export const getAccountBalancesByUserId = (userId: number) => api.get(`/users/${userId}/accounts/totals`);

// transactions
// THIS DOESNT EXIST! !!!! !!!! !!!
export const getTransactionsByAccount = (accountId: number) => api.get(`/banks/accounts/${accountId}/transactions`);
export const getTransactionsByItem = (itemId: number, page?: number) => api.get(`/banks/items/${itemId}/transactions/${page}`);
export const getTransactionsByUser = (userId: number) => api.get(`/users/${userId}/transactions`);
export const getSumOfTransactionsByUser = (userId: number) => api.get(`/users/${userId}/sum_of_transactions`);
export const getMonthlySumOfTransactionsByUser = (userId: number) => api.get(`/users/${userId}/sum_of_transactions/monthly`);
export const getYearlySumOfTransactionsByUser = (userId: number) => api.get(`/users/${userId}/sum_of_transactions/yearly`);
export const getTopVendorsByUser = (userId: number, limit?:number|-1) => api.get(`/users/${userId}/top_vendors/${limit}`);

export const getBudgetCategoryTypes = () => api.get("/categories/types");
export const getBudgetCategories = () => api.get("/categories/");
export const getBudgetsByUser = (userId: number) => api.get(`/budget/${userId}`);
export const getBudgetSumComparisons = (userId: number) => api.get(`/budget/get_budget_sum_comparison/${userId}`);
export const setBudgetByUserCategoryTypeId = (userId: number, categoryId: number, amount: number) => api.post(`/budget`, {userId, categoryId, amount});
export const removeBudgetByUserIdCategoryId = (userId: number, categoryId: number) => api.delete(`/budget/${userId}/${categoryId}`);

// institutions
export const getInstitutionById = (institutionId: string) => api.get(`/institutions/${institutionId}`);

// misc
export const postLinkEvent = (event: any) => api.post("/linkEvents", event);

export const exchangeToken = async (
    publicToken: string,
    institution: any,
    accounts: PlaidLinkOnSuccessMetadata["accounts"],
    userId: number
) => {
    try {
        const { data } = await api.post("/tokens/exchange_public_token", {
            publicToken,
            institutionId: institution.institution_id,
            userId,
            accounts,
        });
        return data;
    } catch (err:any) {
        const { response } = (err);
        if (response && response.status === 409) {
            console.log("hello");
            toast.error(
                <DuplicateItemToastMessage institutionName={institution.name} />
            );
        } else {
            toast.error(`Error linking ${institution.name}`);
        }
    }
}