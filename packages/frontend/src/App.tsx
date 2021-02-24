import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Create from "./pages/create";
import Gallery from "./pages/gallery";
import Nft from "./pages/nft";

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/create" exact>
          <Create />
        </Route>
        <Route path="/gallery/:walletAddress" exact>
          <Gallery />
        </Route>
        <Route path="/nft/:cid" exact>
          <Nft />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
