-- Create Database

-- CREATE USER docker;
-- CREATE DATABASE plaiddb
-- GRANT ALL PRIVILEGES ON DATABASE docker TO docker;

-- This trigger updates the value in the updated_at column. It is used in the tables below to log
-- when a row was last updated.

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- USERS
-- This table is used to store the users of our application. The view returns the same data as the
-- table, we're just creating it to follow the pattern used in other tables.

CREATE TABLE users_table
(
    id SERIAL PRIMARY KEY,
    username text UNIQUE NOT NULL,
    -- password varchar NOT NULL,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TRIGGER users_updated_at_timestamp
BEFORE UPDATE ON users_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE VIEW users
AS
    SELECT
        id,
        username,
        created_at,
        updated_at
    FROM
        users_table;


-- ITEMS
-- This table is used to store the items associated with each user. The view returns the same data
-- as the table, we're just using both to maintain consistency with our other tables. For more info
-- on the Plaid Item schema, see the docs page: https://plaid.com/docs/#item-schema

CREATE TABLE items_table
(
    id SERIAL PRIMARY KEY, 
    user_id integer REFERENCES users_table(id) ON DELETE CASCADE,
    plaid_access_token text UNIQUE NOT NULL,
    plaid_item_id text UNIQUE NOT NULL,
    plaid_institution_id text NOT NULL,
    institution_name text,
    transaction_cursor text,
    status text NOT NULL,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TRIGGER items_updated_at_timestamp
BEFORE UPDATE ON items_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE VIEW items
AS
    SELECT
        id,
        user_id,
        plaid_access_token,
        plaid_item_id,
        plaid_institution_id,
        institution_name,
        transaction_cursor,
        status,
        created_at,
        updated_at
    FROM
        items_table;


-- ACCOUNTS
-- This table is used to store the accounts associated with each item. The view returns all the
-- data from the accounts table and some data from the items view. For more info on the Plaid
-- Accounts schema, see the docs page:  https://plaid.com/docs/#account-schema

CREATE TABLE accounts_table
(
    id SERIAL PRIMARY KEY,
    item_id integer REFERENCES items_table(id) ON DELETE CASCADE,
    plaid_account_id text UNIQUE NOT NULL,
    name text NOT NULL,
    mask text NOT NULL,
    official_name text,
    current_balance numeric(28,10),
    available_balance numeric(28,10),
    iso_currency_code text,
    unofficial_currency_code text,
    type text NOT NULL,
    subtype text NOT NULL,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TRIGGER accounts_updated_at_timestamp
BEFORE UPDATE ON accounts_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE VIEW accounts
AS
    SELECT
        a.id,
        a.plaid_account_id,
        a.item_id,
        i.plaid_item_id,
        i.institution_name,
        i.user_id,
        a.name,
        a.mask,
        a.official_name,
        a.current_balance,
        a.available_balance,
        a.iso_currency_code,
        a.unofficial_currency_code,
        a.type,
        a.subtype,
        a.created_at,
        a.updated_at
    FROM
        accounts_table a
    LEFT JOIN items i on i.id = a.item_id;

-- TRANSACTIONS
-- This table is used to store the transactions associated with each account and item.
-- The view returns all the data from the transactions table.

CREATE TABLE transactions_table
(
  id SERIAL PRIMARY KEY,
    account_id integer REFERENCES accounts_table(id) ON DELETE CASCADE,
    plaid_transaction_id text UNIQUE NOT NULL,
    category_type text,
    category text,
    amount numeric(28,10),
    iso_currency_code text,
    is_removed boolean,
    is_pending boolean,
    merchant_name text,
    transaction_date date,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TRIGGER transactions_updated_at_timestamp
BEFORE UPDATE ON transactions_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE VIEW transactions
AS
    SELECT
        t.id,
        t.plaid_transaction_id,
        t.account_id,
        a.plaid_account_id,
        a.item_id,
        a.plaid_item_id,
        a.institution_name,
        a.name as "account_name",
        a.user_id,
        t.category_type,
        t.category,
        t.amount,
        t.iso_currency_code,
        t.is_removed,
        t.is_pending,
        t.merchant_name,
        t.transaction_date,
        t.created_at,
        t.updated_at
    FROM
    transactions_table t
    LEFT JOIN accounts a ON a.id = t.account_id;

-- The link_events_table is used to log responses from the Plaid API for client requests to the
-- Plaid Link client. This information is useful for troubleshooting.

CREATE TABLE link_events_table
(
    id SERIAL PRIMARY KEY,
    type text NOT NULL,
    user_id integer,
    link_session_id text,
    request_id text,
    error_type text,
    error_code text,
    status text,
    created_at timestamptz default now()
);


-- The plaid_api_events_table is used to log responses from the Plaid API for server requests to
-- the Plaid client. This information is useful for troubleshooting.

CREATE TABLE plaid_api_events_table
(
    id SERIAL PRIMARY KEY,
    item_id integer,
    user_id integer,
    plaid_method text NOT NULL,
    arguments text,
    request_id text UNIQUE,
    error_type text,
    error_code text,
    created_at timestamptz default now()
);

CREATE TABLE plaid_categories_table_complete
(
    id SERIAL PRIMARY KEY,
    category_type text,
    category text,
    description text,
    created_at timestamptz default now()
);

CREATE TABLE plaid_category_types_table
(
    id SERIAL PRIMARY KEY,
    category_type text,
    created_at timestamptz default now()
);

CREATE TABLE plaid_categories_table
(
    id SERIAL PRIMARY KEY,
    category_type_id integer REFERENCES plaid_category_types_table(id) ON DELETE CASCADE,
    category text,
    description text,
    created_at timestamptz default now()
);

CREATE VIEW plaid_categories
AS
    SELECT
        c.id as "category_id",
        ct.id as "category_type_id",
        replace(category, category_type || '_', '') as "category",
        ct.category_type,
        c.created_at
    FROM
        plaid_categories_table c
    JOIN plaid_category_types_table ct ON c.category_type_id = ct.id;

COPY plaid_categories_table_complete(category_type, category, description)
FROM '/docker-entrypoint-initdb.d/transactions-personal-finance-category-taxonomy.csv'
DELIMITER ','
CSV HEADER;

INSERT INTO plaid_category_types_table(category_type)
SELECT DISTINCT (category_type) FROM plaid_categories_table_complete ;

INSERT INTO plaid_categories_table(category_type_id, category, description)
SELECT pctt.id, pctc.category, pctc.description
FROM plaid_category_types_table pctt
JOIN plaid_categories_table_complete pctc on pctt.category_type  = pctc.category_type;

DROP TABLE plaid_categories_table_complete;

CREATE TABLE budgets_table
(
    id SERIAL PRIMARY KEY,
    user_id integer,
    category_id integer REFERENCES plaid_categories_table(id),
    allocated_amount numeric(28,10),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE UNIQUE INDEX ON budgets_table(user_id, category_id);

CREATE TRIGGER budgets_updated_at_timestamp
BEFORE UPDATE ON budgets_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE VIEW budgets
AS
    SELECT
        b.id,
        b.user_id,
        pc.category_type_id,
        pc.category_id,
        pc.category_type,
        pc.category,
        b.allocated_amount,
        b.created_at,
        b.updated_at
    FROM
    budgets_table b
    LEFT JOIN plaid_categories pc ON pc.category_id = b.category_id;