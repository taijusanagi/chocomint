import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Modal, ModalProps } from "./Modal";

const args: ModalProps = {
  icon: "🎉",
  messageText: "Your NFT is Registered!",
  buttonText: "Check",
  url: "/",
};

export default {
  title: "Molecules/Modal",
  component: Modal,
  args,
};

export const Control: React.FC<ModalProps> = (props) => (
  <MemoryRouter>
    <Modal {...props} />
  </MemoryRouter>
);
