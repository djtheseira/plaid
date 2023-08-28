import React, {
    createContext,
    useContext,
    useMemo,
    useReducer,
    useCallback,
    Dispatch,
} from "react";
import { BudgetType } from "../components/types";
import {
    getBudgetsByUser as apiGetBudgetsByUser,
    setBudgetByUserCategoryTypeId as apiSetBudgetByUserCategoryTypeId,
    removeBudgetByUserIdCategoryId as apiRemoveBudgetByUserIdCategoryId
} from './api';
import { Dictionary, find, findIndex, fromPairs, keyBy, remove, sortBy, toPairs } from "lodash";

interface BudgetState {
    [budgetId: number]: BudgetType;
    budget: BudgetType[];
}

const initialState = {};

type BudgetAction = 
    | {
        type: "SUCCESSFUL_GET";
        payload: any;
    }
    | {
        type: "SUCCESSFUL_SET_BUDGET";
        payload: any;
    }
    | {
        type: "SUCCESSFUL_UPDATE_BUDGET_ITEM";
        payload: BudgetType;
    }
    | {
        type: "SUCCESSFUL_REMOVAL_BUDGET_ITEM";
        payload: number;
    };

interface BudgetsContextShape extends BudgetState {
    dispatch: Dispatch<BudgetAction>;
    getBudgetsByUserId: (userId: number) => void;
    setBudgetByUserCategoryTypeId: (userId: number) => void;
    updateBudgetForCategoryType: (budgetId: number, userId: number, categoryId: number, amount: number, categoryName: string) => void;
    getBudgetByCategoryTypeId: (categoryTypeId: number) => BudgetType;
    getBudgetTotal: () => number;
    removeBudgetLocally: (userId: number, categoryId: number) => void;
    budget: BudgetType[] | any;
    budgetByCategory: Dictionary<any>;
}

const BudgetContext = createContext<BudgetsContextShape>(
    initialState as BudgetsContextShape
);

export function BudgetProvider(props: any) {
    const [budgetState, dispatch] = useReducer(reducer, initialState);

    const getBudgetsByUserId = useCallback( async (userId:number) => {
        const { data: payload } = await apiGetBudgetsByUser(userId);
        dispatch({ type: "SUCCESSFUL_GET", payload});
    }, []);

    const setBudgetByUserCategoryTypeId = useCallback( async (userId:number) => {
        if (budgetState.budget != null && budgetState.budget.length > 0) {
            (budgetState.budget as BudgetType[]).forEach( async (budget:BudgetType) => {
                const { category_id: categoryId, allocated_amount: amount, hide_locally: hideLocally } = budget;
                if (hideLocally) {
                    await apiRemoveBudgetByUserIdCategoryId(userId, categoryId);
                    dispatch({ type: "SUCCESSFUL_REMOVE_BUDGET"});
                } else {
                    const { data: payload } = await apiSetBudgetByUserCategoryTypeId(userId, categoryId, amount);
                    dispatch({ type: "SUCCESSFUL_SET_BUDGET", payload});
                }
            });
        }
    }, [budgetState]);

    const updateBudgetForCategoryType = useCallback((budgetId: number, userId: number, 
            categoryId: number, amount: number, categoryName:string ) => {
        dispatch({ type: "SUCCESSFUL_UPDATE_BUDGET_ITEM", payload: {
            id: budgetId,
            user_id: userId,
            category_id: categoryId,
            allocated_amount: amount as number,
            category: categoryName
        }});
    }, []);

    const getBudgetByCategoryTypeId = useCallback((categoryTypeId: number) => {
        if (budgetState.budget == null) return {};
        const keyedBudget = keyBy(budgetState.budget, 'category_type_id');
        if ( keyedBudget[categoryTypeId] == null) return {} as BudgetType;
        return keyedBudget[categoryTypeId];
    }, [budgetState.budget]);

    const getBudgetTotal = useCallback(() => {
        let total = 0;
        if (budgetState.budget && budgetState.budget.length > 0) {
            (budgetState.budget as BudgetType[]).forEach((budget:BudgetType) => {
                total += budget.allocated_amount;
            });
        }
        return total;
    }, [budgetState.budget]);

    const removeBudgetLocally = useCallback(async (userId: number, categoryId:number) => {
        await apiRemoveBudgetByUserIdCategoryId(userId, categoryId);
        dispatch({
            type: "SUCCESSFUL_REMOVAL_BUDGET_ITEM", payload: {
                categoryId,
            }
        })
    }, []);

    const value = useMemo(() => {
        return {
            dispatch,
            getBudgetsByUserId,
            setBudgetByUserCategoryTypeId,
            updateBudgetForCategoryType,
            getBudgetByCategoryTypeId,
            getBudgetTotal,
            removeBudgetLocally,
            budget: budgetState.budget,
            budgetByCategory: keyBy(budgetState.budget, 'category_id'),
            
        };
    }, [
        dispatch,
        getBudgetsByUserId,
        setBudgetByUserCategoryTypeId,
        updateBudgetForCategoryType,
        getBudgetByCategoryTypeId,
        getBudgetTotal,
        removeBudgetLocally,
        budgetState,
    ]);
    return <BudgetContext.Provider value={value} {...props} />
}

function reducer(state: BudgetState, action: BudgetAction | any) {
    switch(action.type) {
        case "SUCCESSFUL_GET" :
            return {
                ...state,
                budget: action.payload,
            }
        case "SUCCESSFUL_SET_BUDGET" :
            return {
                ...state,
                ...action.payload
            }
        case "SUCCESSFUL_UPDATE_BUDGET_ITEM":
            const updatedBudgetItem = action.payload as BudgetType;
            if (state.budget == null) state.budget = [];
            let index = findIndex(state.budget, (item: BudgetType) => item.category_id === updatedBudgetItem.category_id);
            if (index === -1) {
                state.budget.push(updatedBudgetItem);
            } else {
                state.budget[index] = updatedBudgetItem;
            }
            return {
                ...state,
            }
        case "SUCCESSFUL_REMOVAL_BUDGET_ITEM": 
            if (state.budget != null) {
                remove(state.budget, (budget: BudgetType) => {
                    return budget.category_id === action.payload.categoryId;
                });
            }
            return {
                ...state
            }
        default:
            console.warn('unknown action: ', action.type, action.payload);
            return state;
    }
    
}


export default function useBudget() {
    const context = useContext(BudgetContext);
    if (!context) {
        throw new Error(
            `useBudgets must be used with a BudgetProvider.`
        )
    }
    return context;
}