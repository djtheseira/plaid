import React, {
    createContext,
    useContext,
    useMemo,
    useRef,
    useReducer,
    Dispatch,
    useCallback
} from "react";
import keyBy from 'lodash/keyBy';
import omit from 'lodash/omit';
import { toast } from "react-toastify";

import { UserType } from '../components/types';
import { UsersState } from ".";

// get context for accounts, items, and transactions.
import {
    getUsers as apiGetUsers,
    getUserById as apiGetUserById,
    addNewUser as apiAddNewUser,
    deleteUserByUserId as apiDeleteUserById
} from "./api";
import useAccounts from "./accounts";
import useItems from "./items";
import useTransactions from "./transactions";

const initialState = {};

type UsersAction =
    |
    {
        type: "SUCCESSFUL_GET";
        payload: UserType;
    }
    |
    {
        type: "SUCCESSFUL_DELETE";
        payload: number;
    }

interface UsersContextShape extends UsersState {
    dispatch: Dispatch<UsersAction>;
}

const UsersContext = createContext<UsersContextShape>(
    initialState as UsersContextShape
);

/**
 * @desc Maintains the Users context state and provides functions to update that state.
 */
export function UsersProvider(props: any) {
    const [usersById, dispatch] = useReducer(reducer, {});
    const { deleteAccountsByUserId } = useAccounts();
    const { deleteItemsByUserId } = useItems();
    const { deleteTransactionsByUserId } = useTransactions();
    // const {} = useTransactions();

    const hasRequested = useRef<{
        all: Boolean,
        byId: {[id: number]: boolean};
    }>({
        all: false,
        byId: {},
    });

    /**
     * @desc Creates a new user
     */
    const addNewUser = useCallback(async (username:string) => {
        try {
            const { data: payload } = await apiAddNewUser(username);
            dispatch({type: "SUCCESSFUL_GET", payload: payload});
        } catch (err:any) {
            const { response } = err;
            if (response && response.status === 409) {
                toast.error(`Username ${username} already exists`);
            } else {
                toast.error(`Error adding new user.`);
            }
        }
    }, []);


    /**
     * @desc Requests all Users.
     * The api request will be bypassed if the data has already been fetched.
     * A 'refresh' parameter can force a request for new data even if local state exists.
     */
    const getUsers = useCallback(async (refresh:boolean) => {
        if (!hasRequested.current.all || refresh) {
            hasRequested.current.all = true;
            const {data : payload} = await apiGetUsers();
            dispatch({ type: "SUCCESSFUL_GET", payload: payload});
        }
    }, []);


    /**
     * @desc Requests details for a single User.
     * The api request will be bypassed if the data has already been fetched.
     * A 'refresh' parameter can force a request for new data even if local state exists.
     */
    const getUserById = useCallback(async (id: number, refresh: boolean) => {
        if (!hasRequested.current.byId[id] || refresh) {
            hasRequested.current.byId[id] = true;
            const { data : payload} = await apiGetUserById(id);
            dispatch({ type: "SUCCESSFUL_GET", payload: payload});
        }
    }, []);

    /**
     * @desc Will delete User by userId.
     */
    const deleteUserById = useCallback(async (id: number) => {
        await apiDeleteUserById(id);
        deleteItemsByUserId(id);
        deleteAccountsByUserId(id);
        deleteTransactionsByUserId(id);
        dispatch({type: "SUCCESSFUL_DELETE", payload: id});
        delete hasRequested.current.byId[id];
    }, [deleteItemsByUserId, deleteAccountsByUserId, deleteTransactionsByUserId]);

    /**
     * @desc Builds a more accessible state shape from the Users data. useMemo will prevent
     * these from being rebuilt on every render unless usersById is updated in the reducer.
     */
    const value = useMemo(() => {
        const allUsers = Object.values(usersById);

        return {
            allUsers,
            usersById,
            getUsers,
            getUserById,
            getUsersById: getUserById,
            addNewUser,
            deleteUserById,
        };
    }, [usersById, getUsers, getUserById, addNewUser, deleteUserById]);

    return <UsersContext.Provider value={value} {...props} />;
}

/**
 * @desc Handles updates to the Users state as dictated by dispatched actions.
 */
function reducer(state: UsersState, action: UsersAction | any) {
    switch (action.type) {
        case 'SUCCESSFUL_GET':
            if (!action.payload.length) {
                return state;
            }
            return {
                ...state,
                ...keyBy(action.payload, 'id'),
            };
        case 'SUCCESSFUL_DELETE':
            return omit(state, [action.payload]);
        default:
            console.warn('unknown action: ', action.type, action.payload);
            return state;
    }
}

/**
 * @desc A convenience hook to provide access to the Users context state in components.
 */
export default function useUsers() {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error(`useUsers must be used within a UsersProvider`);
    }
    return context;
}