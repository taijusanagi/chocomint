import React from "react";

import { Test } from "./test";

const args = {
  onClickClose: () => {
    console.log("clicked");
  },
  children: "",
};

export default {
  title: "Test",
  component: Test,
  args,
};

export const Control: React.FC = (props) => (
  <Test {...props}>{props.children}</Test>
);
