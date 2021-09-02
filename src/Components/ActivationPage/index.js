import React from 'react'
import classes from "./Activation.module.css"
import { ReactComponent as Email } from '../../Assets/email.svg'
export default function ActivationPage() {
    return (
        <div className={classes.activationContainer}>
            <div className={classes.flexContainer}>
                <Email className={classes.email} />
                <h2 className={classes.h2}>Activation Email</h2>
                <p className={classes.emailText}>
                    We send an activation email to your register email address. Please verify your account
                </p>
            </div>
        </div>
    )
}
