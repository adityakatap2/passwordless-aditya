import React, { useState, useEffect } from 'react'
import MaterialTable from 'material-table'
import { Checkbox, Select, MenuItem, TableContainer, TableHead } from '@material-ui/core';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ViewUser from '../ViewUser';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'

const columns = [
  { id: 1, name: "Neeraj", email: 'neeraj@gmail.com',  type: "mobile", },
  { id: 2, name: "Raj", email: 'raj@gmail.com',  type: "web" },
  { id: 3, name: "David", email: 'david342@gmail.com', type: "api" },
  { id: 4, name: "Vikas", email: 'vikas75@gmail.com', type: "web" },
  { id: 5, name: "Vikas", email: 'vikas75@gmail.com',  type: "api" },
  { id: 6, name: "Neeraj", email: 'neeraj@gmail.com',  type: "mobile" },
  { id: 7, name: "Raj", email: 'raj@gmail.com',  type: "web" },
  { id: 8, name: "David", email: 'david342@gmail.com', type: "api" },
  { id: 9, name: "Vikas", email: 'vikas75@gmail.com',  type: "web" },
  { id: 10, name: "Vikas", email: 'vikas75@gmail.com',  type: "api" },
  { id: 11, name: "Neeraj", email: 'neeraj@gmail.com', type: "mobile" },
  { id: 12, name: "Raj", email: 'raj@gmail.com',  type: "web" },
  { id: 13, name: "David", email: 'david342@gmail.com',  type: "api" },
  { id: 14, name: "Vikas", email: 'vikas75@gmail.com',  type: "web" },
  { id: 15, name: "Vikas", email: 'vikas75@gmail.com',  type: "api" },
  { id: 16, name: "Neeraj", email: 'neeraj@gmail.com',  type: "mobile" },
  { id: 17, name: "Raj", email: 'raj@gmail.com',  type: "web" },
  { id: 18, name: "David", email: 'david342@gmail.com', type: "api" },
  { id: 19, name: "Vikas", email: 'vikas75@gmail.com',  type: "web" },
  { id: 20, name: "Vikas", email: 'vikas75@gmail.com',  type: "api" },

]
const rows = [
  { id: 1, name: "Neeraj", email: 'neeraj@gmail.com', type: "mobile", },
  { id: 2, name: "Raj", email: 'raj@gmail.com',  type: "web" },
  { id: 3, name: "David", email: 'david342@gmail.com',  type: "api" },
  { id: 4, name: "Vikas", email: 'vikas75@gmail.com',  type: "web" },
  { id: 5, name: "Vikas", email: 'vikas75@gmail.com', type: "api" },
  { id: 6, name: "Neeraj", email: 'neeraj@gmail.com',  type: "mobile" },
  { id: 7, name: "Raj", email: 'raj@gmail.com',  type: "web" },
]

function Sorting() {
  const useStyles = makeStyles({
    container: {
      padding: '0px',
      width: '90%',
      margin: "1rem 0"
    },
    table: {
      width: "100%",
      padding: "0",
      borderRadius: "5px",
    },
    btn: {
      padding: "0.2rem",
      background: "transparent",
      border: "none",
      cursor: "pointer",

    },
    span: {
      margin: "0 0.3rem"
    },
    btnDanger: {

      color: "#e63946",
      textAlign: "center",
      padding: "0 auto",
      width: "10px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
    },
    btnBlock: {
      backgroundColor: "#edf2fb",
      opacity: "0.7",
      background: "transparent",
      border: "none",
      cursor: "pointer",
    },
    blockIcon: {
      color: "black",

    },
    headColor: {
      backgroundColor: "grey"
    },
  });
  const [rowsData, setRowsData] = useState(rows);
    function remove(rawId) {
        const rowsData = rowsData.filter(row => row.id !== rawId)
        setRowsData(rowsData)
        setOpen(false);
    }
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const [filteredData, setFilteredData] = useState(rows)
  const [filter, setFilter] = useState(true)
  const [type, settype] = useState('all')
  const columns = [
    { title: "ID", field: "id" },
    { title: "Name", field: "name" },
    { title: "Email", field: "email" },
   
    { title: "Application type", field: 'type' },
    { title: "edit", field: 'actions', render: rowsData => <Link to="/edit-user" className="edit-icon"><EditOutlinedIcon style={{ color: "purple" }} /></Link> },
    
    {
      title: "Delete", field: 'actions', render: rowsData =>  <div><button onClick={handleClickOpen} className={classes.btnDanger}><DeleteOutlineOutlinedIcon /></button>
    
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">{"Delete Application"}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this application?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="primary">
                Close
            </Button>
            <Button onClick={() => remove(rowsData.id)} color="primary" autoFocus>
                Delete
            </Button>
        </DialogActions>
    </Dialog>
</div>
    }
  ]
  const handleChange = () => {
    setFilter(!filter)
  }
  useEffect(() => {
    setFilteredData(type === 'all' ? rows : rows.filter(dt => dt.type === type))

  }, [type])
  return (
    <div className="App">

      <h4 align='center'>Filtering in Material Table</h4>


      <MaterialTable
        title="User Data"
        data={filteredData}
        columns={columns}
        rows={rowsData}
        // options={{
        //   filtering:filter
        // }}
        actions={[
            // {
            //   icon:()=><Checkbox
            //   checked={filter}
            //   onChange={handleChange}
            //   inputProps={{ 'aria-label': 'primary checkbox' }}
            // />,
            // tooltip:"Hide/Show Filter option",
            // isFreeAction:true
            // },
          {
            icon: () => <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              style={{ width: 100 }}
              value={type}
              onChange={(e) => settype(e.target.value)}
            >
              <MenuItem value={"all"}><em>Select App Type</em></MenuItem>
              <MenuItem value={"mobile"}>mobile</MenuItem>
              <MenuItem value={"api"}>api</MenuItem>
              <MenuItem value={"web"}>web</MenuItem>
            </Select>,
            //   tooltip:"App type",
            isFreeAction: true
          }

        ]}


      />
      {/* <MaterialTable
        title="Positioning Actions Column Preview"
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Surname', field: 'surname' },
          { title: 'Birth Year', field: 'birthYear', type: 'numeric' },
          {
            title: 'Birth Place',
            field: 'birthCity',
            lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },
          },
        ]}
        data={[
          { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
        ]}
        actions={[
          {
            icon: 'save',
            tooltip: 'Save User',
            onClick: (event, rowData) => alert("You saved " + rowData.name)
          },
          rowData => ({
            icon: 'render:rowData=><div><DeleteOutlineOutlinedIcon style={{color:"red"}} /></div>',
            tooltip: 'Delete User',
            onClick: (event, rowData) => alert("You want to delete " + rowData.name),
            disabled: rowData.birthYear < 2000
          })
        ]}
        options={{
          actionsColumnIndex: -1
        }}
      /> */}



    </div>
  );


}

export default Sorting
