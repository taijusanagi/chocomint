import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export interface ModalProps {
  icon: string;
  children: React.ReactNode;
  onClickDismiss?: () => void;
}

export const Modal: React.FC<ModalProps> = ({ children, icon, onClickDismiss }) => {
  return (
    <section className="fixed z-10 inset-0">
      <div className="flex p-4 items-center justify-center min-h-screen text-center">
        <div
          onClick={onClickDismiss}
          className="absolute inset-0 overflow-hidden bg-black opacity-40"
        ></div>
        <div className="bg-white solidity p-6 px-4 transform max-w-lg w-full">
          <p className="focus:outline-none absolute left-4 top-2 text-gray-400">{icon}</p>
          <button
            onClick={onClickDismiss}
            className="focus:outline-none absolute right-4 top-2 text-gray-400"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          {children}
        </div>
      </div>
    </section>
  );
};
