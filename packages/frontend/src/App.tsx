import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { RecoilRoot } from "recoil";

import Create from "./pages/create";
import Box from "./pages/box";
import NFT from "./pages/nft";

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
          <Route path="/nft/:hash" exact>
            <NFT />
          </Route>
        </Switch>
      </Router>
    </RecoilRoot>
  );
};

export default App;
