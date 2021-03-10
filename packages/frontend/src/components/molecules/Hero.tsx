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
          <img
            className={`max-w-96 max-h-80 cursor-pointer mt-6 mb-3 ${
              src.match(new RegExp("hero.png")) ? "" : "solidity"
            }`}
            src={src}
          />
          <div className="mx-auto py-4">
            <div className="flex items-center justify-center sm:px-1">
              {src.match(new RegExp("hero.png")) ? (
                <Button type="tertiary" onClick={onClick}>
                  Get started
                </Button>
              ) : (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="http://twitter.com/share?text=text goes here&url=http://url goes here&hashtags=hashtag1,hashtag2,hashtag3"
                >
                  <span className="rounded-full bg-gray-100 text-gray-600 font-medium p-2 shadow-md">
                    <FontAwesomeIcon className="text-blue-400" icon={faTwitter} />
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
