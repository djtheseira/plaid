import React, {
    createContext,
    useContext,
    useMemo,
    useRef,
    useReducer,
    useCallback,
    Dispatch,
} from 'react';
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';
import omitBy from 'lodash/omitBy';

import { TransactionType, TransactionSumType } from '../components/types';

import {
    getTransactionsByAccount as apiGetTransactionsByAccount,
    getTransactionsByItem as apiGetTransactionsByItem,
    getTransactionsByUser as apiGetTransactionsByUser,
} from './api';
import { Dictionary } from 'lodash';

interface TransactionsState {
    transactions: {
        [transactionId: number]: TransactionType;
    };
    transactionCount: number;
}

interface TransactionSumState {
    sum: number;
    category: string;
    category_type: string;
}

// interface TransactionsState {
//     transactionState: TransactionState;
//     dispatch: Dispatch<TransactionsAction>;
//     transactionsByAccount: Dictionary<any>;
//     getTransactionsByAccount: (accountId: number, refresh?: boolean) => void;
//     deleteTransactionsByItemId: (itemId: number) => void;
//     deleteTransactionsByUserId: (userId: number) => void;
//     transactionsByUser: Dictionary<any>;
//     getTransactionsByUser: (userId: number) => void;
//     transactionsByItem: Dictionary<any>;
//     getSumOfTransactionsByUser: (userId: number, dateFilterType:number) => void;
//     transactionSums?: Dictionary<any> | [];
//     transactions: Dictionary<any>;
//     transactionCount: number;
// }

const initialState = {};

type TransactionsAction =
    | {
        type: "SUCCESSFUL_GET";
        payload: TransactionsState;
    }
    | {
        type: "SUCCESSFUL_GET_SUM";
        payload: TransactionsState;
    }
    | {
        type: "DELETE_BY_ITEM";
        payload: number;
    }
    | {
        type: "DELETE_BY_USER";
        payload: number;
    };

interface TransactionsContextShape extends TransactionsState, TransactionSumState {
    dispatch: Dispatch<TransactionsAction>;
    transactionsByAccount: Dictionary<any>;
    getTransactionsByAccount: (accountId: number, refresh?: boolean) => void;
    deleteTransactionsByItemId: (itemId: number) => void;
    deleteTransactionsByUserId: (userId: number) => void;
    transactionsByUser: Dictionary<any>;
    getTransactionsByUser: (userId: number) => void;
    transactionsByItem: Dictionary<any>;
    getSumOfTransactionsByUser: (userId: number, dateFilterType:number) => void;
    transactionSums?: Dictionary<any> | [];
    transactions: Dictionary<any>;
    transactionCount: number;
}

const TransactionsContext = createContext<TransactionsContextShape>(
    initialState as TransactionsContextShape
);

/**
 * @desc Maintains the Transactions context state and provides functions to update that state.
 *
 *  The transactions requests below are made from the database only.  Calls to the Plaid transactions/get endpoint are only
 *  made following receipt of transactions webhooks such as 'DEFAULT_UPDATE' or 'INITIAL_UPDATE'.
 */
export function TransactionProvider(props: any) {
    const [transactionsById, dispatch] = useReducer(reducer, initialState);

    const hasRequested = useRef<{
        byAccount: { [accountId: number]: boolean };
    }>({
        byAccount: {}
    });

    const transactionCount = useRef<number>(0);

    /**
     * @desc Requests all Transactions that belong to an individual Account.
     * The api request will be bypassed if the data has already been fetched.
     * A 'refresh' parameter can force a request for new data even if local state exists.
     */
    const getTransactionsByAccount = useCallback(async (accountId: number, refresh: boolean) => {
        if (!hasRequested.current.byAccount[accountId] || refresh) {
            hasRequested.current.byAccount[accountId] = true;
            const { data: payload } = await apiGetTransactionsByAccount(accountId);
            dispatch({ type: "SUCCESSFUL_GET", payload: payload });
        }
    }, []);

    /**
     * @desc Requests all Transactions that belong to an individual Item.
     */
    const getTransactionsByItem = useCallback(async (itemId: number) => {
        const { data: payload } = await apiGetTransactionsByItem(itemId);
        dispatch({ type: "SUCCESSFUL_GET", payload: payload });
    }, []);

    /**
     * @desc Requests all Transactions that belong to an individual User.
     */
    const getTransactionsByUser = useCallback(async (userId: number) => {
        const { data: payload } = await apiGetTransactionsByUser(userId);
        transactionCount.current = payload.transactionCount;
        console.log("payload: ", payload);
        dispatch({ type: "SUCCESSFUL_GET", payload: payload });
    }, []);

    /**
   * @desc Will Delete all transactions that belong to an individual Item.
   * There is no api request as apiDeleteItemById in items delete all related transactions
   */
    const deleteTransactionsByItemId = useCallback((itemId: number) => {
        dispatch({ type: 'DELETE_BY_ITEM', payload: itemId });
    }, []);

    /**
     * @desc Will Delete all transactions that belong to an individual User.
     * There is no api request as apiDeleteItemById in items delete all related transactions
     */
    const deleteTransactionsByUserId = useCallback((userId: number) => {
        dispatch({ type: 'DELETE_BY_USER', payload: userId });
    }, []);

    /**
     * @desc Builds a more accessible state shape from the Transactions data. useMemo will prevent
     * these from being rebuilt on every render unless transactionsById is updated in the reducer.
     */
    const value = useMemo(() => {
        const allTransactions = Object.values(transactionsById);
        console.log("transactionsById: ", transactionsById);
        return {
            dispatch,
            allTransactions,
            transactionsByAccount: groupBy(allTransactions, 'account_id'),
            transactionsByItem: groupBy(allTransactions, 'item_id'),
            transactionsByUser: groupBy(allTransactions, 'user_id'),
            getTransactionsByAccount,
            getTransactionsByItem,
            getTransactionsByUser,
            deleteTransactionsByItemId,
            deleteTransactionsByUserId,
        };
    }, [
        dispatch,
        transactionsById,
        getTransactionsByAccount,
        getTransactionsByItem,
        getTransactionsByUser,
        deleteTransactionsByItemId,
        deleteTransactionsByUserId,
    ]);

    return <TransactionsContext.Provider value={value} {...props} />;
}

/**
 * @desc Handles updates to the Transactions state as dictated by dispatched actions.
 */
function reducer(state: TransactionsState, action: TransactionsAction | any) {
    switch (action.type) {
        case 'SUCCESSFUL_GET':
            console.log("action: ", action);
            if (!action.payload.transactions.length) {
                return state
            }
            return {
                ...state,
                ...keyBy(action.payload.transactions, 'id'),
                transactionCount: action.payload.transactionCount,
            };
        case 'SUCCESSFUL_GET_SUM':
            if (!action.payload.length) {
                return state;
            }
            return {
                ...state,
                transactionSums: action.payload
            };
        case 'DELETE_BY_ITEM':
            // if (state)
            return 0;
        case 'DELETE_BY_USER':
            return action.payload;
        default:
            console.warn('unknown action: ', action.type, action.payload);
            return state;
    }
}

/**
 * @desc A convenience hook to provide access to the Transactions context state in components.
 */
export default function useTransactions() {
    const context = useContext(TransactionsContext);

    if (!context) {
        throw new Error(
            `useTransactions must be used within a TransactionsProvider`
        );
    }

    return context;
}