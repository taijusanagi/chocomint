import React from "react";

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
  <Button {...props}>{props.children}</Button>
);
