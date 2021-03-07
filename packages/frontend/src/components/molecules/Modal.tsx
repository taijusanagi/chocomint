import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export interface ModalProps {
  children: React.ReactNode;
  onClickDismiss?: () => void;
}

export const Modal: React.FC<ModalProps> = ({ children, onClickDismiss }) => {
  return (
    <div className="fixed z-10 inset-0">
      <div className="flex p-4 items-center justify-center min-h-screen text-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-500 opacity-50"></div>
        <div className="bg-white border-b-2 border-gray-500 shadow-md rounded-xl p-6 px-4 transform max-w-lg w-full">
          <button
            onClick={onClickDismiss}
            className="focus:outline-none absolute right-4 top-2 text-gray-400"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className="my-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
