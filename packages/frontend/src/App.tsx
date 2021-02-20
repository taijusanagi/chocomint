import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Asset from "./pages/asset";
import Create from "./pages/create";
import Gallery from "./pages/gallery";
import Mypage from "./pages/mypage";

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/asset/:cid" exact>
          <Asset />
        </Route>
        <Route path="/create" exact>
          <Create />
        </Route>
        <Route path="/gallery/:did" exact>
          <Gallery />
        </Route>
        <Route path="/mypage" exact>
          <Mypage />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
