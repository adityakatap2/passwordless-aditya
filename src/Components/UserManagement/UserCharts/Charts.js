
import { Doughnut } from 'react-chartjs-2';
import { Container, TableContainer, TableRow } from '@material-ui/core';
import { Row } from 'antd';
import Col from 'react-bootstrap/Col';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import Paper from '@material-ui/core/Paper';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React, { useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import BlockOutlinedIcon from '@material-ui/icons/BlockOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import TableCell from '@material-ui/core/TableCell';
import Dialog from '@material-ui/core/Dialog';


import { Link } from 'react-router-dom'
import { Cards } from '../AppCards/Cards';
import BarCharts from './BarCharts';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#adb5bd",
    color: "#1b263b",
    fontWeight: "bold",
    fontSize: "1.25em",
    paddingLeft: "2rem"
  },
  body: {
    fontSize: 14,
    paddingLeft: "2rem",
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    width: '100%',

  },

}))(TableRow);


const useStyles = makeStyles({
  container: {
    padding: '0px',
    width: '100%',
    margin: "0rem 0"
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
  title:{
    width: "100%",
    background: "white",
    padding: "20px",
    color: "green",
    borderBottom:"1px solid green",
    borderRadius: "20px",
  }
});

const data = {
  labels: ['Mobile', 'Web', 'Api',],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        // 'rgba(75, 192, 192, 0.2)',
        // 'rgba(153, 102, 255, 0.2)',
        // 'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        // 'rgba(75, 192, 192, 1)',
        // 'rgba(153, 102, 255, 1)',
        // 'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
};
export default function Charts() {

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const rows = [
    { id: 1, applicationName: 'BlueBerry', LoginTime: "2:30pm/ 1-2-2021" },
    { id: 2, applicationName: 'BlackBerry', LoginTime: "2:30pm/ 1-2-2021" },
    { id: 3, applicationName: 'Ace123', LoginTime: "2:30pm/ 1-2-2021" },
    { id: 4, applicationName: 'GTA-V', LoginTime: "2:30pm/ 1-2-2021" },
  ];
  const [rowsData, setRowsData] = useState(rows);
  function remove(rawId) {
    const newRows = rowsData.filter(row => row.id !== rawId)
    setRowsData(newRows)
    setOpen(false);
  }


  return (
    <Container>
      <Row className='header'>
        <h5 className={classes.title}>Usage By Device</h5>

      </Row>
      <Row style={{}}>
        <Col ><Doughnut style={{ height: 200, width: 200 }} data={data} /></Col>
        <Col style={{ display: "flex", background: "white", borderRadius: 20, height: 400, width: 600, padding: 30 }}>
          <TableContainer className={classes.container} component={Paper}>
            <Table className={classes.table} aria-label="customized table">
              <TableHead >
                <TableRow className={classes.head} >
                  <StyledTableCell align="left">Application Name</StyledTableCell>
                  <StyledTableCell align="left">LoginTime</StyledTableCell>
                  <StyledTableCell align="left">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowsData.map((row) => (
                  <StyledTableRow key={row.id}  >
                    <StyledTableCell component="th" scope="row" align="left">
                      {row.applicationName}
                    </StyledTableCell>
                    <StyledTableCell align="left">{row.LoginTime}</StyledTableCell>
                    <StyledTableCell className={classes.mrginLeft} align="left">
                      {/* <button className={classes.btn} color="primary"><EditOutlinedIcon /></button>
                                <span className={classes.span} />
                                <Link to="/view" variant="outlined" color="secondary" ><VisibilityOutlinedIcon /></Link>
                                <span className={classes.span} /> */}
                      <button variant="outlined" className={classes.btnBlock}  ><BlockOutlinedIcon className={classes.blockIcon} /></button>
                      <span className={classes.span} />
                      <button onClick={handleClickOpen} className={classes.btnDanger}><DeleteOutlineOutlinedIcon /></button>
                      <div>
                        {/* <Button className={classes.btnDanger} color="danger" onClick={handleClickOpen}>
                                        <DeleteOutlineOutlinedIcon />
                                    </Button> */}
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
                            <Button onClick={() => remove(row.id)} color="primary" autoFocus>
                              Delete
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </div>
                    </StyledTableCell>

                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Col>
        <Container style={{marginTop:150}}>
        <Row >
          <Col>
          <div >
          <h5 className={classes.title}>
              Devices List
            </h5>
          </div>
            
          </Col>
        </Row>
        <Row  style={{margintTop:100}} >
          <Col >
            <Cards style={{ padding: 0 }} />
          </Col>
          <Col   >
            <Cards style={{ padding: 0 }} />
          </Col>
          <Col >
            <Cards style={{ padding: 0 }} />
          </Col>
          <Col >
            <Cards style={{ padding: 0 }} />
          </Col>
          <Col >
            <Cards style={{ padding: 0 }} />
          </Col>
        </Row>
        </Container>
        <Container>
          <Row>
            <Col>
          <BarCharts />
            </Col>
          </Row>
        </Container>
        

      </Row>


    </Container >
  )
}





// const Charts = () => (

//   <>
//     <div className='header'>
//       <h3 className='title'>Doughnut Chart</h3>
//       <div className='links'>
//         {/* <a
//           className='btn btn-gh'
//           href='https://github.com/reactchartjs/react-chartjs-2/blob/master/example/src/charts/Doughnut.js'
//         >
//           Github Source
//         </a> */}
//       </div>
//     </div>
//     <Doughnut className={classes.pieChart} data={data} />
//   </>
// );

// export default Charts;