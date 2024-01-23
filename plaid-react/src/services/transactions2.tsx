import React, {
    createContext,
    useContext,
    useMemo,
    useRef,
    useReducer,
    useCallback,
    Dispatch,
} from "react";

import { TransactionType, TransactionSumType } from '../components/types';

import {
    getTransactionsByAccount as apiGetTransactionsByAccount,
    getTransactionsByItem as apiGetTransactionsByItem,
    getTransactionsByUser as apiGetTransactionsByUser,
    getTransactionsByAccount,
} from './api';

interface PageBaseState {
    [id: number] : any;
    
}

interface PageTransactionsState extends PageBaseState {
    transactions: TransactionType[] | any[],
    total: number;
}

interface PageTransactionSumState extends PageBaseState {
    sums: TransactionSumType[] | any[],
    total: number;
}

type TransactionsAction = 
    | {
        type: "SUCCSSFUL_GET";
        payload: PageTransactionsState;
    }
    | {
        type: "SUCCSSFUL_GET_SUM";
        payload: PageTransactionSumState;
    };

interface TransactionContextType extends PageBaseState {
    dispatch: Dispatch<TransactionsAction>;
    transactions: PageTransactionsState;
    transactionsByItems: PageTransactionsState;
    transactionsByAccounts: PageTransactionsState;
    transactionSumsByUser: PageTransactionSumState;
    getTransactionsByItemId: (itemId: number) => void;
    getTransactionsByAccountId: (accountId: number) => void;
    getSumOfTransactionsByUser: (userId: number) => void;
}

const initialState = {};

const TransactionsContext = createContext<TransactionContextType>(
    initialState as TransactionContextType
);

export function TransactionProvider(props: any) {
    const [transactions, dispatch] = useReducer(reducer, initialState);
    const hasRequested = useRef<{
        byAccount: {[accountId: number]: boolean};
    }> ({
        byAccount: {}
    });

    const getTransactionsByItemId = useCallback(async(itemId: number) => {
        const { data: payload } = await apiGetTransactionsByItem(itemId);
        dispatch({ type: "SUCCSSFUL_GET", payload: payload});

    }, []);

    const getTransactionsByAccountId = useCallback(async(accountId: number, refresh: boolean) => {

    }, []);

    const getSumOfTransactionsByUser = useCallback(async(userId: number) => {

    }, []);


    
    const value = useMemo(() => {
        let pageTransactionsState = transactions as PageTransactionsState;
        // let 
        return {
            dispatch,
            transactions,
            getTransactionsByAccount,
            getTransactionsByItemId,
            getSumOfTransactionsByUser,
        }
    }, [
        dispatch,
        transactions,
        getTransactionsByAccountId,
        getTransactionsByItemId,
        getSumOfTransactionsByUser
    ]);

    return <TransactionsContext.Provider value={value} { ...props } />

}


function reducer(state: PageBaseState, action: TransactionsAction | any)  {
    switch(action.type) {
        case "SUCCSSFUL_GET": 
            return {
                ...state,
                transactions: action.payload.transactions
            }
        case "SUCCSSFUL_GET_SUM": 
            return {
                ...state,
                sums: action.payload.sums
            }
        default: 
            console.warn("unknown action: ", action.type, action.payload);
            return state;
    }
}

export default function useTransactions() {
    const context = useContext(TransactionsContext);

    if (!context) {
        throw new Error(
            `useTransaction must be used with a TransactionsProvider`
        );
    }

    return context;
}