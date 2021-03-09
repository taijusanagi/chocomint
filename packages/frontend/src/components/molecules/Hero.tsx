import React from "react";

export interface HeroProps {
  onClick?: () => void;
  src: string;
}

export const Hero: React.FC<HeroProps> = ({ src, onClick }) => {
  return (
    <section>
      <div className="w-full">
        <div className="flex flex-col items-center mx-auto bg-gradient-to-r from-green-100 via-blue-100 to-green-100 p-8">
          <img onClick={onClick} className="max-w-96 max-h-80 cursor-pointer solidity" src={src} />
        </div>
      </div>
    </section>
  );
};
