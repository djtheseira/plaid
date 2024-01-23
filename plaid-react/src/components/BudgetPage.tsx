import React from 'react';
import { useParams } from 'react-router-dom';
import { Budget } from '.'

interface Props {
    
}

export default function BudgetPage(props: Props) {
    const params = useParams();
    const userId = Number(params.userId);

    return (
        <div
            className="user-page-container-section mt-5"
            id="budget-setting-container"
        >
            <div >
                <div className={`d-flex flex-row`}>
                    <h5 className="fw-semibold">Budget</h5>
                </div>
            </div>

            {userId > 0 ?
                <div className="mt-5" >
                    <Budget userId={userId} />
                </div> : null
            }
            
        </div>
    )
}