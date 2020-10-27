import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from "react-router-dom";
import { AppContext } from '../../App';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

// Recaptcha
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Enum
import { AUTH_ROUTES } from '../../types/enum';

// Service
import AuthService from '../../services/AuthService';

const jwt_decode = require('jwt-decode');

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const LoginPage = () => {
    const classes = useStyles();
    const history = useHistory();

    const { executeRecaptcha } = useGoogleReCaptcha();

    const {
        setIsLoading,
        loginData,
        setLoginData,
        token,
        setToken,
        captchaData,
        setCaptchaData,
        setupLoginData,
        redirectToWelcome
    } = useContext(AppContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (AuthService.getUserInfo()) {
            redirectToWelcome(history)
        }
    }, []);

    const handleChangeEmail = (e: any) => {
        setEmail(e.currentTarget.value)

        if (emailError) {
            setEmailError(false)
            setPasswordError(false)
            setErrorMessage("")
        }
    };

    const handleChangePassword = (e: any) => {
        setPassword(e.currentTarget.value)

        if (passwordError) {
            setEmailError(false)
            setPasswordError(false)
            setErrorMessage("")
        }
    };

    const login = async (e: any) => {
        e.preventDefault();

        // if (!executeRecaptcha) {
        //     return;
        // }

        if (email === "" || password === "") {
            setEmailError(true)
            setPasswordError(true)

            setErrorMessage('Email or Password cannot be empty!')

            return;
        }

        setIsLoading(true);

        // const result = await executeRecaptcha("login");

        // setToken(result);

        // verify request
        // const dataToken = { token: result }

        // AuthService.verifyCaptcha(dataToken).then((res: any) => {
        //     setCaptchaData(res.data);
        //     if (res.data && res.data.success) {
        const credentials = { email: email, password: password };
        // if (res.data.score > 0.5) {
        AuthService.login(credentials).then((res: any) => {
            if (res.data.user) {
                localStorage.setItem("userInfo", JSON.stringify(res.data.token));

                AuthService.setUserToken(res.data.token);

                // Set current user
                setupLoginData();
                history.push(AUTH_ROUTES.WELCOME);
            } else {
                setEmailError(true)
                setPasswordError(true)
                if (!res.data.success) {
                    setErrorMessage(res.data.msg);
                } else {
                    setErrorMessage("Email or Password is incorrect!");
                }
                setIsLoading(false);
            }
        }, (error: any) => {
            setErrorMessage("Internal error during user login!");
        });
        //         } else {
        //             setEmailError(true);
        //             setPasswordError(true);
        //             setErrorMessage("You are not HUMAN!");

        //             setIsLoading(false);
        //         }
        //     }
        // }, (error: any) => {
        //     setErrorMessage("Internal error during user login!");
        // });
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    {"Sign in"}
                </Typography>
                <form className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={handleChangeEmail}
                        error={emailError}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={handleChangePassword}
                        error={passwordError}
                        helperText={errorMessage}
                    />
                    {/* <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    /> */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={login}
                    >
                        {"Sign In"}
                    </Button>
                    {/* <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                                {"Forgot password?"}
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="#" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid> */}
                </form>
            </div>
        </Container>
    );
}

export default LoginPage;
