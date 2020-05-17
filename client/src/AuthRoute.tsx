import React, { useState, useEffect, useContext } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { BrowserRouter, Switch, Route, Redirect, useHistory, } from "react-router-dom";
import { AppContext } from './App';

// Service
import AuthService from './services/AuthService';

interface IAuthRoute {
    Component: React.FC<RouteComponentProps>
    path: string;
    exact?: boolean;
    requiredRoles: any[]
}

const AuthRoute = ({ Component, path, exact = false, requiredRoles }: IAuthRoute): JSX.Element => {
    const {
        userData,
        setupUserData,
        setupUserDataDone,
        setSetupUserDataDone,
        checkIfTokenExpired,
        logoutAction
    } = useContext(AppContext);

    useEffect(() => {
        if (AuthService.getUserInfo()) {
            if (checkIfTokenExpired()) {
                logoutAction();
            } else {
                setupUserData();
            }
        } else {
            setSetupUserDataDone(true);
        }
    }, []);

    return (
        <>
            {setupUserDataDone && (
                <Route
                    exact={exact}
                    path={path}
                    render={(props: RouteComponentProps) => {
                        return AuthService.getUserInfo() && !checkIfTokenExpired() && requiredRoles.includes(userData.role) ?
                            (<Component {...props}></Component>)
                            :
                            (<Redirect to={{ pathname: AuthService.getUserInfo() && !checkIfTokenExpired() ? "/welcome" : "/login" }}></Redirect>)
                    }

                    }
                ></Route>
            )}
        </>
    )
}

export default AuthRoute;