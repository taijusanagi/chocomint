import React from "react";

import { RecoilRoot } from "recoil";
import { Header } from "./Header";

export default {
  title: "Organisms/Header",
  component: Header,
};

export const Control: React.FC = () => (
  <RecoilRoot>
    <Header />{" "}
  </RecoilRoot>
);
