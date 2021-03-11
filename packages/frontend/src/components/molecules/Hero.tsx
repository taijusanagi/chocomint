import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../atoms/Button";
import { Shares } from "../molecules/Shares";
export interface HeroProps {
  src: string;
}

export const Hero: React.FC<HeroProps> = ({ src }) => {
  return (
    <section>
      <div className="w-full">
        <div className="flex flex-col items-center mx-auto bg-gradient-to-r from-green-400 via-blue-100 to-green-400 p-8">
          <img className="max-w-96 max-h-80 mt-6 mb-3" src={src} />
          <div className="mx-auto py-4">
            <div className="flex items-center justify-center sm:px-1 space-x-4 mb-2">
              <Link to="/create" className="w-32">
                <Button type="primary">CreateNFT</Button>
              </Link>
              <a href="https://docs.chocomint.app" className="w-32">
                <Button type="tertiary">Docs</Button>
              </a>
            </div>
          </div>
          <Shares />
        </div>
      </div>
    </section>
  );
};
