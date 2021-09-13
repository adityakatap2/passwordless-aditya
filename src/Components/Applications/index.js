import React from 'react'
import Header from '../Header'
import classes from "./Application.module.css"
import '../global.css'
import ApplicationTable from './Table'
export default function Applications() {
    const HEADER_TITLE = 'Create And Manage Your API Clients And API Credentials'
    return (
        <div>
            <Header HeaderName={HEADER_TITLE} />
            <div className={classes.tableContainer}>
                <div className={classes.addAppContainer}>
                    <h2 className={classes.h2}>Manage Applications</h2>
                    <button className="btn">Add Application</button>
                </div>
                <ApplicationTable />
            </div>
        </div>
    )
}
