import React from "react";
import { useHistory } from "react-router-dom";

import { Body } from "../components/atoms/Body";
import { Container } from "../components/atoms/Container";

import { Hero } from "../components/molecules/Hero";

import { Footer } from "../components/organisms/Footer";
import { Header } from "../components/organisms/Header";

export const Home: React.FC = () => {
  const history = useHistory();

  const onClockHero = () => {
    history.push("/create");
  };

  return (
    <Body>
      <Header />
      <Hero src="/ogp.png" onClick={onClockHero} />
      <Container>container</Container>
      <Footer />
    </Body>
  );
};

export default Home;
