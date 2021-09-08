import { useEffect, useState } from "react";
import styles from "./approve.module.css";
import { registerOrgWithFido ,loginOrgWithFido} from "../../Helper/Fido2Auth";

import { AccessTime, Devices, LocationOn } from "@material-ui/icons";
import Axios from "../../Helper/Axios";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import socket from "../../Helper/SocketIOConfig"
export default function Approve(props) {
  const [errorMessage, setErrorMessage] = useState("");
  const [fidoSupported, setFidoSupported] = useState(true);
  const [error,setError] = useState({
    status:false,
    message:""
  })

  const { accessToken } = useParams();
  useEffect(() => {
    detectWebAuthnSupport();
    verifyToken(accessToken);
  }, [accessToken]);

  const [data, setData] = useState({
    type: "",
  });
  const [loading, setLoading] = useState(false);

  const verifyToken = async (accessToken) => {
    try {
      setLoading(true);
      const response = await Axios.post("verifyToken", { accessToken });
      let { type, longitude, latitude,id } = response.data;

      if (type === 1) response.data.type = "Register";
      else response.data.type = "Login";
      const src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyCQpzHi4jygLfaeksgPB3HSlKduF8YD5Hw&q=${latitude},${longitude}&zoom=15"`;
      response.data.src = src;
      setData(response.data);
      socket.emit("join",{id})
      setLoading(false);
    } catch (error) {
      let errorMsg = error.message;
      if (error?.response?.data?.errorMessage)
        errorMsg = error?.response?.data?.errorMessage;

      setError({status:true,message:errorMsg});

      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return;
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const registerForm = (e) => {
    e.preventDefault();

    register(data);
  };
  const loginForm = (e) => {
    e.preventDefault();

    login(data);
  };

  const login = async (user) => {
    try {
      const data = await loginOrgWithFido(user);
      socket.emit("login-response",data);
    } catch (error) {
      socket.emit("decline-process",{errorMessage:error.message})
    }
  };

  const register = async (user) => {
    try {
      const data = await registerOrgWithFido(user);
      socket.emit("registration-response",data);
    } catch (error) {
      console.log(error);
      socket.emit("decline-process",{errorMessage:error.message})
    }
  };


  const decline = () =>{
    socket.emit("decline-process",{errorMessage:"User declined Process !!"})
    window.close();
  }

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
    <div className={styles.wrapper}>
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
        <div className="container h-100">
          <div className="row h-100 d-flex justify-content-center align-items-center">
            <div className="col-lg-6 col-sm-12 col-md-6">
              
              
              <div className="card">
                <form
                  onSubmit={
                    data.type === "Login" || data.type === "login"
                      ? loginForm
                      : registerForm
                  }
                >
                  <h4 className="card-header text-center">
                    Passwordless {data.type}
                  </h4>
                  <div className="card-body">
                    <div className="form h-100 contact-wrap pt-4">
                      {error.status ?<p className="text-center">{error.message}</p>:
                      <>
                      <div className="row">
                        
                        <h3 className="logo-font-style text-center">Logo</h3>
                        
                        <div className="col-12">
                          <p className="mb-1">
                            <span className="mr-2">
                              <AccessTime />
                            </span>
                            <b>Request Time</b>
                          </p>
                          <h6 style={{ fontSize: 14 }}>
                            {data && formatDate(data.reqTime)}
                          </h6>
                        </div>
                      </div>
                      <hr className="my-1" />
                      <div className="row p-2">
                        <div className="col-12">
                          <p className="mb-1">
                            <span className="mr-2">
                              <Devices />
                            </span>
                            <b>Requesting Device</b>
                          </p>
                          <h6 style={{ fontSize: 14 }}>{data.device}</h6>
                        </div>
                      </div>
                      <hr className="my-1" />

                      <div className="row">
                        <div className="col-12">
                          <p className="mb-2">
                            <span className="mr-2">
                              <LocationOn />
                            </span>
                            <b>Location</b>
                          </p>
                          <div className={styles.mapResponsive}>
                            <iframe
                              id="map"
                              src={data.src}
                              width="600"
                              height="450"
                              frameBorder="0"
                              style={{ border: 0 }}
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                      </div>
                      </>}
                    </div>
                  </div>
                  <div className="card-footer">
                   <div className="row">
                      <div className="d-flex justify-content-around">
                        <button
                        type="button"
                          className="btn rounded-0 btn-outline-primary py-2"
                          onClick={decline}
                        >
                          Deny
                        </button>
                        <button
                          type="submit"
                          className="btn rounded-0 btn-primary py-2"
                          disabled={error.status && !fidoSupported}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
