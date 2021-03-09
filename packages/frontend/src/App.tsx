import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { RecoilRoot } from "recoil";

import Box from "./pages/box";
import Create from "./pages/create";
import Home from "./pages/index";
import NFT from "./pages/nft";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <Router>
        <Switch>
          <Route path="/box/:address" exact>
            <Box />
          </Route>
          <Route path="/create" exact>
            <Create />
          </Route>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/nft/:hash" exact>
            <NFT />
          </Route>
        </Switch>
      </Router>
    </RecoilRoot>
  );
};

export default App;
