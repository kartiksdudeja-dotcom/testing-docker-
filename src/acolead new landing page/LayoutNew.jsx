import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import RealEstateHero from './RealEstateHero';
import HomePage from './HomePage';
import ImgSection from './ImgSection';
import Mission from './Mission';
import KeyFeatures from './KeyFeatures';
import HorizontalBar from './HorizontalBar';
import BlogSection from './BlogSection';
import Plans from './Plans';
import BookDemo from './BookDemo';
import Footer from './Footer';
import ProductModules from '../new components/acolead-modules/ProductModules';
import ClientLogosMarquee from './ClientLogosMarquee';

const LayoutNew = () => {
    const aboutRef = useRef(null);
    const homeRef = useRef(null);
    const plansRef = useRef(null);
    const featuesRef = useRef(null);
    const insightsRef = useRef(null);
    const [country, setCountry] = useState('IN');
    const formRef = useRef(null);
    const formSectionRef = useRef(null);
    const location = useLocation();

    const handleScrollToForm = () => {
        if (formSectionRef.current) {
            const top =
                formSectionRef.current.getBoundingClientRect().top +
                window.pageYOffset -
                80;

            window.scrollTo({
                top,
                behavior: "smooth",
            });

            setTimeout(() => {
                formRef.current?.focusFirstField?.();
            }, 600);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        if (params.get('demo') === 'true') {
            setTimeout(() => {
                handleScrollToForm();
            }, 300);
        }
    }, [location.search]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        if (section) {
            setTimeout(() => {
                const map = {
                    home: homeRef,
                    about: aboutRef,
                    feature: featuesRef,
                    insights: insightsRef,
                    plans: plansRef,
                };
                const element = map[section]?.current;
                if (element) {
                    const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({
                        top: topOffset,
                        behavior: 'smooth',
                    });
                }
            }, 300);
        } else if (!params.get('demo')) {
            window.scrollTo(0, 0);
        }
    }, [location.search]);

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header
                scrollToSection={(section) => {
                    const map = {
                        home: homeRef,
                        about: aboutRef,
                        feature: featuesRef,
                        insights: insightsRef,
                        plans: plansRef,
                    };

                    const element = map[section]?.current;
                    if (element) {
                        const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 80;
                        window.scrollTo({
                            top: topOffset,
                            behavior: 'smooth',
                        });
                    }
                }}
                handleScrollToForm={handleScrollToForm}
                country={country}
                setCountry={setCountry}
            />

            {/* REAL ESTATE CRM SOFTWARE HERO (PLACED ABOVE) */}
            <Box ref={homeRef}>
                <RealEstateHero handleScrollToForm={handleScrollToForm} />
            </Box>

            {/* PREVIOUS EXISTING CODE & SECTIONS (PRESERVED INTACT) */}
            <Box>
                <HomePage handleScrollToForm={handleScrollToForm} />
            </Box>

            {/* TRUSTED BY REAL ESTATE BUSINESSES CLIENT LOGO PIPELINE */}
            <ClientLogosMarquee />

            <ProductModules />

            <Box>
                <ImgSection aboutRef={aboutRef} />
            </Box>

            <Mission />

            <Box ref={featuesRef}>
                <KeyFeatures />
            </Box>

            <HorizontalBar />

            <Box ref={insightsRef}>
                <BlogSection />
            </Box>

            <BookDemo
                ref={formRef}
                formSectionRef={formSectionRef}
            />

            <Footer
                handleScrollToForm={handleScrollToForm}
                scrollToSection={(section) => {
                    const map = {
                        home: homeRef,
                        about: aboutRef,
                        feature: featuesRef,
                        insights: insightsRef,
                        plans: plansRef,
                    };

                    const element = map[section]?.current;
                    if (element) {
                        const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 80;
                        window.scrollTo({
                            top: topOffset,
                            behavior: 'smooth',
                        });
                    }
                }}
            />
        </Box>
    );
};

export default LayoutNew;
