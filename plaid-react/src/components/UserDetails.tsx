import React from "react";
import { UserType } from "./types";
import { formatDate } from "../util";

interface Props {
    user: UserType;
    itemCount?: number | null;
}

export default function UserDetails(props: Props) {
    return (
        <>
            <div className="user-card-headers_titles" >
                <p className="text-decoration-underline">User Name</p>
                <p>{props.user.username}</p>
            </div>
            <div className="user-card-headers_titles" >
                <p className="text-decoration-underline">Created On</p>
                <p>{formatDate(props.user.created_at)}</p>
            </div>
            <div className="user-card-headers_titles" >
                <p className="text-decoration-underline">Number of Banks Connected</p>
                <p>{props.itemCount} {props.itemCount === 1 ? "bank": "banks"}</p>
            </div>
        </>
    );
}