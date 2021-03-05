import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { RecoilRoot } from "recoil";

import Create from "./pages/create";
import Gellery from "./pages/gellery";
import Mypage from "./pages/mypage";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <Router>
        <Switch>
          <Route path="/create" exact>
            <Create />
          </Route>
          <Route path="/gellery/:address" exact>
            <Gellery />
          </Route>
          <Route path="/gellery/:address" exact>
            <Gellery />
          </Route>
          <Route path="/mypage" exact>
            <Mypage />
          </Route>
        </Switch>
      </Router>
    </RecoilRoot>
  );
};

export default App;
