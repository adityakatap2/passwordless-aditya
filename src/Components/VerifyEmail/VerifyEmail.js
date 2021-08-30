import React, { useState, useEffect } from "react";
import Axios from "../../Helper/Axios";
import { useParams } from "react-router-dom";
import { startAttestation } from "../../Helper/Fido2Auth";

const VerifyEmail = () => {
  const [user, setUser] = useState({});

  const { accessToken } = useParams();

  useEffect(() => {
    Axios.post("verifyEmailToken", { accessToken })
      .then((response) => {
        const { username, uniqueId } = response.data;
        setUser({ ...user, username, uniqueId });
      })
      .catch((error) => {
        let errorMsg = error.message;
        if (error.response.data.errorMessage)
          errorMsg = error.response.data.errorMessage;

        console.log(errorMsg);
      });
  }, []);
  const submitForm = (e) => {
    e.preventDefault();
    registerWithFido();
  };

  const registerWithFido = () => {
    Axios.post("registerOrg", { username: user.username })
      .then((response) => {
        const { challenge, uniqueId } = response.data;
        startAttestation(response.data)
          .then((attresp) => {
            console.log(attresp);
            Axios.post("verify-registerorg-attestation", {
              username: user.username,
              credential: attresp,
              challenge,
            })
              .then((response) => {
                const { subdomain } = response.data;
                setUser({ ...user, subdomain });
              })
              .catch((error) => {
                let errorMsg = error.message;
                if (error.response.data.errorMessage)
                  errorMsg = error.response.data.errorMessage;

                console.log(errorMsg);
              });
          })
          .catch((error) => {
            console.log(error.message);
          });
      })
      .catch((error) => {
        let errorMsg = error.message;
        if (error.response.data.errorMessage)
          errorMsg = error.response.data.errorMessage;

        console.log(errorMsg);
      });
  };

  const saveState = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  return (
    <form onSubmit={submitForm}>
      <input name="username" onChange={saveState} value={user.username} />
      <input name="option" onChange={saveState} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default VerifyEmail;
