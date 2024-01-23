import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBudget } from "../services";
import { getBudgetSumComparisons } from "../services/api";
import { humanReadableCategory } from "../util";
import { groupBy } from "lodash";
import BudgetCategoryTypeCategorySum from "./BudgetCategoryTypeCategorySum";
import { Button } from "react-bootstrap";

interface Props {
    userId: number
};



export default function Budget(props: Props) {
    const [ showAnnual, setShowAnnual] = useState(false);
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
            const response = await getBudgetSumComparisons(userId, showAnnual);
            if (response.status === 200) {
                console.log("response, ", response);
                setBudgetSums(response.data);
            }
        }

        getBudgetSums();
    }, [showAnnual, userId]);

    const monthYearButtonToggle = useCallback(() => {
        setShowAnnual(!showAnnual);
    }, [showAnnual]);

    return (
        <div className="user-page-budget-section" >
            {budgetSums.length > 0 ?
                <>
                    <div className="text-center" >
                        <div className="btn-container btn-group" role="group" >
                            <Button variant="outline-dark" onClick={monthYearButtonToggle} className="me-3" active={!showAnnual} >Monthly</Button>
                            <Button variant="outline-dark" onClick={monthYearButtonToggle} active={showAnnual} >Annual</Button>
                        </div>
                    </div>
                    <div className="actual-budget-container mt-4 mb-5">
                        <div className="actual-budget-container-headers text-decoration-underline fw-semibold">
                            <div className="row mx-0">
                                <div className="col-3 actual-budget-container-header">Category</div>
                                <div className="col-3 actual-budget-container-header text-center">Actual</div>
                                <div className="col-3 actual-budget-container-header text-center" >Budget</div>
                                <div className="col-3 actual-budget-container-header text-center" >Difference</div>
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
                    </div>
                </> : null
            }
        </div>
    );
}