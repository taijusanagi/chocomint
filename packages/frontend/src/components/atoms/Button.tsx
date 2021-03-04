import React from "react";

import { ChildrenProps, AllowedMargin } from "../utils";

export interface ButtonProps extends ChildrenProps {
  type: "primary" | "secondary" | "red" | "green";
  margin?: AllowedMargin;
}

export const Button: React.FC<ButtonProps> = ({ children, type, margin }) => {
  return type === "primary" ? (
    <button
      className={`py-2 px-4 w-full rounded font-medium text-white text-sm focus:outline-none bg-blue-400 ${margin}`}
    >
      {children}
    </button>
  ) : type === "secondary" ? (
    <button
      className={`py-2 px-4 w-full rounded font-medium text-white text-sm focus:outline-none bg-gray-300 ${margin}`}
    >
      {children}
    </button>
  ) : type === "red" ? (
    <button
      className={`py-2 px-4 w-full rounded font-medium text-white text-sm focus:outline-none bg-red-400 ${margin}`}
    >
      {children}
    </button>
  ) : type === "green" ? (
    <button
      className={`py-2 px-4 w-full rounded font-medium text-white text-sm focus:outline-none bg-green-300 ${margin}`}
    >
      {children}
    </button>
  ) : (
    <></>
  );
};
