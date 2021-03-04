import React from "react";

import { ChildrenProps } from "../utils";

export interface ClickableProps extends ChildrenProps {
  onClick?: () => void;
}

export const Clickable: React.FC<ClickableProps> = ({ children, onClick }) => {
  return (
    <div className="cursor-pointer" onClick={onClick}>
      {children}
    </div>
  );
};
