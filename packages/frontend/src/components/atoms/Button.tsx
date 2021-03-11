import React from "react";

export interface ButtonProps {
  type: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ type, disabled, onClick, children }) => {
  return type === "primary" ? (
    <button
      onClick={onClick}
      disabled={disabled}
      className="disabled:opacity-50 focus:outline-none w-full bg-green-500 text-white font-medium p-4 border-b-2 shadow-md rounded-xl border-green-600"
    >
      {children}
    </button>
  ) : type === "secondary" ? (
    <button
      onClick={onClick}
      disabled={disabled}
      className="disabled:opacity-50 focus:outline-none w-full bg-gray-700 text-white font-medium p-4 order-b-2 shadow-md rounded-xl border-gray-800"
    >
      {children}
    </button>
  ) : type === "tertiary" ? (
    <button
      onClick={onClick}
      disabled={disabled}
      className="disabled:opacity-50 focus:outline-none w-full bg-gray-100 text-gray-600 font-medium p-4 solidity"
    >
      {children}
    </button>
  ) : (
    <></>
  );
};
