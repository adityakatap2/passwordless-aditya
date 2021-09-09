import React,{useState,useEffect} from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Check from "@material-ui/icons/Check";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import StepConnector from "@material-ui/core/StepConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { ConfirmAccount, CreateSubDomain, Success } from "./ConfirmAccount";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";

import Axios from "../../Helper/Axios";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  Container: {
    display: "flex",

    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  paper: {
    minHeight: "6vh",
    minWidth: "80vw",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    padding: 30,
  },
}));
const QontoConnector = withStyles({
  alternativeLabel: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  active: {
    "& $line": {
      borderColor: "#784af4",
    },
  },
  completed: {
    "& $line": {
      borderColor: "#784af4",
    },
  },
  line: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
})(StepConnector);
function QontoStepIcon(props) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {completed ? (
        <Check className={classes.completed} />
      ) : (
        <div className={classes.circle} />
      )}
    </div>
  );
}

QontoStepIcon.propTypes = {
  /**
   * Whether this step is active.
   */
  active: PropTypes.bool,
  /**
   * Mark the step as completed. Is passed to child components.
   */
  completed: PropTypes.bool,
};

const useQontoStepIconStyles = makeStyles({
  root: {
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
  },
  active: {
    color: "#784af4",
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  completed: {
    color: "#784af4",
    zIndex: 1,
    fontSize: 18,
  },
});
export default function VerifyEmail() {
  const [user, setUser] = useState({});

  const { accessToken } = useParams();
  const [error, setError] = useState({
    status: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    setLoading(true);
    Axios.post("verifyEmailToken", { accessToken })
      .then((response) => {
        setLoading(false);
       
        setUser({...response.data });
      })
      .catch((error) => {
        setLoading(false);
        let errorMsg = error.message;
        if (error?.response?.data?.errorMessage)
          errorMsg = error?.response?.data?.errorMessage;

        setError({ status: true, message: errorMsg });
      });
  }, [accessToken, user]);
  const clx = useStyles();

  const [activeStep, setActiveStep] = React.useState(0);

  const steps = getSteps();
  function getSteps() {
    return ["Confirm Account", "Create Business URL", "Success"];
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <ConfirmAccount handleNext={handleNext} user={user} error={error} />;
      case 1:
        return <CreateSubDomain handleNext={handleNext}  />;
      case 2:
        return <Success />

      default:
        return "Unknown step";
    }
  }
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  return (
    <div className={clx.root}>
      <CssBaseline />
      <Container className={clx.Container}>
        <Paper className={clx.paper}>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            style={{ width: "100%" }}
            connector={<QontoConnector />}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
        </Paper>
      </Container>
      <CssBaseline />
    </div>
  );
}
