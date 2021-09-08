import "./signup.css";
import { useEffect, useState } from "react";
import { CircularProgress, Button } from "@material-ui/core";

import socket from "../../Helper/SocketIOConfig";

import Modal from "../Modal";

import { registerOrgWithFido, loginOrgWithFido } from "../../Helper/Fido2Auth";
import { generateQRCode, sendMail, getOS } from "../../Helper/Util";
import { nanoid } from "nanoid";
import Axios from "../../Helper/Axios";
import React from "react";
import {useHistory} from "react-router-dom"
export default function Register(props) {
  const [errorMessage, setErrorMessage] = useState("");
  const [fidoSupported, setFidoSupported] = useState(true);
  const [loading, setLoading] = useState(false);

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
    detectWebAuthnSupport();

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
    const { email, name, uniqueId } = data;

    try {
      const response = await Axios.post("generateEmailToken", {
        email,
        name,

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
       pathname:"/mailSentSuccess",
       state: { email,name,accessToken }
      })

     
    } catch (error) {
      console.log(error);
    }
  };

  const saveState = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
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
        name:user.name,
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
      if (data.verified) generateTokenAndSendMail(data.uniqueId);
    } catch (error) {
      console.log(error);
    }
  };

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

  function detectWebAuthnSupport() {
    let errorMessage;
    if (
      window.PublicKeyCredential === undefined ||
      typeof window.PublicKeyCredential !== "function"
    ) {
      errorMessage =
        "⚠️ Oh no! This browser doesn't currently support WebAuthn.";

      setFidoSupported(false);
      setErrorMessage(errorMessage);
    } else {
      if (
        window.location.protocol === "http:" ||
        window.location.hostname !== "localhost" ||
        window.location.hostname !== "127.0.0.1"
      ) {
        errorMessage =
          '⚠️ WebAuthn only supports secure connections. For testing over HTTP, you can use the origin "localhost".';

        setFidoSupported(false);
        setErrorMessage(errorMessage);
      }
    }
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
                        <div className="form-group">
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
                      <div className="form-group">
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          placeholder="example@domain.com"
                          name="email"
                          required
                          onChange={saveState}
                        />
                      </div>

                      <div className=" form-check mb-3">
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
                          disabled={loading}
                          fullWidth
                        >
                          {props.type}
                        </Button>
                      </div>
                    </div>
                  </form>

                  {!fidoSupported && <p>{errorMessage}</p>}
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
