import React from "react";
import { Button } from "../atoms/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";

export interface HeroProps {
  type?: "top" | "nft";
  onClick?: () => void;
  src: string;
}

export const Hero: React.FC<HeroProps> = ({ type, src, onClick }) => {
  return (
    <section>
      <div className="w-full">
        {type === "nft" ? (
          <div className="flex flex-col items-center mx-auto bg-gradient-to-r from-green-200 via-blue-100 to-green-200 p-8">
            <img
              onClick={onClick}
              className="max-w-96 max-h-80 cursor-pointer solidity"
              src={src}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center mx-auto bg-gradient-to-r from-green-400 via-blue-100 to-green-400 p-8">
            <img className="max-w-96 max-h-80 cursor-pointer mt-6 mb-3" src={src} />
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <div className="flex items-center justify-center px-4 py-3 sm:px-8">
                <Button type="tertiary" onClick={onClick}>
                  Get started
                </Button>
              </div>
              <div className="flex items-center justify-center px-4 py-3 sm:px-8">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="http://twitter.com/share?text=text goes here&url=http://url goes here&hashtags=hashtag1,hashtag2,hashtag3"
                >
                  <span className="rounded-full bg-gray-100 text-gray-600 font-medium p-2 shadow-md">
                    <FontAwesomeIcon className="text-blue-400" icon={faTwitter} />
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
