import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import VerifyEmail from "./Components/VerifyEmail";
import Dashboard from "./Components/Dashboard";

import NotFound from "./Components/NotFound/index";
import Signup from "./Components/Signup";
import { useEffect, useState } from "react";
import Axios from "./Helper/Axios";
import { BarLoader } from "react-spinners";
import Approve from "./Components/Approve";
import MailSent from "./Components/ActivationPage";

const App = () => {
  const [subDomain, setSubDomain] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subDomainExist, setSubDomainExist] = useState(false);
  useEffect(() => {
    const host = window.location.host;
    const arr = host.split(".").slice(0, host.includes("localhost") ? -1 : -2);

    if (arr.length > 0 && arr[0] !== "www") {
      if (arr[0] !== "home") {
        setLoading(true);
        setSubDomain(arr[0]);

        setSubDomainExist(true);

        checkSubdomain(arr[0]);
      }
    } else setLoading(false);
  }, []);

  const checkSubdomain = async (name) => {
    Axios.get(`checkSubdomain/${name}`)
      .then((response) => {
        setLoading(false);
        const { errorCode } = response.data;
        if (errorCode === -1) setRedirect(true);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        setRedirect(true);
      });
  };

  return (
    <>
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
        <div className="App">
          {redirect ? (
            <NotFound />
          ) : (
            <Router>
              <Switch>
                {subDomainExist ? (
                  <Route
                    exact
                    path="/"
                    component={() => <Dashboard sub={subDomain} />}
                  />
                ) : (
                  <Route exact path="/">
                    <Signup type="Register" />
                  </Route>
                )}

                <Route exact path="/login">
                  <Signup type="Login" />
                </Route>

                <Route exact path="/approve/:accessToken">
                  <Approve />
                </Route>
                <Route
                  path="/verifyEmail/:accessToken"
                  component={() => <VerifyEmail />}
                />
                <Route path="/mailSentSuccess" component={MailSent} />

                <Route component={NotFound} />
              </Switch>
            </Router>
          )}
        </div>
      )}
    </>
  );
};

export default App;
