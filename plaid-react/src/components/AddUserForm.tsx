import React, {useState, useEffect} from "react";
import {Button, FormControl} from "react-bootstrap";
import TextInput from "plaid-threads/TextInput";
import { useCurrentUser, useUsers } from "../services";

interface Props {
    hideForm: () => void;
}

const AddUserForm = (props: Props) => {
    const [username, setUsername] = useState('');

    const { addNewUser, getUsers} = useUsers();
    const { setNewUser } = useCurrentUser();

    const handleSubmit = async(e: any) => {
        e.preventDefault();
        await addNewUser(username);
        setNewUser(username);
        props.hideForm();
    }

    useEffect( () => {
        getUsers(true); 
    }, [addNewUser, getUsers]);

    return (
        
        <div className="addUserForm landing-page-container-section" >
            <form onSubmit={handleSubmit} >
                <div className="add-user__card card_container d-flex flex-column p-4" >
                    <div className="add-user__col1 mb-3" >
                        <h5>Add new user</h5>
                    </div>
                    <div className="d-flex flex-row row add_user__form-input align-items-center">
                        <div className="add-user__col2 my-3 col-6" >
                            <FormControl as="input" id="new-username-input" name="username" 
                                value={username} onChange={e => setUsername(e.target.value)}
                                placeholder="New user name"
                            />
                        </div>
                        <div className="col-6">
                            <div className="add-user__button_group d-flex gap-3" >
                                <Button className="add-user__button" type="submit">
                                    Add User
                                </Button>
                                <Button 
                                    className="add-user__button"
                                    type="button"
                                    onClick={props.hideForm}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddUserForm;