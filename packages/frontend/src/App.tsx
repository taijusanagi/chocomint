import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Create from "./pages/create";

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Create />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
