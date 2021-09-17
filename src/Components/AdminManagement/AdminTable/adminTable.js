






import React, { useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Button from '@material-ui/core/Button';

import BlockOutlinedIcon from '@material-ui/icons/BlockOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';


const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: "#adb5bd",
        color: "#1b263b",
        fontWeight: "bold",
        fontSize: "1.25em",
        paddingLeft: "2rem",
    },
    body: {
        fontSize: 14,
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
        width: '90%',
        margin: "1rem 0"
    },
    table: {
        width: "100%",
        padding: "0",
        borderRadius: "10px",
    },
    head: {
        backgroundColor: '#353535',
    },
    btn: {
        padding: "0.2rem"
    },
    span: {
        margin: "0 0.3rem"
    },
    btnDanger: {
        backgroundColor: "#f44336",
        color: "white",
        textAlign: "center",
        padding: "0 auto",
        width: "10px"
    },
    btnBlock: {
        backgroundColor: "#edf2fb"
    },
    blockIcon: {
        color: "black",

    }
});

export default function CustomizedTables() {
    const classes = useStyles();
    const rows = [
        { id: 1, emailId: 'jim', date: "Mobile" , role: "manager" , status:"active" , delete:"" , suspend:"yes/no"},
        { id: 2, emailId: 'dwight', date: "PC" , role: "manager" , status:"active" , delete:"" , suspend:"yes/no"  },
        { id: 3, emailId: 'micheal', date: "Web" , role: "manager" , status:"active" , delete:"" , suspend:"yes/no" },
        { id: 4, emailId: 'pam', date: "Mobile" , role: "manager" , status:"active" , delete:"" , suspend:"yes/no" },
    ];
    const [rowsData, setRowsData] = useState(rows);
    return (
        <TableContainer className={classes.container} component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow className={classes.head}>
                        <StyledTableCell align="center">Email ID</StyledTableCell>
                        <StyledTableCell align="center">Date</StyledTableCell>
                        <StyledTableCell align="center">Role</StyledTableCell>
                        <StyledTableCell align="center">Status</StyledTableCell>
                        <StyledTableCell align="center">Delete</StyledTableCell>
                        <StyledTableCell align="center">Suspend</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rowsData.map((row) => (
                        <StyledTableRow key={row.id}>
                            <StyledTableCell component="th" scope="row" align="center">
                                {row.emailId}
                            </StyledTableCell>
                            <StyledTableCell align="center">{row.date}</StyledTableCell>
                            <StyledTableCell align="center">{row.role}</StyledTableCell>
                            <StyledTableCell align="center">{row.status}</StyledTableCell>
                            <StyledTableCell className={classes.mrginLeft} align="center">{row.delete}
                            <Button variant="contained"  className={classes.btnDanger}><DeleteOutlineOutlinedIcon /></Button>
                            </StyledTableCell>
                            <StyledTableCell className={classes.mrginLeft} align="center">
                               
                                <Button variant="contained" className={classes.btnBlock} ><BlockOutlinedIcon className={classes.blockIcon} /></Button>
                                <span className={classes.span} />
                               
                            </StyledTableCell>
                            

                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

