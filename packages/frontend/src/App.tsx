import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Index from "./pages/index";
import Account from "./pages/account";
import Create from "./pages/create";
import Order from "./pages/order";

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Index />
        </Route>
        <Route path="/accunt" exact>
          <Account />
        </Route>
        <Route path="/create" exact>
          <Create />
        </Route>
        <Route path="/order" exact>
          <Order />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
