
import React, { useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styles from './Table.module.css'
import Button from '@material-ui/core/Button';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import BlockOutlinedIcon from '@material-ui/icons/BlockOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { Link } from 'react-router-dom'
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
        width: '90%',
        margin: "1rem 0"
    },
    table: {
        width: "100%",
        padding: "0",
        borderRadius: "10px",
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
export default function CustomizedTables() {
    const classes = useStyles();
    const rows = [
        { id: 1, applicationName: 'BlueBerry', Type: "Mobile" },
        { id: 2, applicationName: 'BlackBerry', Type: "PC" },
        { id: 3, applicationName: 'Ace123', Type: "Web" },
        { id: 4, applicationName: 'GTA-V', Type: "Mobile" },
    ];
    const [rowsData, setRowsData] = useState(rows);
    function remove(rawId) {
        const newRows = rowsData.filter(row => row.id !== rawId)
        setRowsData(newRows)
    }


    return (
        <TableContainer className={classes.container} component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead >
                    <TableRow className={classes.head} >
                        <StyledTableCell align="left">Application Name</StyledTableCell>
                        <StyledTableCell align="left">Type</StyledTableCell>
                        <StyledTableCell align="left">Actions</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rowsData.map((row) => (
                        <StyledTableRow key={row.id}  >
                            <StyledTableCell component="th" scope="row" align="left">
                                {row.applicationName}
                            </StyledTableCell>
                            <StyledTableCell align="left">{row.Type}</StyledTableCell>
                            <StyledTableCell className={classes.mrginLeft} align="left">
                                <button className={classes.btn} color="primary"><EditOutlinedIcon /></button>
                                <span className={classes.span} />
                                <Link to="/view" variant="outlined" color="secondary" ><VisibilityOutlinedIcon /></Link>
                                <span className={classes.span} />
                                <button variant="outlined" className={classes.btnBlock}  ><BlockOutlinedIcon className={classes.blockIcon} /></button>
                                <span className={classes.span} />
                                <button onClick={() => remove(row.id)} className={classes.btnDanger}><DeleteOutlineOutlinedIcon /></button>
                            </StyledTableCell>

                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}








