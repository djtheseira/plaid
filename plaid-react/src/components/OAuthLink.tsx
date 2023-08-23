import React, { useState, useEffect } from "react";

import { LaunchLink } from ".";

export default function OAuthLink() {
    const [token, setToken] = useState<string>();
    const [userId, setUserId] = useState<number>(-100);
    const [itemId, setItemId] = useState<number>();

    const oauthObject = localStorage.getItem('oauthConfig');

    useEffect( () => {
        if (oauthObject != null) {
            const oauthJSON = JSON.parse(oauthObject);
            setUserId(oauthJSON.userId);
            setItemId(oauthJSON.itemId);
            setToken(oauthJSON.token);
        }
    }, [oauthObject]);

    return (
        <>
            { token != null ? 
                <LaunchLink 
                    isOauth
                    userId={userId}
                    itemId={itemId}
                    token={token}
                /> : null
            }
        </>
    )
}