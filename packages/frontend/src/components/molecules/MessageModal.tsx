import React from "react";
import { Link } from "react-router-dom";

import { Button } from "../atoms/Button";
import { Modal } from "../atoms/Modal";

export interface MessageModalProps {
  icon: string;
  messageText: string;
  buttonText?: string;
  url?: string;
  newTab?: boolean;
  onClickDismiss?: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  icon,
  messageText,
  buttonText,
  url,
  newTab,
  onClickDismiss,
}) => {
  return (
    <Modal onClickDismiss={onClickDismiss} icon={icon}>
      <p className="my-8 text-sm font-medium text-gray-600">{messageText}</p>
      {url && (
        <div className="flex justify-center">
          <div className="w-6/12">
            {newTab ? (
              <a href={url} target="_blank" rel="noreferrer">
                <Button type="tertiary">{buttonText}</Button>
              </a>
            ) : (
              <Link to={url}>
                <Button type="tertiary">{buttonText}</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export const useMessageModal = () => {
  const [messageModal, setModal] = React.useState<MessageModalProps | undefined>(undefined);

  const openModal = (
    icon: string,
    messageText: string,
    buttonText?: string,
    url?: string,
    newTab?: boolean
  ) => {
    setModal({
      icon,
      messageText,
      buttonText,
      url,
      newTab,
    });
  };

  const closeModal = () => {
    setModal(undefined);
  };

  return { messageModal, openModal, closeModal };
};
