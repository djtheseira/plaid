import React, { useEffect } from "react";
import {
    Banner,
} from ".";
import { NavLink, Outlet, Link, useParams } from "react-router-dom";
import { useBudget } from "../services";

export default function UserPage() {
    const params = useParams();
    const userId = Number(params.userId);
    const { getBudgetsByUserId } = useBudget();
    useEffect(() => {
        getBudgetsByUserId(userId);
    }, [getBudgetsByUserId, userId]);
    
    return (
        <div>
            <Link to="/" className={"nav-link"} >
                Back to Login
            </Link>

            <Banner />

            <div className="user-page-container-section" id="nav-tabs-container">
                <ul className="nav nav-tabs" >
                    <li className="nav-item">
                        <NavLink className={"nav-link"} to={`${userId}`} end >Bank Info</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className={"nav-link"} to={`${userId}/budget`} >Budget</NavLink>
                    </li>
                </ul>
            </div>

            <Outlet />
        </div>
    );
}