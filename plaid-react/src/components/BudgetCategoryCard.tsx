import React, { FormEvent, useCallback, useState } from 'react';
import { BudgetType } from './types';
import { humanReadableCategory } from '../util';
import { useBudget } from '../services';

interface Props {
    budget: BudgetType
}

export default function BudgetCategoryCard(props: Props) {
    const { id, user_id: userId, category_id: categoryId, allocated_amount: allocatedAmount, category} = props.budget;
    const [amount, setAmount] = useState(allocatedAmount as number | any);
    const { updateBudgetForCategoryType, removeBudgetLocally } = useBudget(); 

    const handleAmountChangedEvent = useCallback((e:FormEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (!value) {
            setAmount(value);
            return;
        } else {
            const isNotNumber = isNaN(value as any);
            if (isNotNumber) {
                setAmount(value);
                return;
            }
            setAmount(Number.parseInt(value));
        }
    }, []);

    const handleOnLoseFocusEvent = useCallback(() => {
        if (amount < 0 || isNaN(allocatedAmount as any)) return;
        updateBudgetForCategoryType(id, userId, categoryId, amount, category);
    }, [allocatedAmount, amount, category, categoryId, id, updateBudgetForCategoryType, userId]);

    const handleOnRemoveCategoryBudget = useCallback(() => {
        removeBudgetLocally(userId, categoryId);
        // updateBudgetForCategoryType(id, userId, categoryId, 0, category);
    }, [categoryId, removeBudgetLocally, userId])


    return (
        <div className="budget-card row flex-row my-3">
            <label htmlFor={`budget-category-${categoryId}`} className="col-6">{humanReadableCategory(category)}</label>
            <div className={`${isNaN(allocatedAmount as any) || allocatedAmount < 0 ? "form-floating" : "" } col ps-0`}>
                <input className={`form-control ${isNaN(allocatedAmount as any) || allocatedAmount < 0 ? "is-invalid" : "" }`} type={"text"} name={`budget-category-${categoryId}`} 
                    id={`budget-category-${categoryId}`} value={amount} 
                    onBlur={handleOnLoseFocusEvent} onChange={handleAmountChangedEvent}
                />
                { isNaN(allocatedAmount as any) || allocatedAmount < 0 ? 
                    <label htmlFor={`budget-category-${categoryId}`} className="pe-0 text-end" >Amount must be a 0 or greater.</label> : null 
                }
            </div>
            <div className="btn-container col-1">
                <button className="btn px-0" onClick={handleOnRemoveCategoryBudget}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>
            </div>
        </div>
    )
}