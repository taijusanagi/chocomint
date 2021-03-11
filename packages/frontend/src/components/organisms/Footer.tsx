import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="text-center font-medium p-4 text-xs text-gray-400 font-way">
      <Link to="/">@chocomint</Link>
    </footer>
  );
};
