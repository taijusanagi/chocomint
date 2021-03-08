import React from "react";

export interface ContainerProps {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className="flex justify-center flex-grow container mx-auto">{children}</div>;
};
