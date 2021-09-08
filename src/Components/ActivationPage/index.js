import React,{useState} from 'react'
import classes from "./Activation.module.css"
import { ReactComponent as Email } from '../../Assets/email.svg'
import {useLocation} from "react-router-dom"
import {sendMail} from "../../Helper/Util"
import Alert from '@material-ui/lab/Alert';
export default function ActivationPage() {
    const {state} = useLocation();
    const [error,setError] = useState({
        status:false,
        message : "",
        
    })
    const [success,setSucccess] = useState({
        status:false,
        message : "",
        
    })

const {email,name,accessToken} = state;
   const resendMail = async (e) =>{
       e.preventDefault();
       
       try{
    const emailData = {
        sendTo: email,
        name: name,
        link: `${window.location.origin}/verifyEmail/${accessToken}`,
        type: "activation",
      };

     
     await sendMail(emailData);
     setSucccess({status:true,message:"Email sent SuccessFully "})
    }
    catch(error){

        setError({status:true,message:error.message})
    }
   }

    return (
        <div className={classes.activationContainer}>
            <div className={classes.flexContainer}>
           { error.status && <Alert onClose={() => {setError({status:false,message:""})}} severity="error">{error.message}</Alert>}
           { success.status && <Alert onClose={() => {setSucccess({status:false,message:""})}} severity="success">{success.message}</Alert>}
                <Email className={classes.email} />
                <h2 className={classes.h2}>Verfy Your Email</h2>
                <p className={classes.emailText}>
                   
                    We Just sent an email to {email}</p>
                <p className={classes.emailText}>
                   
                   If you don't see message in your inbox make sure the email address listed above is correct and check your spam or
                   Junk mail folder.This email is sent from <b>help@passwordless.com.au</b>.
                                   </p>
        <p className={classes.emailText}> If You want to resend email <a href='javascript:void(0)' onClick={resendMail}> Click Here</a></p>
            </div>
        </div>
    )
}
