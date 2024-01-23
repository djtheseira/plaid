import React, { useCallback, useState } from 'react';
import { currencyFilter, humanReadableCategory } from '../util';

interface Props {
    budgets: any[];
    categoryType: string;
}

export default function BudgetCategoryTypeCategorySum(props: Props) {
    const [ showList, setShowList ] = useState(false);

    const toggleListHandler = useCallback(() => {
        setShowList(!showList);
    }, [showList]);

    return (
        <div >
            <div className={`budget-sum-container ${showList? "expanded" : ""}`}>
                <div className="budget-sum-category-type text-decoration-underline">
                    <span role='button' onClick={toggleListHandler} >{humanReadableCategory(props.categoryType)}</span>
                    <div className="item-card-arrow d-inline-block ms-3" role='button' onClick={toggleListHandler}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={`bi bi-chevron-down`} viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </div>
                </div>
                {showList ? 
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
                                        <div className="col-3 actual-budget-container-cell text-danger text-center">{currencyFilter(categoryTotal)}</div>
                                        <div className="col-3 actual-budget-container-cell text-success text-center" >{currencyFilter(amountAllocated)} </div>
                                        <div className={`col-3 actual-budget-container-cell text-center text-${diff > 0  ? "success" : diff < 0 ? "danger": "secondary"}`} >{currencyFilter(diff)}</div>
                                    </div>
                                )
                            }
                        )}
                    </div> : null
                }
            </div>
        </div>
    )
}