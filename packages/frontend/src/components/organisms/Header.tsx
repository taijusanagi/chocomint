import React from "react";

import { Button } from "../atoms/Button";

export const Header: React.FC = () => {
  return (
    <header>
      <div className="relative">
        <div className="absolute right-0">
          <Button type="secondary">Connect Wallet</Button>
        </div>
      </div>
    </header>
  );
};
