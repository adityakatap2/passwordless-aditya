import "./signup.css";
import { useEffect, useState } from "react";
import { CircularProgress, Button } from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import socket from "../../Helper/SocketIOConfig";

import Modal from "../Modal";

import { registerOrgWithFido, loginOrgWithFido } from "../../Helper/Fido2Auth";
import { generateQRCode, sendMail, getOS } from "../../Helper/Util";
import { nanoid } from "nanoid";
import Axios from "../../Helper/Axios";
import React from "react";
import { useHistory } from "react-router-dom";
export default function Register(props) {
  const [errorMessage, setErrorMessage] = useState("");
  const [fidoSupported, setFidoSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [operatorExist, setOperatorExist] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);

  const history = useHistory();
  const [user, setUser] = useState({
    name: "",
    email: "",
    platform: "",
    qr: "",
    longitude: "",
    latitude: "",
    device: "",
  });
  const [showModal, setModalShow] = useState(false);

  const userRef = React.createRef();
  userRef.current = user;

  useEffect(() => {
    const device = getOS();
    setUser({ ...user, device });
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });
    socket.on("register-client-response", (data) => {
      closeModal();
      if (data.verified) generateTokenAndSendMail(data);
    });

    socket.on("login-client-response", (data) => {
      closeModal();
    });

    socket.on("decline-process-response", (data) => {
      closeModal();
    });
  }, []);

  const generateTokenAndSendMail = async (data) => {
    console.log("generateToken and send mail", data);
    const { email, name, uniqueId, userId } = data;

    try {
      const response = await Axios.post("generateEmailToken", {
        email,
        name,
        userId,
        uniqueId,
      });

      const { accessToken } = response.data;

      const emailData = {
        sendTo: email,
        name: name,
        link: `${window.location.origin}/verifyEmail/${accessToken}`,
        type: "activation",
      };

      console.log("email data", emailData);
      await sendMail(emailData);
      history.push({
        pathname: "/mailSentSuccess",
        state: { email, name, accessToken },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const saveState = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const checkOperator = async (email) => {
    try {
      const response = await Axios.post("checkOperator", { email });
      const { errorCode } = response.data;

      if (errorCode === 1) setOperatorExist(false);
      else setOperatorExist(true);
    } catch (error) {
      let errorMsg = error.message;
      if (error?.response?.data?.errorMessage)
        errorMsg = error?.response?.data?.errorMessage;

      console.log(error);
    }
  };

  const registerForm = async (e) => {
    e.preventDefault();

    switch (user.platform) {
      case "1": {
        register(user);
        break;
      }

      case "2": {
        generateDataForQR({ platform: "web", type: 1 });
        break;
      }

      case "3": {
        generateDataForQR({ platform: "app", type: 1 });
        break;
      }

      default: {
        console.log("not valid option");
      }
    }
  };

  const loginForm = async (e) => {
    e.preventDefault();

    switch (user.platform) {
      case "1": {
        login(user);
        break;
      }

      case "2": {
        generateDataForQR({ platform: "web", type: 2 });
        break;
      }

      case "3": {
        generateDataForQR({ platform: "app", type: 2 });
        break;
      }

      default: {
        console.log("not valid option");
      }
    }
  };

  const generateDataForQR = ({ platform, type }) => {
    if (!navigator.geolocation)
      throw new Error("Geolocation is not supported by your browser");

    async function success(pos) {
      const { longitude, latitude } = pos.coords;

      const data = {
        longitude,
        latitude,
        device: user.device,
        type,
        platform,
        email: user.email,
        path: `${window.location.origin}/approve`,
        name: user.name,
        reqTime: new Date(),
        id: nanoid(20),
      };
      let img = await generateQRCode(data);
      setUser({ ...user, longitude, latitude, qr: img.url });
      setModalShow(true);
      socket.emit("join", { id: data.id });
    }

    function error(err) {
      throw new Error(err.message);
    }

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
    });
  };

  const register = async (user) => {
    try {
      const data = await registerOrgWithFido(user);
      if (data.verified) generateTokenAndSendMail(data);
    } catch (error) {
      console.log(error);
    }
  };
  let typingTimer = null;

  const handleEmailOnChange = (evt) => {
    const val = evt.target.value;

    setUser({ ...user, [evt.target.name]: val });
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      if (val) {
        ValidateEmail(val);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimer);
    };
  }, []);

  const login = async (user) => {
    try {
      const data = await loginOrgWithFido(user);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  const closeModal = () => {
    setModalShow(false);
  };


  function ValidateEmail(mail) {
  const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;


 if (re.test(String(mail).toLowerCase()))
  {
    setEmailValidated(true)
    checkOperator(mail);
  }
   else
   setEmailValidated(false);

}

  return (
    <div className="section">
      <div className="hero section">
        <div className="container">
          <div className="row">
            <div className="main-content col-md-12">
              <div className="row">
                <div className="hero-left order-2 col-lg-6 order-lg-1">
                  <h3 className="logo-font-style">Password{"{Less}"}</h3>
                  <h5>A demo of the WebAuthn specification</h5>
                  <form
                    onSubmit={
                      props.type === "Register" ? registerForm : loginForm
                    }
                  >
                    <div className="mt-5 hero-form">
                      {props.type === "Register" ? (
                        <div className="form-group input-group">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Full name"
                            name="name"
                            required
                            onChange={saveState}
                          />
                        </div>
                      ) : null}
                      <div className="form-group input-group">
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          placeholder="example@domain.com"
                          name="email"
                          required
                          onChange={handleEmailOnChange}
                        />

                        {user.email.length>0 && (props.type ==="Register" ?  <span class="input-group-append">
                          <div class="input-group-text">
                            {emailValidated && !operatorExist  ? <CheckCircleIcon style={{color:"#42ba96"}}/> : <CancelIcon color="error"/>}
                          </div>
                        </span> :  <span class="input-group-append">
                          <div class="input-group-text">
                            {emailValidated && operatorExist ? <CheckCircleIcon style={{color:"#42ba96"}}/> : <CancelIcon color="error" />}
                          </div>
                        </span>)}
                       

                        
                      </div>

                      {props.type === "Register" && operatorExist && (
                          <div
                            style={{
                              fontSize: 14,
                              marginLeft: 10,
                              color: "#df4759",
                            }}
                          >
                            This Email already Exist !!
                          </div>
                        )}

                        {props.type === "Login" && emailValidated && !operatorExist &&  (
                          <div
                            style={{
                              fontSize: 14,
                              marginLeft: 10,
                              color: "#df4759",
                            }}
                          >
                            Operator is not registerd !!
                          </div>
                        )}

                      <div className=" form-check mb-3">
                        <p>Select Method for Authentication</p>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="platform"
                            id="same"
                            onChange={saveState}
                            value="1"
                            required
                          />
                          <label className="form-check-label" htmlFor="same">
                            Same Platform
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="platform"
                            id="appLess"
                            onChange={saveState}
                            value="2"
                            required
                          />
                          <label className="form-check-label" htmlFor="appLess">
                            Appless QR
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            value="3"
                            className="form-check-input"
                            type="radio"
                            name="platform"
                            id="inApp"
                            onChange={saveState}
                            required
                          />
                          <label className="form-check-label" htmlFor="inApp">
                            InApp QR
                          </label>
                        </div>
                      </div>

                      <div className="mb-3">
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          disabled={
                            props.type === "Register"
                              ? operatorExist
                              : !operatorExist
                          }
                          fullWidth
                        >
                          {props.type}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="hero-right order-1 col-lg-6 order-lg-2">
                  <img
                    role="presentation"
                    className="main"
                    alt=""
                    src="https://webauthn.io/dist/images/header-illi.svg"
                  />
                </div>
              </div>
            </div>
          </div>

          <Modal
            isVisible={showModal}
            closeModal={closeModal}
            image={user.qr}
          />
        </div>
        <p
          className="text-center w-100"
          style={{ position: "absolute", zIndex: 999, fontSize: 15 }}
        >
          PasswordLess © Blue Bricks Pty. Ltd.
        </p>
      </div>
    </div>
  );
}
