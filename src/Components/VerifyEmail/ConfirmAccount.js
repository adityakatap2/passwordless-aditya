import handshake from "../../Assets/handshake.png";
import { Alert } from "@material-ui/lab";
import { FormControl } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import Axios from "../../Helper/Axios";
import Check from "../../Assets/check.gif";

import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import { FormHelperText } from "@material-ui/core";

import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "40%",
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
}));
export const ConfirmAccount = (props) => {
  const [accountConfirmed, setAccountConfirmed] = useState(false);

  const confirmAccount = async (userId) => {
    props.handleNext();
    try {
      const response = await Axios.put(`updateOperator/${userId}`, {
        emailVerfied: true,
      });
      props.handleNext();
      setAccountConfirmed(true);
    } catch (error) {
      let errorMsg = error.message;
      if (error?.response?.data?.errorMessage)
        errorMsg = error?.response?.data?.errorMessage;
    }
  };

  return (
    <>
      <h3>Welcome</h3>
      <img style={{ height: "7em", width: "8em" }} src={handshake} />

      <p>
        We are excited to have you get started.First you need to confirm your
        account.Just press the button below.
      </p>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          confirmAccount(props.user.userId);
        }}
      >
        Confirm Account
      </Button>
    </>
  );
};

export const CreateSubDomain = (props) => {
  const clx = useStyles();
  let typingTimer = null;

  const [Organization, setOrganaization] = useState({
    name: "",
    subdomain: "",
  });

  const handleSubDomain = (evt) => {
    const val = evt.target.value;

    setOrganaization({ ...Organization, [evt.target.name]: val });
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      if (val) {
        checkSubdomain(val);
      }
    }, 500);
  };

  const handleChange = (evt) => {
    const val = evt.target.value;

    setOrganaization({ ...Organization, [evt.target.name]: val });
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimer);
    };
  }, []);
  const [subdomainExist, setSubDomainExist] = useState({
    exist: false,
    noExist: false,
  });
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

  const addSubDomain = async (e) => {
  
    try{
      const response = await Axios.put(`updateOrg/${props.uniqueId}`,{name:Organization.name,subdomain:Organization.subdomain})
    props.handleNext();
    }
    catch (error) {
      let errorMsg = error.message;
      if (error?.response?.data?.errorMessage)
        errorMsg = error?.response?.data?.errorMessage;
      console.log(errorMsg);
    }
  };
  return (
    <>
      <h4>Set Up Your Business</h4>
      <img style={{ height: "7em", width: "8em" }} src={handshake} />

      <form className={clx.root} onSubmit={addSubDomain}>
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <FormControl fullWidth>
            <InputLabel htmlFor="businessName">Business Name</InputLabel>
            <Input
              onChange={handleChange}
              id="businessName"
              name="name"
              labelWidth={70}
              required
            />
          </FormControl>
        </div>
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <FormControl fullWidth>
            <InputLabel htmlFor="businessURL">Vanity URL</InputLabel>
            <Input
              error={subdomainExist.noExist}
              required
              onChange={handleSubDomain}
              id="businessURL"
              name="subdomain"
              endAdornment={
                <InputAdornment position="end">
                  {subdomainExist.exist && <CheckCircleIcon color="inherit" />}
                  {subdomainExist.noExist && <CancelIcon color="error" />}
                </InputAdornment>
              }
              labelWidth={70}
            />
            <FormHelperText>
              {Organization.subdomain}.passwordless.com.au
            </FormHelperText>
          </FormControl>
        </div>
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={subdomainExist.noExist}
          >
            Create URL
          </Button>
        </div>
      </form>
    </>
  );
};

export const Success = () => {
  return (
    <>
      <img src={Check} style={{ width: "16rem" }} />

      <Button type="submit" variant="contained" color="primary">
        Continue To DashBoard
      </Button>
    </>
  );
};
