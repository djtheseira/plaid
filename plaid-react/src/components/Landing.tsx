import { Button } from 'react-bootstrap';
import React, { SyntheticEvent, useCallback, useEffect } from "react";
import { useCurrentUser, useUsers } from "../services";
import { getUsersCount } from "../services/api";
import { useBoolean } from "../hooks";
import { useNavigate } from "react-router-dom";
import { 
    AddUserForm,
    Banner, 
    // ItemCard,
    // SpendingInsights,
} from ".";

export default function Landing() {
    const { userState, setCurrentUser} = useCurrentUser();
    const {usersById} = useUsers();
    const [isAdding, hideForm, toggleForm] = useBoolean(usersById != null && Object.keys(usersById).length > 0);
    const navigate = useNavigate();

    useEffect(() => {
        const getUserCount = async () => {
            const userCount = await getUsersCount();

            if (userCount.status === 200) {
                // console.log("test: ", userCount.data.userCount);
                toggleForm(userCount.data.userCount > 0);
            }
        };
        getUserCount().catch(console.error);
    }, [toggleForm]);

    useEffect(() => {
        if (userState.newUser != null) {
            setCurrentUser(userState.newUser);
        }
    }, [setCurrentUser, userState.newUser]);

    const returnToCurrentUser = () => {
        navigate(`/user/${userState.currentUser.id}`);
    }


    const selectExistingUserEvent = useCallback((username:string) => {
        setCurrentUser(username);
    }, [setCurrentUser]);

    return (
        <div className="container" id="landing-container">
            <Banner >Donovan's Financials</Banner>
            { usersById != null && Object.keys(usersById).length > 0 ? (
                <div className="landing-page-container-section">
                { 
                    Object.keys(usersById).map((userById:string) => {
                        const user = usersById[userById];
                        const handleButtonClick = (e:SyntheticEvent) => {
                            selectExistingUserEvent(user.username)
                        }

                        return (
                            <div onClick={handleButtonClick} key={`userId-${userById}`} role="button" className="landing-user-info-card card_container d-flex flex-row p-4">
                                <p className="landing-user-name mb-0">{user.username}</p>
                                <input type="hidden" value={user.username} name="existing-user-name" />
                            </div>
                        )
                    })
                }
                </div>
            ) : null }
            <div className="btn-container landing-page-container-section">
                {userState.currentUser.username != null ? (
                    <Button 
                        className="btn d-block mb-3"
                        onClick={returnToCurrentUser}
                    >
                        Return To User <span className="fst-italic">{userState.currentUser.username}</span>
                    </Button>
                ) : null }
                <Button className="btn" onClick={toggleForm} >
                    <span className="pe-3">Create Account</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-chevron-down ${isAdding ? "active" : ""}`} viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </Button>
            </div>
            {isAdding ? <AddUserForm hideForm={hideForm} /> : null}
        </div>
    )
};