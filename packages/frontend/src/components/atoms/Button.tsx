import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  type: "primary" | "secondary" | "red" | "green";
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, type, onClick }) => {
  return type === "primary" ? (
    <button
      onClick={onClick}
      className={`py-2 px-4 w-full rounded font-medium text-white text-sm focus:outline-none bg-blue-400`}
    >
      {children}
    </button>
  ) : type === "secondary" ? (
    <button
      onClick={onClick}
      className={`py-2 px-4 w-full rounded font-medium text-white text-sm focus:outline-none bg-gray-300`}
    >
      {children}
    </button>
  ) : type === "red" ? (
    <button
      className={`py-2 px-4 w-full rounded font-medium text-white text-sm focus:outline-none bg-red-400`}
    >
      {children}
    </button>
  ) : type === "green" ? (
    <button
      onClick={onClick}
      className={`py-2 px-4 w-full rounded font-medium text-white text-sm focus:outline-none bg-green-300`}
    >
      {children}
    </button>
  ) : (
    <></>
  );
};
