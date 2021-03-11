import React from "react";
import { MemoryRouter } from "react-router-dom";
import { MessageModal, MessageModalProps } from "./MessageModal";

const args: MessageModalProps = {
  icon: "🎉",
  messageText: "Your NFT is Registered!",
  buttonText: "Check",
  url: "/",
};

export default {
  title: "Molecules/MessageModal",
  component: MessageModal,
  args,
};

export const Control: React.FC<MessageModalProps> = (props) => (
  <MemoryRouter>
    <MessageModal {...props} />
  </MemoryRouter>
);
