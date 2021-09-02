import React from 'react'
import classes from './Signup.module.css'
import hearts from "../../Assets/hearts.png"
import lighting from '../../Assets/lighting.png'
import piggyBank from '../../Assets/piggyBank.png'
import privacy from '../../Assets/privacy.png'
import { ReactComponent as Startup } from '../../Assets/startup.svg'
export default function Signup() {
    const imageSize = { width: "25px" }
    return (
        <div className={classes.signupContainer}>
            <section className={classes.infoContainer}>
                <header className={classes.headerContainer}>
                    <h1 className={classes.h1}>PasswordLess</h1>
                    <h3 className={classes.h3}>The Next Generation Authentication</h3>
                </header>
                <div className={classes.textContainer}>
                    <div className={classes.imageFlex}>
                        <img style={imageSize} src={hearts} alt="loving " />
                        <p>Your visitors love it</p>
                    </div>
                    <div className={classes.imageFlex}>
                        <img style={imageSize} src={privacy} alt="privacy " />
                        <p>Robust privacy and security</p>
                    </div>
                    <div className={classes.imageFlex}>
                        <img style={imageSize} src={lighting} alt="Lighting " />
                        <p>Quick and easy to integrate</p>
                    </div>
                    <div className={classes.imageFlex}>
                        <img style={imageSize} src={piggyBank} alt="Piggy Bank " />
                        <p>Reduce cost</p>
                    </div>
                </div>
                <h2 className={classes.getStart}>GET STARTED FOR FREE</h2>
                <div>
                    <Startup className={classes.startup} />
                </div>
            </section>
            <main className={classes.mainContainer}>
                <form className={classes.formContainer}>
                    <h3 className={classes.register}>Register</h3>
                    <p className={classes.regText}>Sign-up to get full dashboard access in under one minute!</p>
                    <input className={classes.emailInput} type="email" placeholder="Your Email Address" />
                    <p className={classes.termText}>By clicking "Create Your Account" I agree to the
                        <a href="#">Terms of Service</a>
                    </p>
                    <button className={classes.signBtn} type="submit">Create Your Account</button>
                    <p className={classes.docText}>Have Some Questions
                        Visit Our <a href="#">Documentation</a>
                    </p>
                </form>
            </main>
        </div>
    )
}
