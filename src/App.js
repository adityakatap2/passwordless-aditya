import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import verifyEmail from "./Components/VerifyEmail/VerifyEmail";

const App = () => {

  return(
    <Router>
      <Switch>
        
        <Route path = "/verifyEmail/:accessToken" component={verifyEmail}/>
      </Switch>
    </Router>
  )
};

export default App;
