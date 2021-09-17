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
const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
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
        { id: 1, applicationName: 'BlueBerry', Type: "Mobile" },
        { id: 2, applicationName: 'BlackBerry', Type: "PC" },
        { id: 3, applicationName: 'Ace123', Type: "Web" },
        { id: 4, applicationName: 'GTA-V', Type: "Mobile" },
    ];
    const [rowsData, setRowsData] = useState(rows);
    return (
        <TableContainer className={classes.container} component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead >
                    <TableRow className={classes.head}>
                        <StyledTableCell align="center">Application Name</StyledTableCell>
                        <StyledTableCell align="center">Type</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rowsData.map((row) => (
                        <StyledTableRow key={row.id}>
                            <StyledTableCell component="th" scope="row" align="center">
                                {row.applicationName}
                            </StyledTableCell>
                            <StyledTableCell align="center">{row.Type}</StyledTableCell>
                            <StyledTableCell className={classes.mrginLeft} align="center">
                                <Button variant="contained" color="primary"><EditOutlinedIcon /></Button>
                                <span className={classes.span} />
                                <Button variant="contained" color="secondary" ><VisibilityOutlinedIcon /></Button>
                                <span className={classes.span} />
                                <Button variant="contained" className={classes.btnBlock} ><BlockOutlinedIcon className={classes.blockIcon} /></Button>
                                <span className={classes.span} />
                                <Button variant="contained" className={classes.btnDanger}><DeleteOutlineOutlinedIcon /></Button>
                            </StyledTableCell>

                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
