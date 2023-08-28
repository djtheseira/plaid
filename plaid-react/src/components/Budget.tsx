import React, { useEffect, useRef, useState } from "react";
import { useBudget } from "../services";
import { getBudgetSumComparisons } from "../services/api";
import { humanReadableCategory } from "../util";
import { groupBy } from "lodash";
import BudgetCategoryTypeCategorySum from "./BudgetCategoryTypeCategorySum";

interface Props {
    userId: number
};



export default function Budget(props: Props) {
    const initLoad = useRef(false);
    const [budgetSums, setBudgetSums] = useState([]);
    const { budget, } = useBudget(); 
    const { userId } = props;

    useEffect(() => {
        if (initLoad.current) return;
        initLoad.current = true;
        
    }, [budget])

    useEffect( () => {
        const getBudgetSums = async () => {
            const response = await getBudgetSumComparisons(userId);
            if (response.status === 200) {
                setBudgetSums(response.data);
            }
        }

        getBudgetSums();
    }, [userId]);

    return (
        <div className="user-page-budget-section" >
            <div >
                <div className={`d-flex flex-row gap-3}`}>
                    <h5 className="fw-semibold">Budget</h5>
                </div>
            </div>
            {budgetSums.length > 0 ?
                <div className="actual-budget-container mt-4 mb-5">
                    <div className="actual-budget-container-headers text-decoration-underline fw-semibold">
                        <div className="row mx-0">
                            <div className="col-3 actual-budget-container-header">Category</div>
                            <div className="col-3 actual-budget-container-header">Actual</div>
                            <div className="col-3 actual-budget-container-header" >Budget</div>
                            <div className="col-3 actual-budget-container-header" >Difference</div>
                        </div>
                    </div>
                    <div className="actual-budget-container-body">
                        {
                            Object.entries(groupBy(
                                budgetSums,
                                "category_type"
                            )).map((groupedType: any[], index: number) =>{
                                const categoryType = humanReadableCategory(groupedType[0]);
                                const budgets = groupedType[1] as any[];

                                return (
                                    <BudgetCategoryTypeCategorySum budgets={budgets} key={`budget-sum-${index}`} categoryType={categoryType} />
                                )
                            })
                        }
                    </div>
                </div> : null
            }
        </div>
    );
}