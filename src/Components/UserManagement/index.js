

// import Application from '../Applications/index'

import './User.css';
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import AdminTable from '../AdminManagement/AdminTable/adminTable';
import UserTable from './UserTable/UserTable';
import ComparatorSortingGrid from './UserTable/UserTable';
import ApplicationTabs from './ApplicationTabs/Tabs';
import Sorting from './UserTable/Sorting';
import Charts from './UserCharts/Charts';



const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function UserManagement() {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <div>
            <div className="management">

                <div className="btn-container">
                    <h4 className="header">User management :</h4>

                    {/* <div>
                        <Button className="btn" variant="outlined" color="primary" onClick={handleClickOpen}>
                            Add Admin
                        </Button>
                        <Dialog
                            open={open}
                            TransitionComponent={Transition}
                            keepMounted
                            onClose={handleClose}
                            aria-labelledby="alert-dialog-slide-title"
                            aria-describedby="alert-dialog-slide-description"
                        >
                            <DialogTitle className="alert-di" id="alert-dialog-slide-title">{"Add New Administrator"}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-slide-description">
                                   <div className="pop-card">
                                       <input className="email" type="email" placeholder="New Admin Email"></input>
                                       <br />
                                       <input className="email" type="email" placeholder="Confirm Email"></input>
                                   </div>
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button className="btn" onClick={handleClose} color="primary">
                                    Cancel
                                </Button>
                                <Button className="btn" onClick={handleClose} color="primary">
                                    Send
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div> */}
                </div>
                
            </div>
{/* 
           <ComparatorSortingGrid /> */}
           
           <Sorting />
            <ApplicationTabs/>

          
           


        </div>
    )
}
