export interface CategoryType {
    id: number;
    category_type: string;
    created_at: string;
}

export interface Category {
    category_id: number;
    category_type_id: number;
    category: string;
    category_type: string;
    created_at: string;
}

export interface BudgetType {
    id: number;
    user_id: number;
    category_id: number;
    category: string;
    category_type_id: number;
    category_type?: string;
    allocated_amount: number;
    created_at?: string;
    updated_at?: string;
    hide_locally: boolean;
}

export interface RouteInfo {
    userId: string;
}

export interface ItemType {
    id: number;
    user_id: number;
    plaid_access_token: string;
    plaid_item_id: string;
    plaid_institution_id: string;
    institution_name: string;
    transaction_cursor: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface AccountType {
    id: number;
    item_id: number;
    user_id: number;
    plaid_item_id: string;
    plaid_account_id: string;
    name: string;
    mask: string;
    official_name: string;
    current_balance: number;
    available_balance: number;
    iso_currency_code: string;
    unofficial_currency_code: string;
    type: 'depository' | 'investment' | 'loan' | 'credit';
    subtype:
        | 'checking'
        | 'savings'
        | 'cd'
        | 'money market'
        | 'ira'
        | '401k'
        | 'student'
        | 'mortgage'
        | 'credit card';
    created_at: string;
    updated_at: string;
}

export interface TransactionType {
    id: number;
    account_id: number;
    plaid_transaction_id: string;
    plaid_account_id: string;
    item_id: number;
    plaid_item_id: string;
    user_id: number;
    amount: number;
    category: string;
    category_type: string;
    merchant_name: string; //merchant_name
    iso_currency_code: string;
    is_removed: boolean;
    is_pending: boolean;
    transaction_date: string;
    created_at: string;
    updated_at: string;
}

export interface TransactionSumType {
    sum: number;
    category_type: string;
}

export interface VendorType {
    sum: number;
    merchant_name: string;
}

export interface UserType {
    id: number;
    username: string | null;
    created_at: string;
    updated_at: string;
}