import React from 'react';
import { currencyFilter, humanReadableCategory } from '../util';

interface Props {
    budgets: any[];
    categoryType: string;
}

export default function BudgetCategoryTypeCategorySum(props: Props) {
    return (
        <div >
            <div className="budget-sum-container" >
                <div className="text-center budget-sum-category-type text-decoration-underline">{humanReadableCategory(props.categoryType)}<div className="text-uppercase text-danger" >Add a hide button</div></div>
                <div className="budget-sum-category-list" >
                    { 
                        props.budgets.map((budget: any) => {
                            const { 
                                category_id: id,
                                category_total: categoryTotal,
                                amount_allocated: amountAllocated,
                                category,
                            } = budget as any;
                            const diff = amountAllocated - categoryTotal;
                            return (
                                <div className="row mx-0" key={`sum-budget-${id}`}>
                                    <div className="col-3 actual-budget-container-cell">{`${humanReadableCategory(category)}`}</div>
                                    <div className="col-3 actual-budget-container-cell text-danger">{currencyFilter(categoryTotal)}</div>
                                    <div className="col-3 actual-budget-container-cell text-success" >{currencyFilter(amountAllocated)} </div>
                                    <div className={`col-3 actual-budget-container-cell text-${diff > 0  ? "success" : diff < 0 ? "danger": "secondary"}`} >{currencyFilter(diff)}</div>
                                </div>
                            )
                        }
                    )}
                </div>
            </div>
        </div>
    )
}