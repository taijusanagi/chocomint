import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Asset from "./pages/asset";
import Create from "./pages/create";
const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/asset" exact>
          <Asset />
        </Route>
        <Route path="/create" exact>
          <Create />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
