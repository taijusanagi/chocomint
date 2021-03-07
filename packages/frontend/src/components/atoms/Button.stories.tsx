import React from "react";

import { RecoilRoot } from "recoil";
import { Button, ButtonProps } from "./Button";

const args: ButtonProps = {
  type: "primary",
  children: "Body",
};

export default {
  title: "atoms/Body",
  component: Button,
  args,
};

export const Control: React.FC<ButtonProps> = (props) => (
  <RecoilRoot>
    <Button {...props}>{props.children}</Button>
  </RecoilRoot>
);
