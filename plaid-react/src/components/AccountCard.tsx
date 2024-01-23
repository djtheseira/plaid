import React, { useEffect, useState } from "react";
import { AccountType, TransactionType } from "./types";
import { currencyFilter, formatDate, humanReadableCategory } from "../util";
import { Button } from "react-bootstrap";
import { useTransactions } from "../services";

interface Props {
    account: AccountType;
}

export default function AccountCard(props: Props) {
    const { id, name, current_balance, available_balance, subtype } = props.account;
    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const [showTransactions, setShowTransactions] = useState(false);

    const { transactionsByAccount, getTransactionsByAccount } = useTransactions();

    useEffect(() => {
        getTransactionsByAccount(id);
    }, [getTransactionsByAccount, transactionsByAccount, id]);

    useEffect(() => {
        setTransactions(transactionsByAccount[id] || []);
        console.log("transaction: ", transactionsByAccount);
    }, [transactionsByAccount, id]);

    const showHideTransactionButtonHandler = () => {
        setShowTransactions(!showTransactions);
    }

    return (
        <div className="account-card">
            <div className="account-details-container d-flex flex-row justify-content-between align-items-center" >
                <div className="account-card__details" >
                    <p className="account-card__details__account-name mb-0">{name}</p>
                    <div className="account-card__details__type-amount fs-xxs" >
                        <p className="account-card__details__type-amount__type d-inline-block mb-0" >{humanReadableCategory(subtype)}</p>
                        <p className="account-card__details__type-amount__amount d-inline-block mb-0" >{currencyFilter(current_balance || available_balance )}</p>
                    </div>
                </div>
                {/* <div className="account-card__view-transactions btn-container" >
                    <Button className="py-2" onClick={ showHideTransactionButtonHandler } >{showTransactions && transactions.length > 0 ? "Hide" : "Show" } monthly transactions</Button>
                </div> */}
            </div>
            {/* { showTransactions && transactions.length > 0 ? 
                <div className="account-card__transactions">
                    <div className="transaction-card" >
                            <div className="row text-decoration-underline">
                                <span className="col-3" >Name</span>
                                <span className="col-3" >Category</span>
                                <span className="col-3" >Amount</span>
                                <span className="col-3" >Date</span>
                            </div>
                        </div>
                    {transactions.map((transaction:TransactionType) => (
                        <div className="transaction-card" key={`transaction-card-${transaction.id}`} >
                            <div  className="row">
                                <span className="col-3 transaction-column" >{humanReadableCategory(transaction.merchant_name)}</span>
                                <span className="col-3 transaction-column" >{humanReadableCategory(transaction.category.replace(transaction.category_type, ''))}</span>
                                <span className="col-3 transaction-column" >{currencyFilter(transaction.amount)}</span>
                                <span className="col-3 transaction-column" >{formatDate(transaction.transaction_date)}</span>
                            </div>
                        </div>
                    ))}
                </div> : null
            } */}
        </div>
    )
} 