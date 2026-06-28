'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/common/Navbar';
import Hero from './components/hero';
import About from './components/about';
import Skills from './components/skills';
import Projects from './components/projects';
import Achievements from './components/achievements';
import Resume from './components/resume';
import Contact from './components/contact';
import { siteConfig } from './data/data';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  useEffect(() => {
    gsap.fromTo('main', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });
  }, []);

  return (
    <>
      <div className="sr-only">
        <h1>{siteConfig.title}</h1>
        <p>{siteConfig.description}</p>
      </div>

      <Navbar />
      <main>
        <Hero />
        <Achievements />
        <About />
        <Skills />
        <Projects />
        <Resume />
        <Contact />
      </main>
    </>
  );
};

export default Home;
