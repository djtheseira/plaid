import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    PlaidLinkError, 
    PlaidLinkOnEventMetadata, 
    PlaidLinkOnExitMetadata, 
    PlaidLinkOnSuccessMetadata, 
    PlaidLinkOptionsWithLinkToken, 
    PlaidLinkStableEvent, 
    usePlaidLink
} from "react-plaid-link";

import { logEvent, logSuccess, logExit } from "../util";
import { exchangeToken, setItemState } from "../services/api";
import { useItems, useLink, useErrors } from "../services";

interface Props {
    isOauth?: boolean,
    token: string,
    userId: number;
    itemId?: number | null;
    children?: React.ReactNode;
    updateLoadState?: (isLoading: boolean) => void;
};

export default function LaunchLink(props: Props) {
    const navigate = useNavigate();
    const { getItemsByUser, getItemById } = useItems();
    const { generateLinkToken, deleteLinkToken } = useLink();
    const { setError, resetError } = useErrors();

    const onSuccess = async (
        publicToken: string, metadata: PlaidLinkOnSuccessMetadata
    ) => {
        logSuccess(metadata, props.userId);
        if (props.itemId != null) {
            await setItemState(props.itemId, 'good');
            deleteLinkToken(null, props.itemId);
            getItemById(props.itemId, true);
        } else {
            await exchangeToken(publicToken, metadata.institution, metadata.accounts, props.userId);
            getItemsByUser(props.userId, true);
        }
        resetError();
        deleteLinkToken(props.userId, null);
        navigate(`/user/${props.userId}`);
        if (props.updateLoadState) {
            props.updateLoadState(false);
        }
    };

    const onExit = async (
        error: PlaidLinkError | null,
        metadata: PlaidLinkOnExitMetadata
    ) => {
        logExit(error, metadata, props.userId);
        if (error != null && error.error_code === "INVALID_LINK_TOKEN") {
            generateLinkToken(props.userId, props.itemId);
        } 
        if (error != null) {
            setError(error.error_code, error.display_message || error.error_message);
        }
        if (props.updateLoadState) {
            props.updateLoadState(false);
        }
    };

    const onEvent = async (
        eventName: PlaidLinkStableEvent | string,
        metadata: PlaidLinkOnEventMetadata
    ) => {
        if (eventName === "ERROR" && metadata.error_code != null) {
            setError(metadata.error_code, ' ');
        }
        logEvent(eventName, metadata);
        if (props.updateLoadState) {
            props.updateLoadState(false);
        }
    };

    const config: PlaidLinkOptionsWithLinkToken = {
        onSuccess,
        onEvent,
        onExit,
        token: props.token
    }

    if (props.isOauth) {
        config.receivedRedirectUri = window.location.href;
    }

    const { open, ready } = usePlaidLink(config);

    useEffect(() => {
        if (props.isOauth && ready) {
            open();
        } else if (ready) {
            localStorage.setItem(
                'oauthConfig',
                JSON.stringify({
                    userId: props.userId,
                    itemId: props.itemId,
                    token: props.token,
                })
            );
            open();
        }
    }, [ready, open, props.isOauth, props.userId, props.itemId, props.token]);

    return (<></>);
}