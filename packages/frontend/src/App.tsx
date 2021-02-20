import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";

import Create from "./pages/create";
import Gallery from "./pages/gallery";
import Mypage from "./pages/mypage";
import Nft from "./pages/nft";

const App: React.FC = () => {
  return (
    <Router basename="/">
      <Switch>
        <Route path="/create" exact>
          <Create />
        </Route>
        <Route path="/gallery/:did" exact>
          <Gallery />
        </Route>
        <Route path="/mypage" exact>
          <Mypage />
        </Route>
        <Route path="/nft/:cid" exact>
          <Nft />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
