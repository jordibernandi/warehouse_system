import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, useHistory, } from "react-router-dom";
import Copyright from './components/appLayout/Copyright';
import AppNavbar from './components/appLayout/AppNavbar';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Pages
import LoginPage from './components/auth/LoginPage';
import UserPage from './components/pages/UserPage';
import CompanyPage from './components/pages/CompanyPage';
import LocationPage from './components/pages/LocationPage';
import BrandPage from './components/pages/BrandPage';
import ProductPage from './components/pages/ProductPage';
import ShipmentPage from './components/pages/ShipmentPage';
import ShipmentReportPage from './components/pages/ShipmentReportPage';
import StockReportPage from './components/pages/StockReportPage';
import CustomerPage from './components/pages/CustomerPage';
import ActionPage from './components/pages/ActionPage';

// Style
import './App.css';

// Service
import AuthService from './services/AuthService';

export const AppContext = React.createContext<any>(null);
const AppContextProvider = AppContext.Provider;

// Interface
export interface IAppContextInterface {
  userData: object,
  setUserData: any,
  token: string,
  setToken: any,
  captchaData: object,
  setCaptchaData: any,
  setupUserData: any,

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
}))

const App = () => {
  const classes = useStyles();
  const history = useHistory();

  const [userData, setUserData] = useState({} as any);
  const [token, setToken] = useState("");
  const [captchaData, setCaptchaData] = useState({} as any);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const redirectToLogin = (history: any) => {
    history.push('/login');
  }

  const logout = (e: any) => {
    e.preventDefault();
    logoutAction();
  };

  const logoutAction = () => {
    AuthService.logOut();
    setUserData({});
    redirectToLogin(history);
  };

  useEffect(() => {
    /**
     * Check user authentication whenever user navigates the page
     * if is not authenticated, user is redirected to login page
     */
    if (AuthService.getUserInfo()) {
      if (checkIfTokenExpired()) {
        logoutAction();
      } else {
        setupUserData();
        window.scrollTo(0, 0);
      }
    }
    else {
      redirectToLogin(history);
    }
  }, []);

  const RECAPTCHA_KEY = "6LevV9wUAAAAAGdiDVHZfiooVPH5A10f0XLW7obF";

  const checkIfTokenExpired = () => {
    if (!AuthService.getUserInfo()) { return true }
    const decoded: any = jwt_decode(AuthService.getUserInfo());
    return decoded.exp < Date.now() / 1000;
  };

  const setupUserData = () => {
    // Decode token to get user data
    const decoded = jwt_decode(AuthService.getUserInfo());
    // Set token
    AuthService.setUserToken(AuthService.getUserInfo());
    // Set current user
    AuthService.getUserById(decoded.id).then((res: any) => {
      setUserData(res.data);
      console.log("refresh user data...")
    })
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
    userData: userData,
    setUserData: setUserData,
    token: token,
    setToken: setToken,
    captchaData: captchaData,
    setCaptchaData: setCaptchaData,
    setupUserData: setupUserData,

    handleShowSuccessSnackbar: handleShowSuccessSnackbar,
    handleShowErrorSnackbar: handleShowErrorSnackbar,
    setSnackbarMessage: setSnackbarMessage
  };

  return (
    <AppContextProvider value={AppContextValue}>
      <div className="App">
        <div className={classes.root}>
          <CssBaseline />
          {AuthService.getUserInfo() && (
            <AppNavbar onLogoClick={() => { history.push("/welcome") }} onLogoutClick={logout}
            />
          )}
          <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="lg" className={classes.container}>
              <Switch>
                {/** Login & Register Components */}
                <Route exact path={'/login'}>
                  <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
                    <LoginPage />
                  </GoogleReCaptchaProvider>
                </Route>
                <Route exact path={'/welcome'}>
                  <h1>{"WELCOME"}</h1>
                </Route>
                <Route exact path={'/user'}>
                  <UserPage />
                </Route>
                <Route exact path={'/company'}>
                  <CompanyPage />
                </Route>
                <Route exact path={'/location'}>
                  <LocationPage />
                </Route>
                <Route exact path={'/brand'}>
                  <BrandPage />
                </Route>
                <Route exact path={'/customer'}>
                  <CustomerPage />
                </Route>
                <Route exact path={'/action'}>
                  <ActionPage />
                </Route>
                <Route exact path={'/product'}>
                  <ProductPage />
                </Route>
                <Route exact path={'/shipment'}>
                  <ShipmentPage />
                </Route>
                <Route exact path={'/shipmentReport'}>
                  <ShipmentReportPage />
                </Route>
                <Route exact path={'/stockReport'}>
                  <StockReportPage />
                </Route>
                <Route exact path="*">
                  <h1>{"404 NOT FOUND"}</h1>
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
      <Snackbar open={showErrorSnackbar} autoHideDuration={3000} onClose={handleCloseErrorSnackbar}>
        <Alert onClose={handleCloseErrorSnackbar} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AppContextProvider>
  );
};

export default App;
