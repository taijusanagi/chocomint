import React from "react";
import { Button } from "../atoms/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";

export interface HeroProps {
  onClick?: () => void;
  src: string;
}

export const Hero: React.FC<HeroProps> = ({ src, onClick }) => {
  return (
    <section>
      <div className="w-full">
        <div className="flex flex-col items-center mx-auto bg-gradient-to-r from-green-400 via-blue-100 to-green-400 p-8">
          <img className="max-w-96 max-h-80 mt-6 mb-3" src={src} />
          <div className="mx-auto py-4">
            <div className="flex items-center justify-center sm:px-1">
              <Button type="tertiary" onClick={onClick}>
                Create NFT
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
