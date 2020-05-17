import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';

const WelcomePage = (props: any) => {
    const {
        setIsLoading
    } = useContext(AppContext);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    return (
        <>
            <h1>{"WELCOME"}</h1>
        </>
    );
}

export default WelcomePage;
