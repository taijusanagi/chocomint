import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Create from "./pages/create";
import Box from "./pages/box";

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/create" exact>
          <Create />
        </Route>
        <Route path="/box/:address" exact>
          <Box />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
