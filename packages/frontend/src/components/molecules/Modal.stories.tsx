import React from "react";

import { Modal, ModalProps } from "./Modal";

const args: ModalProps = {
  children: "Your NFT is Registered!",
};

export default {
  title: "Molecules/Modal",
  component: Modal,
  args,
};

export const Control: React.FC<ModalProps> = (props) => <Modal {...props} />;
