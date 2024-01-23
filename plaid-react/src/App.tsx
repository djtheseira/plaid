import React from "react";
import { Route, Routes, useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';

import { BudgetSettingsPage, BudgetPage, UserPage, Landing, OAuthLink, Sockets, InfoPage, TransactionsPage } from "./components";
import { AccountsProvider } from "./services/accounts";
import { InstitutionsProvider } from "./services/institutions";
import { ItemsProvider } from "./services/items";
import { LinkProvider } from "./services/link";
import { TransactionProvider } from "./services/transactions";
import { UsersProvider } from "./services/users";
import { CurrentUserProvider } from "./services/currentUser";
import { ErrorsProvider } from "./services/errors";
import { BudgetProvider } from "./services/budget";


import './App.css';

function App() {
    const mainRoutes = {
        path: '/',
        element: <Landing />,
    }
    const oAuthRoutes = {
        path: "oauth-link", 
        element: <OAuthLink />,
    }
    const userRoutes = {
        path: "/user",
        element: <UserPage />,
        children: [
            {path: ":userId", element: <InfoPage />},
            {path: ":userId/budget", element: <BudgetPage />},
            {path: ":userId/budget-settings", element: <BudgetSettingsPage />},
            {path: ":userId/transactions", element: <TransactionsPage />}
        ],
    }

    const routing = useRoutes([mainRoutes, oAuthRoutes, userRoutes]);
    return (
        <div className="App">
            <ToastContainer
                autoClose={8000}
                draggable={false}
            />
            <InstitutionsProvider>
                <ItemsProvider>
                    <LinkProvider>
                        <AccountsProvider>
                            <TransactionProvider>
                                <ErrorsProvider>
                                    <UsersProvider>
                                        <CurrentUserProvider>
                                            <BudgetProvider>
                                                <Sockets/>
                                                <>{routing}</>   
                                                {/* <Routes>
                                                    <Route path="/" element={<Landing />} />
                                                    <Route path="/user/:userId" element={<UserPage/>} />
                                                    <Route path="/user/:userId/budget" element={<BudgetPage/>} />
                                                    <Route path="/oauth-link" element={<OAuthLink/>} />
                                                </Routes> */}
                                            </BudgetProvider>
                                        </CurrentUserProvider>
                                    </UsersProvider>
                                </ErrorsProvider>
                            </TransactionProvider>
                        </AccountsProvider>
                    </LinkProvider>
                </ItemsProvider>
            </InstitutionsProvider>
        </div>
    );
}

export default App;
