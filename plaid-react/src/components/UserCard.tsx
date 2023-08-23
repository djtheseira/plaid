import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { UserType } from "./types";
import { LaunchLink, UserDetails } from ".";
import { useAccounts, useItems, useLink, useUsers } from "../services";

interface Props {
    user: UserType,
    userId: number
}

export default function UserCard(props: Props) {
    const [numOfItems, setNumOfItems] = useState(0);
    const [token, setToken] = useState("");
    const { generateLinkToken, linkTokens } = useLink();
    const { itemsByUser, getItemsByUser } = useItems();
    const initiateLink = async () => {
        await generateLinkToken(props.userId, null);
    }

    useEffect(() => {
        if (props.userId) {
            getItemsByUser(props.userId, true);
        }
    }, [getItemsByUser, props.userId]);

    useEffect(() => {
        if (itemsByUser[props.userId] != null) {
            setNumOfItems(itemsByUser[props.userId].length);
        } else {
            setNumOfItems(0);
        }
    }, [itemsByUser, props.userId]);

    useEffect(() => {
        setToken(linkTokens.byUser[props.userId]);
    }, [linkTokens, props.userId, numOfItems]);

    return (
        <div className={`user-card-container card_container row flex-row align-items-center justify-content-between mx-0`}>
            <div className={`user-card-headers d-flex ${numOfItems === 0 ? "col-9" : "col-12"} flex-row align-items-center justify-content-evenly `} >
                <UserDetails user={props.user} itemCount={numOfItems} />
            </div>
            {numOfItems === 0 ?
                <div className="btn-container col-3 text-end" >
                    <Button onClick={initiateLink} >
                        Add a Bank
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-chevron-right`} viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </Button>
                    {token != null && token.length > 0 ? <LaunchLink userId={props.userId} token={token} itemId={null} /> : null}
                </div>
                : null
            }
        </div>
    );
}