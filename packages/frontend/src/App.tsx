import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { RecoilRoot } from "recoil";

import Create from "./pages/create";
import Box from "./pages/box";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <Router>
        <Switch>
          <Route path="/create" exact>
            <Create />
          </Route>
          <Route path="/box" exact>
            <Box />
          </Route>
        </Switch>
      </Router>
    </RecoilRoot>
  );
};

export default App;
