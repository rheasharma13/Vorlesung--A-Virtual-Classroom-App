import React, { useEffect,useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";
import { auth, signInWithGoogle } from "../firebase";
import "./Home.css";


import { Header } from "../components/Header";
import { Features } from "../components/Features";
import { About } from "../components/About";
import Navigation from "../components/Navigation"

import JsonData from "../data/data.json";
import SmoothScroll from "smooth-scroll";
import "../App.css"



export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const Home = () => {
  const [user, loading, error] = useAuthState(auth);
  const history = useHistory();

  useEffect(() => {
    if (loading) return;
    if (user) history.push("/dashboard");
  }, [loading, user]);

  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <div>
      <Navigation />
      <Header data={landingPageData.Header} signIn={signInWithGoogle} />
      <Features data={landingPageData.Features} />
      <About data={landingPageData.About} />
     
      
      
    </div>
  );
};



export default Home;
