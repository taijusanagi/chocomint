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
      className="disabled:opacity-50 focus:outline-none w-full rounded-xl max-w-md bg-green-500 text-white text-sm font-bold py-2 px-4 border-b-2 border-green-600 shadow-md"
    >
      {children}
    </button>
  ) : type === "secondary" ? (
    <button
      onClick={onClick}
      disabled={disabled}
      className="disabled:opacity-50 focus:outline-none w-full rounded-xl max-w-md bg-gray-300 text-white text-sm font-bold py-2 px-4 border-b-2 border-gray-400 shadow-md"
    >
      {children}
    </button>
  ) : type === "tertiary" ? (
    <button
      onClick={onClick}
      disabled={disabled}
      className="disabled:opacity-50 focus:outline-none w-full rounded-xl max-w-md bg-gray-100 text-sm font-medium text-gray-600 py-2 px-4 border-b-2 border-gray-400 shadow-md"
    >
      {children}
    </button>
  ) : (
    <></>
  );
};
