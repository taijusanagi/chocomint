import React from "react";
import { Hero, HeroProps } from "./Hero";

const args: HeroProps = {
  src: "/hero.png",
};

export default {
  title: "Molecules/Hero",
  component: Hero,
  args,
};

export const Control: React.FC<HeroProps> = (props) => <Hero {...props} />;
