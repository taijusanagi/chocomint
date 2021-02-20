import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Create from "./pages/create";
import Profile from "./pages/gallery";
import Asset from "./pages/asset";

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/create" exact>
          <Create />
        </Route>
        <Route path="/gallery/:did" exact>
          <Profile />
        </Route>
        <Route path="/asset/:cid" exact>
          <Asset />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
