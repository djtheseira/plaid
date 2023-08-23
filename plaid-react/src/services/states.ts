import { UserType } from '../components/types';

export interface UsersState {
    [key: string]: UserType | any;
}

export interface CurrentUserState {
    currentUser: UserType;
    newUser: string | null;
}