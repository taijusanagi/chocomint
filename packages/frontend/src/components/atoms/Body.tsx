import React from "react";

export interface BodyProps {
  children: React.ReactNode;
}

export const Body: React.FC<BodyProps> = ({ children }) => {
  return <div className="mx-auto h-screen bg-white flex flex-col">{children}</div>;
};
