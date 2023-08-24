import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';

import { UserPage, Landing, OAuthLink, Sockets } from "./components";

import { AccountsProvider } from "./services/accounts";
import { InstitutionsProvider } from "./services/institutions";
import { ItemsProvider } from "./services/items";
import { LinkProvider } from "./services/link";
import { TransactionProvider } from "./services/transactions";
import { UsersProvider } from "./services/users";
import { CurrentUserProvider } from "./services/currentUser";
import { ErrorsProvider } from "./services/errors";


import './App.css';

function App() {
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
                                            <Sockets/>
                                            <Switch>
                                                <Route exact path="/" component={Landing} />
                                                <Route path="/user/:userId" component={UserPage} />
                                                <Route path="/oauth-link" component={OAuthLink} />
                                                <Route path="/admin" component={Landing} />
                                            </Switch>
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

export default withRouter(App);
