import React, { SyntheticEvent, useEffect, useState } from "react";
import { AccountType, ItemType } from "./types";
import { Button } from "react-bootstrap";
import { useAccounts, useInstitutions, useItems, useTransactions } from "../services";
import { Institution } from "plaid";
import { AccountCard } from ".";

interface Props {
    item: ItemType,
    userId: number
}

export default function ItemCard(props:Props) {
    const [accounts, setAccounts] = useState<AccountType[]>([]);
    const [institution, setInstitution] = useState<Institution>({
        logo: '',
        name: '',
        institution_id: '',
        oauth: false,
        products: [],
        country_codes: [],
        routing_numbers: []
    });
    const [showAccounts, setShowAccounts] = useState(false);

    const { accountsByItem, deleteAccountsByItemId } = useAccounts();
    const { deleteItemById } = useItems();
    const { deleteTransactionsByItemId } = useTransactions();
    const {
        institutionsById,
        getInstitutionById,
        formatLogoSrc
    } = useInstitutions();

    const { id, plaid_institution_id, status } = props.item;
    const userId = props.userId;

    const removeBankConnection = () => {
        deleteItemById(id, userId);
        deleteAccountsByItemId(id);
        deleteTransactionsByItemId(id);
    }

    useEffect(() => {
        const itemAccounts: AccountType[] = accountsByItem[id];
        setAccounts(itemAccounts || []);
    }, [accountsByItem, id]);

    useEffect(() => {
        setInstitution(institutionsById[id] || {});
    }, [institutionsById, id]);

    useEffect(() => {
        getInstitutionById(plaid_institution_id)
    }, [getInstitutionById, plaid_institution_id]);
    
    const onItemCardClick = () => {
        console.log("accounts: ", accounts);
        setShowAccounts(!showAccounts);
    };

    return (
        <div className={`item-card ${showAccounts && accounts.length > 0 ? "expanded" : ""}`} >
            <div role="button" onClick={onItemCardClick}>
                <div className="item-card__header d-flex flex-row justify-content-between align-items-en position-relative" >
                    <div >
                        <img
                            className="item-card__img"
                            src={formatLogoSrc(institution.logo)}
                            alt={institution && institution.name}
                        />
                        <p className="mb-1 d-inline-block">{props.item.institution_name}</p>
                    </div>
                    <div className="position-absolute start-50 item-card-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={`bi bi-chevron-down`} viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </div>
                    <div className="item-btn-menu">
                        <div className="btn-container" >
                            <Button onClick={removeBankConnection} className="btn-remove" >Remove</Button>
                        </div>
                        <div className="update-user-login-container"></div>
                    </div>
                </div>
            </div>
            { showAccounts && accounts.length > 0 ?
                <div className="item-card__transaction-list" >
                    {accounts.map((account:AccountType) => (
                        <AccountCard account={account} key={`account-card-${account.id}`} />
                    ))}
                </div> : null   
            }
        </div>
    );
}