import React from "react";

interface Props {
    institutionName: string | undefined;
}

export default function DuplicateItemToastMessage(props: Props) {
    return (
        <>
            <div>{`${props.institutionName} already linked.`}</div>
            <a
                className="toast__link"
                href="https://github.com/plaid/pattern/tree/master/server#preventing-item-duplication"
                target="_blank"
                rel="noopener noreferrer"
            >
                Click here
            </a>{" "}
            for more info.
        </>
    );
}
