import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Switch, Route, useHistory, } from "react-router-dom";
import clsx from 'clsx';
import { AppContext } from '../../App';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Tooltip from "@material-ui/core/Tooltip";

// Icon
import MenuIcon from '@material-ui/icons/Menu'; import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MoreIcon from '@material-ui/icons/MoreVert';
import AccountCircle from '@material-ui/icons/AccountCircle';
import PeopleIcon from '@material-ui/icons/People';
import ApartmentIcon from '@material-ui/icons/Apartment';
import PinDropIcon from '@material-ui/icons/PinDrop';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import LabelIcon from '@material-ui/icons/Label';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PrintIcon from '@material-ui/icons/Print';
import FindInPageIcon from '@material-ui/icons/FindInPage';

// Enum
import { USER_ROLES, AUTH_ROUTES } from '../../types/enum';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
    cursor: "pointer"
  },
  username: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  }
}));

interface IAppNavbarProps {
  onLogoutClick: any;
  onLogoClick: any;
}

const AppNavbar = (props: IAppNavbarProps) => {
  const {
    loginData,
  } = useContext(AppContext);

  const classes = useStyles();
  const history = useHistory();

  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);

  const { onLogoutClick, onLogoClick } = props;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={onLogoutClick}>{"Logout"}</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={onLogoutClick}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>{"Logout"}</p>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title} onClick={onLogoClick}>
            {"LKJA"}
          </Typography>
          <div className={classes.sectionDesktop}>
            <p className={classes.username}>{"Halo, " + loginData.name}</p>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          {[String(USER_ROLES.SUPER_ADMIN)].includes(loginData.role) && (
            <Tooltip title={"Users"} placement="right">
              <ListItem button onClick={() => history.push(AUTH_ROUTES.USER)}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItem>
            </Tooltip>
          )}

          {[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN)].includes(loginData.role) && (
            <>
              <Tooltip title={"Locations"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.LOCATION)}>
                  <ListItemIcon>
                    <PinDropIcon />
                  </ListItemIcon>
                  <ListItemText primary="Locations" />
                </ListItem>
              </Tooltip>
              <Tooltip title={"Brands"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.BRAND)}>
                  <ListItemIcon>
                    <BookmarksIcon />
                  </ListItemIcon>
                  <ListItemText primary="Brands" />
                </ListItem>
              </Tooltip>
              <Tooltip title={"Customers"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.CUSTOMER)}>
                  <ListItemIcon>
                    <EmojiPeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Customers" />
                </ListItem>
              </Tooltip>
              <Tooltip title={"Actions"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.ACTION)}>
                  <ListItemIcon>
                    <OpenWithIcon />
                  </ListItemIcon>
                  <ListItemText primary="Actions" />
                </ListItem>
              </Tooltip>
              <Tooltip title={"Products"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.PRODUCT)}>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <ListItemText primary="Products" />
                </ListItem>
              </Tooltip>
            </>
          )}

          {[String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN), String(USER_ROLES.NON_ADMIN)].includes(loginData.role) && (
            <>
              <Tooltip title={"Shipments"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.SHIPMENT)}>
                  <ListItemIcon>
                    <LocalShippingIcon />
                  </ListItemIcon>
                  <ListItemText primary="Shipments" />
                </ListItem>
              </Tooltip>
              <Tooltip title={"Print Invoice"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.PRINT_INVOICE)}>
                  <ListItemIcon>
                    <PrintIcon />
                  </ListItemIcon>
                  <ListItemText primary="Print Invoice" />
                </ListItem>
              </Tooltip>
              <Tooltip title={"Check Serial Number"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.CHECK_SERIAL_NUMBER)}>
                  <ListItemIcon>
                    <FindInPageIcon />
                  </ListItemIcon>
                  <ListItemText primary="Check Serial Number" />
                </ListItem>
              </Tooltip>
              <Tooltip title={"Shipments Report"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.SHIPMENT_REPORT)}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="Shipments Report" />
                </ListItem>
              </Tooltip>
              <Tooltip title={"Stocks Report"} placement="right">
                <ListItem button onClick={() => history.push(AUTH_ROUTES.STOCK_REPORT)}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="Stocks Report" />
                </ListItem>
              </Tooltip>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
}

export default React.memo(AppNavbar);