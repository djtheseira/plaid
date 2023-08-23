import React from "react";

interface Props {
    children?: React.ReactNode;
    subheader?: string;
}

export default function Banner(props: Props) {
    return (
        <div className="pb-5" id="banner-container" >
            <div className="col-12 text-center">
                <h1 className="fw-semibold">Donovan's Financials</h1>
                <h3 >{props.subheader}</h3>
            </div>
        </div>
    )
}