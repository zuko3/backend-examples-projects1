import React from "react";
import { history } from "../common";

export function Header({ authData }) {
    return (
        <header className="w3-container w3-center w3-padding-32">
            <h1><BackToHome authData={authData} /><b>Tourist Guide</b></h1>
            <p>Welcome to the places of <span className="w3-tag">unknown</span></p>
        </header>
    )
}

function handleGoToHome() {
    history.push("/");
}

function BackToHome({ authData }) {
    const { pathname } = window.location;
    if (pathname === "/") {
        return null
    }
    return <i onClick={handleGoToHome} title="back to home" className="fa fa-arrow-circle-o-left" style={{ marginRight: '1rem', cursor: 'pointer' }} />;
}