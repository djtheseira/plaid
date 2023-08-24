import React, { SyntheticEvent, useEffect, useState } from "react";
import {
    Banner,
    ItemCard,
    LaunchLink,
    SpendingInsights,
    UserCard
} from ".";
import { useAccounts, useItems, useLink, useTransactions, useUsers } from "../services";
import { RouteComponentProps, NavLink } from "react-router-dom";
import { AccountType, ItemType, RouteInfo } from "./types";
import { sortBy } from "lodash";

import {
    // getSumOfTransactionsByUser,
    getMonthlySumOfTransactionsByUser,
    // getYearlySumOfTransactionsByUser,
    getTopVendorsByUser,
} from "../services/api";
import { Button } from "react-bootstrap";

export default function UserPage({ match }: RouteComponentProps<RouteInfo>) {
    const userId = Number(match.params.userId);
    const [user, setUser] = useState({
        id: 0,
        username: "",
        created_at: "",
        updated_at: "",
    })
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState<ItemType[]>([]);
    const [token, setToken] = useState("");
    const [numOfItems, setNumOfItems] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [transactionSums, setTransactionSums] = useState([]);
    const [topVendors, setTopVendors] = useState([]);
    const [accounts, setAccounts] = useState<AccountType[]>([]);
    const { accountsByUser, getAccountsByUser } = useAccounts();
    const { itemsByUser, getItemsByUser } = useItems();
    const { generateLinkToken, linkTokens } = useLink();
    const { getTransactionsByUser, transactionsByUser } = useTransactions();
    const { usersById, getUserById } = useUsers();

    useEffect(() => {
        getUserById(userId, false);
    }, [getUserById, userId]);

    useEffect(() => {
        setUser(usersById[userId] || {});
    }, [usersById, userId]);

    useEffect(() => {
        getItemsByUser(userId, false);
    }, [getItemsByUser, userId]);

    useEffect(() => {
        const newItems: Array<ItemType> = itemsByUser[userId] || [];
        const orderedItems = sortBy(
            newItems,
            item => new Date(item.updated_at)
        ).reverse();
        setItems(orderedItems);
    }, [itemsByUser, userId]);

    useEffect(() => {
        if (itemsByUser[userId] != null) {
            setNumOfItems(itemsByUser[userId].length);
        } else {
            setNumOfItems(0);
        }
    }, [itemsByUser, userId]);

    useEffect(() => {
        getAccountsByUser(userId);
    }, [getAccountsByUser, userId]);

    useEffect(() => {
        setAccounts(accountsByUser[userId] || []);
    }, [accountsByUser, userId]);

    useEffect(() => {
        setToken(linkTokens.byUser[userId]);
    }, [linkTokens, userId, numOfItems]);

    useEffect(() => {
        getTransactionsByUser(userId);
    }, [getTransactionsByUser, userId]);

    useEffect(() => {
        const getTransactionSums = async () => {
            const sumsResponse = await getMonthlySumOfTransactionsByUser(userId);
            if (sumsResponse.status === 200 && sumsResponse.data.length > 0) {
                setTransactionSums(sumsResponse.data);
            }
        };

        const getTopVendors = async () => {
            const topVendorsResponse = await getTopVendorsByUser(userId, 5);
            if (topVendorsResponse.status === 200 && topVendorsResponse.data.length > 0) {
                setTopVendors(topVendorsResponse.data);
            }
        }

        getTransactionSums();
        getTopVendors();
        setTransactions(transactionsByUser[userId]);

    }, [transactionsByUser, userId]);

    const addAnotherBankEventHandler = async (e:SyntheticEvent) => {
        await generateLinkToken(userId, null);
    };

    return (
        <div>
            <NavLink
                exact
                to="/"
                className={"nav-link"}
            >
                Back to Login
            </NavLink>
            <Banner />

            {userId > 0 ?
                <div className="user-page-container-section" >
                    <UserCard user={user} userId={userId} /> 
                </div> : null
            }
            {numOfItems > 0
                && transactionSums.length > 0
                && topVendors.length > 0 ?
                <>
                    <SpendingInsights userId={userId}
                        transactionSums={transactionSums}
                        topVendors={topVendors}
                    />
                </> : null

            }
            {numOfItems > 0 ?
                <div className="user-page-container-section">
                    <div className="d-flex flex-row justify-content-between align-items-center">
                        <div >
                            <h5 className="fw-semibold">
                                {`${numOfItems} ${numOfItems === 1 ? "Bank" : "Banks"} Linked`}
                            </h5>
                            <p >Click on a bank to see a more detailed view of the connected data.</p>
                        </div>
                        <div className="btn-container">
                            <Button className="btn py-2 px-4" onClick={addAnotherBankEventHandler} >
                                Add another bank
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-chevron-right`} viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                                </svg>
                            </Button>
                            {token != null && token.length > 0 ?
                                <LaunchLink token={token} userId={userId} itemId={null} />: null
                            }
                        </div>
                    </div>
                    <div className="item-cards-container" >
                    {
                        items.map((item:ItemType) => {
                            return <ItemCard key={`item-card-${item.id}`} item={item} userId={userId} />
                        })
                    }
                    </div>
                </div> : null

            }
        </div>
    );
}