import React, { ReactNode } from "react";
import { Button } from "../atoms/Button";

export interface ModalProps {
  children: ReactNode;
  type: "single" | "wide";
  execColor?: "primary" | "green" | "red";
  closeColor?: "secondary";
  execValue?: string;
  closeValue?: string;
  onClickExec?: () => void;
  onClickClose?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  type,
  execColor,
  closeColor,
  execValue,
  closeValue,
  onClickExec,
  onClickClose,
}) => {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          className="inline-block align-bottom bg-white rounded-lg px-4 pt-2 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div>{children}</div>
          {type === "single" ? (
            <div className="mt-8 sm:mt-6">
              <div className="sm:col-start-2">
                <div className="inline-flex justify-center w-full">
                  <Button type={execColor ? execColor : "green"}>
                    {execValue}
                  </Button>
                </div>
              </div>
            </div>
          ) : type === "wide" ? (
            <div className="mt-8 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <div className="sm:col-start-2">
                <div className="w-full inline-flex justify-center">
                  <Button
                    type={execColor ? execColor : "green"}
                    onClick={onClickExec}
                  >
                    {execValue}
                  </Button>
                </div>
              </div>
              <div className="mt-3 sm:mt-0 sm:col-start-1">
                <div className="w-full inline-flex justify-center">
                  <Button type={closeColor ? closeColor : "secondary"}>
                    {closeValue}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};
