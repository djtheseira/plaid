const db = require("../");

const createUser = async(username) => {
    const query = {
        text: "INSERT INTO users_table(username) VALUES ($1) RETURNING *;",
        values: [username]
    };
    const {rows:users } = await db.query(query);
    return users[0];
};

const deleteUser = async(userId) => {
    const query = {
        text: "DELETE FROM users_table WHERE id = $1;",
        values: [userId]
    };
    const { rowCount } = await db.query(query);
    return rowCount > 0;
};

const deleteAllUsers = async(userId) => {
    const query = {
        text: "DELETE FROM users_table;"
    };
    const { rowCount } = await db.query(query);
    console.log("rows: ", rowCount);
    return rowCount;
};

const updateUser = async(userId, fullname) => {
    const query = {
        text: "UPDATE users SET fullname = $2 WHERE id = $1;",
        values: [userId, fullname, email]
    };
    await db.query(query);
};

const getUserByUserId = async(userId) => {
    const query = {
        text: "SELECT * FROM users WHERE id = $1;",
        values: [userId]
    };

    const {rows: users} = await db.query(query);
    return users[0];
};

const getUserByUsername = async(username) => {
    const query = {
        text: "SELECT * FROM users WHERE username = $1;",
        values: [username]
    };
    const { rows: users } = await db.query(query);
    return users[0];
};

const getFirstUser = async () => {
    const query = {
        text: "SELECT * FROM users ORDER BY id LIMIT 1;"
    };
    const { rows: users } = await db.query(query);
    return users[0];
}

const getUserCount = async () => {
    const query = {
        text: "SELECT COUNT(*) FROM users;"
    };
    const { rows: users } = await db.query(query);
    return users[0].count;
}

const getUserList = async () => {
    const query = {
        text: "SELECT * FROM users;"
    }

    const { rows: users } = await db.query(query);
    return users;
}

const getItemsAndAccessTokensForUser = async (userId) => {
    const query = {
        text: "SELECT id, plaid_access_token FROM items WHERE user_id = $1;",
        values: [userId]
    };
    const { rows } = await db.query(query);
    return rows;
}

module.exports = {
    createUser, 
    deleteUser,
    deleteAllUsers,
    updateUser,
    getUserByUserId,
    getUserByUsername,
    getFirstUser,
    getUserCount,
    getUserList,
    getItemsAndAccessTokensForUser,
}