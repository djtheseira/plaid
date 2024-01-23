import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountType, ItemType, TransactionType } from "./types";
import { useAccounts, useItems, useTransactions } from "../services";
import { filter, map } from "lodash";
import { currencyFilter, formatDate, humanReadableCategory } from "../util";
import DataTable, { TableColumn } from 'react-data-table-component';

interface Props {

}

export default function TransactionsPage(props: Props) {
    const params = useParams();
    const userId = Number(params.userId);
    const isFirstLoad = useRef(true);
    const [accounts, setAccounts] = useState<AccountType[]>([]);
    const [items, setItems] = useState<ItemType[]>([]);
    const [transactions, setTransactions] = useState([]);
    const { accountsByUser, getAccountsByUser } = useAccounts();
    const { itemsByUser, getItemsByUser } = useItems();
    const { getTransactionsByUser, transactionsByUser } = useTransactions();
    const [ selectedAccountIds, setSelectedAccountIds ] = useState<number[]>([]);

    useEffect(() => {
        getItemsByUser(userId, false);
    }, [getItemsByUser, userId]);

    useEffect(() => {
        setItems(itemsByUser[userId]);
    }, [itemsByUser, userId])

    useEffect(() => {
        getAccountsByUser(userId);
    }, [getAccountsByUser, userId]);

    useEffect(() => {
        setAccounts(accountsByUser[userId]);
    }, [accountsByUser, userId]);

    useEffect(() => {
        getTransactionsByUser(userId);
    }, [getTransactionsByUser, userId]);

    useEffect(() => {
        setTransactions(transactionsByUser[userId]);
    }, [transactionsByUser, userId]);

    useEffect(() => {
        if (accounts && accounts.length > 0 && isFirstLoad.current) {
            isFirstLoad.current = false;
            setSelectedAccountIds(map(accounts, ((account:AccountType) => account.id)))
        }
    }, [accounts])

    const dataTableColumns: TableColumn<TransactionType>[] = [{
        name: 'Name',
        selector: row => row.merchant_name,
    }, {
        name: 'Bank',
        selector: row => row.institution_name??"",
    }, {
        name: 'Category',
        selector: row => humanReadableCategory(row.category),
    }, {
        name: 'Amount',
        selector: row => currencyFilter(row.amount),
    }, {
        name: 'Date',
        selector: row => formatDate(row.transaction_date),
    }]

    // useEffect(() => {

    // }, [selectedAccountIds]);

    const onAccountSelectionChangeHandler = useCallback((e:FormEvent<HTMLInputElement>) => {
        const value = Number(e.currentTarget.value);
        if (e.currentTarget.checked && selectedAccountIds.indexOf(value) === -1) {
            setSelectedAccountIds([...selectedAccountIds, value]);
        } else {
            setSelectedAccountIds(filter(selectedAccountIds, ((accountId) => {return value !== accountId;})));
        }
    }, [selectedAccountIds]);

    return (
        <div className="user-page-container-section mt-5" id="transactions-container" >
            <div >
                <div className={`d-flex flex-row`}>
                    <h5 className="fw-semibold">View Transactions</h5>
                </div>
                <div className="row" >
                    <div className="col-12" >
                        {items && items.length > 0 && accounts && accounts.length > 0 ? 
                            <>
                                <p className="text-decoration-underline fs-sm">Accounts</p>
                                { items.map((item : ItemType) => {
                                    return (
                                        <div className="transactions-item-account-list" key={`item-account-list-${item.id}`} >
                                            <span className="fs-md fw-semibold">{item.institution_name}</span>
                                            <div id="accounts-list" className="ms-3" >
                                                { accounts.map((account : AccountType) => {
                                                    return (
                                                        <div className="transactions-account-card" key={`account-card-${account.id}`}>
                                                            <input id={`account-input-${account.id}`} type="checkbox" value={account.id} defaultChecked onChange={onAccountSelectionChangeHandler} />
                                                            <label className="align-middle ms-2" id={`account-label-${account.id}`} htmlFor={`account-input-${account.id}`} >{account.name}</label>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })
                                }
                            </> : null
                        }
                    </div>
                </div>
                <hr/>
                <div className="row">
                    <div className="col-12">
                        <div id="transactions-list">
                            {/* <div className="transaction-card" >
                                <div className="row text-decoration-underline">
                                    <span className="col-3" >Name</span>
                                    <span className="col-3" >Category</span>
                                    <span className="col-3 text-center " >Amount</span>
                                    <span className="col-3 text-center " >Date</span>
                                </div>
                            </div>
                            { !transactions || transactions.length === 0 ?
                                <div className="transaction-card text-center" >No results</div> : null
                            } */}
                            { transactions && transactions.length > 0 ? 
                                <DataTable data={transactions} columns={dataTableColumns} /> : null
                                // transactions.map((transaction: TransactionType) => {
                                //     return (
                                //         <div className="transaction-card" key={`transaction-card-${transaction.id}`} >
                                //             <div  className="row">
                                //                 <span className="col-3 transaction-column" >{humanReadableCategory(transaction.merchant_name)}</span>
                                //                 <span className="col-3 transaction-column" >{humanReadableCategory(transaction.category.replace(transaction.category_type, ''))}</span>
                                //                 <span className="col-3 transaction-column text-center" >{currencyFilter(transaction.amount)}</span>
                                //                 <span className="col-3 transaction-column" >{formatDate(transaction.transaction_date)}</span>
                                //             </div>
                                //         </div>
                                //     )
                                // }): null
                            }
                            
                        </div> 
                    </div>
                </div>
            </div>
        </div>
    )
}