import React, { useState, useEffect } from "react";
import Axios from "../../Helper/Axios";
import { useParams } from "react-router-dom";
import classes from "./verifyEmail.module.css";
import Alert from "@material-ui/lab/Alert";
import handshake from "../../Assets/handshake.png";
import { BarLoader } from "react-spinners";

import { FormControl } from "@material-ui/core";

import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";

import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Paper } from "@material-ui/core";
const VerifyEmail = (props) => {
  const [user, setUser] = useState({});

  const { accessToken } = useParams();
  const [error, setError] = useState({
    status: false,
    message: "",
  });

  const [subdomainExist, setSubDomainExist] = useState({
    exist: false,
    noExist: false,
  });
  const [loading, setLoading] = useState(false);
  const [accountConfirmed, setAccountConfirmed] = useState(false);

  let typingTimer = null;

  const handleChange = (evt) => {
    const val = evt.target.value;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      if (val) {
        checkSubdomain(val);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimer);
    };
  }, []);
  useEffect(() => {
    setLoading(true);
    Axios.post("verifyEmailToken", { accessToken })
      .then((response) => {
        setLoading(false);
        const { username, uniqueId, name } = response.data;
        setUser({ ...user, username, uniqueId });
      })
      .catch((error) => {
        setLoading(false);
        let errorMsg = error.message;
        if (error?.response?.data?.errorMessage)
          errorMsg = error?.response?.data?.errorMessage;

        setError({ status: true, message: errorMsg });
      });
  }, [accessToken, user]);

  const checkSubdomain = async (subdomain) => {
    try {
      const response = await Axios.get(`checkSubDomain/${subdomain}`);
      const { errorCode } = response.data;
      if (errorCode === -1) setSubDomainExist({ exist: true, noExist: false });
      else if (errorCode === 0)
        setSubDomainExist({ exist: false, noExist: true });
    } catch (error) {
      let errorMsg = error.message;
      if (error?.response?.data?.errorMessage)
        errorMsg = error?.response?.data?.errorMessage;
      console.log(errorMsg);
    }
  };

  const saveState = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  return (
    <>
      {error.status && (
        <Alert
          onClose={() => {
            setError({ status: false, message: "" });
          }}
          severity="error"
        >
          {error.message}
        </Alert>
      )}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <BarLoader color="#6232c5" loading={loading} />
        </div>
      ) : (
        <div>
          <Paper>
          <div >
            {error.status && (
              <>
                <h2 className={classes.h2}>Welcome</h2>
                <img className={classes.email} src={handshake} />

                {accountConfirmed && (
                  <>
                    <p className={classes.emailText}>
                      We are excited to have you get started.First you need to
                      confirm your account.Just press the button below.
                    </p>

                    <Button variant="contained" color="primary">
                      Confirm Account
                    </Button>
                  </>
                )}
                {!accountConfirmed && (
                  <>
                    <p className={classes.emailText}>Create Subdomain </p>
                    <form>
                    <FormControl>
                      <InputLabel htmlFor="outlined-adornment-password">
                        Subdomain
                      </InputLabel>
                      <Input
                        onChange={handleChange}
                        id="outlined-adornment-password"
                        endAdornment={
                          <InputAdornment position="end">
                            {subdomainExist.exist && (
                              <CheckCircleIcon color="inherit" />
                            )}
                            {subdomainExist.noExist && (
                              <CancelIcon color="error" />
                            )}
                          </InputAdornment>
                        }
                        labelWidth={70}
                      />

                     
                    </FormControl>
                  
                    <Button variant="outlined" color="primary" style={{marginTop:20}}>
                        Go To DashBoard
                      </Button>
                    
                    </form>
                    
                  </>
                )}
              </>
            )}
           
          </div>
          </Paper>
        </div>
      )}
    </>
  );
};

export default VerifyEmail;
