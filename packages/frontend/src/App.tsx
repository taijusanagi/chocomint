import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { RecoilRoot } from "recoil";

import Register from "./pages/register";
import Box from "./pages/box";
import NFT from "./pages/nft";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <Router>
        <Switch>
          <Route path="/register" exact>
            <Register />
          </Route>
          <Route path="/box" exact>
            <Box />
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
