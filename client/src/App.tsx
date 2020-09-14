import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, useHistory, } from "react-router-dom";
import Copyright from './components/appLayout/Copyright';
import AppNavbar from './components/appLayout/AppNavbar';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Snackbar from '@material-ui/core/Snackbar';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Auth Route
import AuthRoute from './AuthRoute';

// Pages
import HomePage from './components/pages/HomePage';
import WelcomePage from './components/pages/WelcomePage';
import LoginPage from './components/auth/LoginPage';
import UserPage from './components/pages/UserPage';
import LocationPage from './components/pages/LocationPage';
import BrandPage from './components/pages/BrandPage';
import ProductPage from './components/pages/ProductPage';
import ShipmentPage from './components/pages/ShipmentPage';
import ShipmentReportPage from './components/pages/ShipmentReportPage';
import StockReportPage from './components/pages/StockReportPage';
import CustomerPage from './components/pages/CustomerPage';
import ActionPage from './components/pages/ActionPage';
import ErrorPage from './components/pages/ErrorPage';

// Style
import './App.css';

// Service
import AuthService from './services/AuthService';

// Enum
import { USER_ROLES, AUTH_ROUTES, NON_AUTH_ROUTES } from './types/enum';

export const AppContext = React.createContext<any>(null);
const AppContextProvider = AppContext.Provider;

// Interface
export interface IAppContextInterface {
  setIsLoading: any,
  userData: object,
  setUserData: any,
  token: string,
  setToken: any,
  captchaData: object,
  setCaptchaData: any,
  setupUserData: any,
  checkIfTokenExpired: any,
  setupUserDataDone: boolean,
  setSetupUserDataDone: any,
  logoutAction: any,
  redirectToWelcome: any,

  handleShowSuccessSnackbar: any,
  handleShowErrorSnackbar: any,
  setSnackbarMessage: any
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const jwt_decode = require('jwt-decode');

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))

const App = () => {
  const classes = useStyles();
  const history = useHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({} as any);
  const [setupUserDataDone, setSetupUserDataDone] = useState(false);
  const [token, setToken] = useState("");
  const [captchaData, setCaptchaData] = useState({} as any);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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

  const redirectToLogin = (history: any) => {
    history.push(NON_AUTH_ROUTES.LOGIN);
  }

  const logout = (e: any) => {
    e.preventDefault();
    AuthService.logOut();
    setUserData({});
    redirectToLogin(history);
  };

  const logoutAction = () => {
    AuthService.logOut();
    setUserData({});
    setSetupUserDataDone(false);
    setSnackbarMessage("Your session has expired!");
    handleShowErrorSnackbar();
  }

  const redirectToWelcome = (history: any) => {
    history.push(AUTH_ROUTES.WELCOME);
  }

  const RECAPTCHA_KEY = "6LevV9wUAAAAAGdiDVHZfiooVPH5A10f0XLW7obF";

  const setupUserData = async () => {
    // Decode token to get user data
    const decoded = jwt_decode(await AuthService.getUserInfo());
    // Set token
    await AuthService.setUserToken(AuthService.getUserInfo());
    // Set current user
    await AuthService.getUserById(decoded.id).then((res: any) => {
      setUserData(res.data);
      console.log("refresh user data...")
      setSetupUserDataDone(true);
    })
  };

  const checkIfTokenExpired = () => {
    if (!AuthService.getUserInfo()) { return true }
    const decoded: any = jwt_decode(AuthService.getUserInfo());
    return decoded.exp < Date.now() / 1000;
  };

  const handleShowSuccessSnackbar = () => {
    setShowSuccessSnackbar(true);
  }

  const handleCloseSuccessSnackbar = () => {
    setShowSuccessSnackbar(false);
  }

  const handleShowErrorSnackbar = () => {
    setShowErrorSnackbar(true);
  }

  const handleCloseErrorSnackbar = () => {
    setShowErrorSnackbar(false);
  }

  const AppContextValue: IAppContextInterface = {
    setIsLoading: setIsLoading,
    userData: userData,
    setUserData: setUserData,
    token: token,
    setToken: setToken,
    captchaData: captchaData,
    setCaptchaData: setCaptchaData,
    setupUserData: setupUserData,
    setSetupUserDataDone: setSetupUserDataDone,
    checkIfTokenExpired: checkIfTokenExpired,
    setupUserDataDone: setupUserDataDone,
    logoutAction: logoutAction,
    redirectToWelcome: redirectToWelcome,

    handleShowSuccessSnackbar: handleShowSuccessSnackbar,
    handleShowErrorSnackbar: handleShowErrorSnackbar,
    setSnackbarMessage: setSnackbarMessage
  };

  return (
    <AppContextProvider value={AppContextValue}>
      <div className="App">
        <div className={classes.root}>
          <CssBaseline />
          {AuthService.getUserInfo() && !checkIfTokenExpired() && (
            <AppNavbar onLogoClick={() => { history.push(AUTH_ROUTES.WELCOME) }} onLogoutClick={logout}
            />
          )}
          <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="lg" className={classes.container}>
              <Switch>
                {/** Login & Register Components */}
                <Route exact path={NON_AUTH_ROUTES.HOME}>
                  <HomePage />
                </Route>
                <Route path={NON_AUTH_ROUTES.LOGIN}>
                  <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
                    <LoginPage />
                  </GoogleReCaptchaProvider>
                </Route>
                <AuthRoute path={AUTH_ROUTES.WELCOME} Component={HomePage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN), String(USER_ROLES.NON_ADMIN)]}></AuthRoute>
                <AuthRoute path={AUTH_ROUTES.USER} Component={UserPage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN)]}></AuthRoute>
                <AuthRoute path={AUTH_ROUTES.LOCATION} Component={LocationPage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN)]}></AuthRoute>
                <AuthRoute path={AUTH_ROUTES.BRAND} Component={BrandPage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN)]}></AuthRoute>
                <AuthRoute path={AUTH_ROUTES.CUSTOMER} Component={CustomerPage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN)]}></AuthRoute>
                <AuthRoute path={AUTH_ROUTES.ACTION} Component={ActionPage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN)]}></AuthRoute>
                <AuthRoute path={AUTH_ROUTES.PRODUCT} Component={ProductPage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN)]}></AuthRoute>
                <AuthRoute path={AUTH_ROUTES.SHIPMENT} Component={ShipmentPage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN), String(USER_ROLES.NON_ADMIN)]}></AuthRoute>
                <AuthRoute path={AUTH_ROUTES.SHIPMENT_REPORT} Component={ShipmentReportPage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN)]}></AuthRoute>
                <AuthRoute path={AUTH_ROUTES.STOCK_REPORT} Component={StockReportPage} requiredRoles={[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN)]}></AuthRoute>
                <Route>
                  <ErrorPage />
                </Route>
              </Switch>
              <Box pt={4}>
                <Copyright />
              </Box>
            </Container>
          </main>
        </div>
      </div>
      <Snackbar open={showSuccessSnackbar} autoHideDuration={3000} onClose={handleCloseSuccessSnackbar}>
        <Alert onClose={handleCloseSuccessSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={showErrorSnackbar} autoHideDuration={6000} onClose={handleCloseErrorSnackbar}>
        <Alert onClose={handleCloseErrorSnackbar} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </AppContextProvider>
  );
};

export default App;
