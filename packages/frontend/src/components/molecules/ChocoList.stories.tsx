import React from "react";
import { MemoryRouter } from "react-router-dom";

import { ChocoList, ChocoListProps } from "./ChocoList";

import { Choco } from "../../types";

// TODO: add test data later
const args: ChocoListProps = {
  chocos: [],
};

export default {
  title: "Molecules/ChocoList",
  component: ChocoList,
  args,
};

export const Control: React.FC<ChocoListProps> = (props) => (
  <MemoryRouter>
    <ChocoList {...props} />
  </MemoryRouter>
);
