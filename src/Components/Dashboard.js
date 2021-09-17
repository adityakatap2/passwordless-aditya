import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import WidgetsIcon from '@material-ui/icons/Widgets';
import PersonIcon from '@material-ui/icons/Person';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import AssessmentIcon from '@material-ui/icons/Assessment';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import DescriptionIcon from '@material-ui/icons/Description';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Profile from './Profile';
import AdminManagement from './AdminManagement';
import UserManagement from './UserManagement';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import EditUser from './UserManagement/EditUser';



// importing components
import Applications from './Applications'
import './Dashboard.css';
import Sorting from './UserManagement/UserTable/Sorting';
import ViewUser from './UserManagement/ViewUser';
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
            backgroundColor: 'danger'
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
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        backgroundColor: "#E2FFC6",
        width: "100%",
        height: "100vh"
    },
    bottomNav: {
        position: 'absolute',
        bottom: 20,
    },
    span: {
        color: "#52b69a"
    },
    navColor: {
        backgroundColor: "#52b69a"
    },
    marginLeft: { marginLeft: "0.5rem" }
}));

export default function Dashboard() {
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const LESS = "{Less}"
    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
                color="inherit"
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <MenuIcon />
                    </IconButton>
                    <div className="appBarFlexRow">
                        <Typography variant="h6" noWrap>

                        </Typography>
                        <Profile />
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}

            >
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
                <h2 style={{ marginTop: "-3rem", marginLeft: "1.5rem", padding: "0" }}> Password<span className={classes.span}>{LESS}    </span></h2>
                <Divider />
                <List>
                    <ListItem style={{ backgroundColor: "#9eff95" }} button>
                        <ListItemIcon className={classes.marginLeft}><WidgetsIcon /></ListItemIcon>
                        <ListItemText color="primary" primary={"Applications"} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon className={classes.marginLeft}><PersonIcon /></ListItemIcon>
                        <ListItemText primary={"Administrator"} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon className={classes.marginLeft}><SupervisorAccountIcon /></ListItemIcon>
                        <ListItemText primary={"Users"} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon className={classes.marginLeft}><AssessmentIcon /></ListItemIcon>
                        <ListItemText primary={"Reports"} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon className={classes.marginLeft}><LocalOfferIcon /></ListItemIcon>
                        <ListItemText primary={"Pricing"} />
                    </ListItem>
                </List>

                <Divider />
                <List className={classes.bottomNav}>
                    <ListItem button>
                        <ListItemIcon className={classes.marginLeft}><HelpOutlineIcon /></ListItemIcon>
                        <ListItemText primary={"Help & Support"} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon className={classes.marginLeft}><DescriptionIcon /></ListItemIcon>
                        <ListItemText primary={"Documentation"} />
                    </ListItem>
                </List>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar} className="admin-box" />
                {/* <Applications />
            <AdminManagement /> */}

                <Router>
                    <Switch>
                        <Route path="/user-management">

                            <UserManagement />
                        </Route>
                        <Route path="/sorting">

                            <Sorting />
                        </Route>
                        <Route path="/edit-user">

                            <EditUser />
                        </Route>
                    </Switch>
                </Router>

            </main>
        </div >
    );
}
