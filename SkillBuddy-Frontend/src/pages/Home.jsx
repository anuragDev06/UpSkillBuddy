import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { NavLink } from 'react-router';
import ATSscore from '../Features/ATSscore.jsx';
import Benefits from '../Sections/Benefits.jsx'
import Hero from '../Sections/Hero.jsx';
import HowItWork from '../Sections/HowItWork.jsx'
import ProductSS from '../Sections/ProductSS.jsx'

import CTA from '../Sections/CTA.jsx'
import Features from '../Sections/Features.jsx';

const Home = () => {

    return (
        <>
            <Hero />
            <Features />
            <Benefits />
            <HowItWork />
            <ProductSS />
            <CTA />
        </>
    )
};

export default Home;