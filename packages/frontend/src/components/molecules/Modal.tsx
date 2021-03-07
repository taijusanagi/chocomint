import React from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { Button } from "../atoms/Button";

export interface ModalProps {
  text: string;
  url?: string;
  newTab?: boolean;
  onClickDismiss?: () => void;
}

export const Modal: React.FC<ModalProps> = ({ text, url, newTab, onClickDismiss }) => {
  return (
    <div className="fixed z-10 inset-0">
      <div className="flex p-4 items-center justify-center min-h-screen text-center">
        <div
          onClick={onClickDismiss}
          className="absolute inset-0 overflow-hidden bg-black opacity-40"
        ></div>
        <div className="bg-white border-b-2 border-gray-500 shadow-md rounded-xl p-6 px-4 transform max-w-lg w-full">
          <button
            onClick={onClickDismiss}
            className="focus:outline-none absolute right-4 top-2 text-gray-400"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <p className="my-8 text-gray-600 text-sm">{text}</p>
          {url && (
            <>
              {newTab ? (
                <a href={url} target="_blank" rel="noreferrer">
                  <Button type="tertiary">
                    Check <span className="ml-1">👀</span>
                  </Button>
                </a>
              ) : (
                <Link to={url}>
                  <Button type="tertiary">
                    Check <span className="ml-1">👀</span>
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
