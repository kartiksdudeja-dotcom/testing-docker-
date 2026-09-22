import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, useMediaQuery, useTheme, MobileStepper } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import mainimg from './images/mainimg.png';
import calender from './images/calender.png';
import card from './images/card.png';
import sales from './images/sales.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const realEstatePillars = [
    {
        label: 'Lead Management',
        icon: TrackChangesOutlinedIcon,
        accent: '#1677F7',
        description: 'Manage, track, and assign every lead across portals, campaigns, and sources in real-time.',
    },
    {
        label: 'Follow-ups',
        icon: ScheduleOutlinedIcon,
        accent: '#F59E0B',
        description: 'Automate follow-up reminders, task schedules, and site visit coordination effortlessly.',
    },
    {
        label: 'Inventory',
        icon: ApartmentOutlinedIcon,
        accent: '#10B981',
        description: 'Track live tower and unit availability, floor plans, and pricing in real time.',
    },
    {
        label: 'WhatsApp',
        icon: WhatsAppIcon,
        accent: '#25D366',
        description: 'Instant customer communication, brochures, and follow-ups directly on WhatsApp.',
    },
    {
        label: 'Team Management',
        icon: GroupsOutlinedIcon,
        accent: '#8B5CF6',
        description: 'Empower sales executives and channel partners with lead privacy and productivity tools.',
    },
    {
        label: 'Reports',
        icon: BarChartOutlinedIcon,
        accent: '#EC4899',
        description: 'Deep analytics on conversion funnels, agent performance, and closed opportunities.',
    },
];

const RealEstateHero = ({ handleScrollToForm }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [activeStep, setActiveStep] = useState(0);
    const [direction, setDirection] = useState(0);

    const autoPlayTimer = useRef(null);

    const [ref, inView] = useInView({
        threshold: 0.2,
    });

    const slideInVariant = {
        hidden: { opacity: 0, y: -50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 1.2, ease: 'easeOut' },
        },
    };

    const carouselVariant = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            scale: 0.96,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
        exit: (direction) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            scale: 0.96,
            transition: {
                duration: 0.35,
                ease: [0.25, 0.1, 0.25, 1],
            },
        }),
    };

    // Auto-play transitions
    useEffect(() => {
        autoPlayTimer.current = setInterval(() => {
            setDirection(1);
            setActiveStep((prev) => (prev + 1) % realEstatePillars.length);
        }, 4500);

        return () => clearInterval(autoPlayTimer.current);
    }, []);

    const handleMouseEnter = () => {
        clearInterval(autoPlayTimer.current);
    };

    const handleMouseLeave = () => {
        autoPlayTimer.current = setInterval(() => {
            setDirection(1);
            setActiveStep((prev) => (prev + 1) % realEstatePillars.length);
        }, 4500);
    };

    const handleNext = () => {
        setDirection(1);
        setActiveStep((prev) => (prev + 1) % realEstatePillars.length);
        clearInterval(autoPlayTimer.current);
        autoPlayTimer.current = setInterval(() => {
            setDirection(1);
            setActiveStep((prev) => (prev + 1) % realEstatePillars.length);
        }, 4500);
    };

    const handleBack = () => {
        setDirection(-1);
        setActiveStep((prev) => (prev - 1 + realEstatePillars.length) % realEstatePillars.length);
        clearInterval(autoPlayTimer.current);
        autoPlayTimer.current = setInterval(() => {
            setDirection(1);
            setActiveStep((prev) => (prev + 1) % realEstatePillars.length);
        }, 4500);
    };

    const handleDotClick = (index) => {
        setDirection(index > activeStep ? 1 : -1);
        setActiveStep(index);
        clearInterval(autoPlayTimer.current);
        autoPlayTimer.current = setInterval(() => {
            setDirection(1);
            setActiveStep((prev) => (prev + 1) % realEstatePillars.length);
        }, 4500);
    };

    const activePillar = realEstatePillars[activeStep];
    const PillarIcon = activePillar.icon;

    const featureStrip = [
        'Lead Management',
        'Inventory Tracking',
        'WhatsApp Integration',
        'Team Management',
        'Reports & Analytics',
        'Site Visit Scheduling',
        'Channel Partner Portal',
        'Booking Management',
    ];

    const marqueeItems = [...featureStrip, ...featureStrip];

    return (
        <>
            <Box
                sx={{
                    backgroundImage: "url('/images/bg1.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '82vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { xs: 2, sm: 3, md: 4 },
                    py: isMobile ? 4 : 5,
                    position: 'relative',
                    overflow: 'hidden',
                    borderBottom: '1px solid #E2E8F0',
                }}
            >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center',
                    maxWidth: '1240px',
                    width: '100%',
                    gap: { xs: 4, md: 5 },
                }}
            >
                {/* Left Content */}
                <Box
                    sx={{
                        flex: 1.15,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.8,
                        textAlign: isMobile ? 'center' : 'left',
                        minHeight: isMobile ? 'auto' : '470px',
                        justifyContent: 'center',
                        position: 'relative',
                    }}
                    ref={ref}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Badge: REAL ESTATE CRM SOFTWARE */}
                    <motion.div
                        variants={slideInVariant}
                        initial="hidden"
                        animate={inView ? 'visible' : 'hidden'}
                    >
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 2,
                                py: 0.6,
                                borderRadius: '50px',
                                bgcolor: 'rgba(22, 119, 247, 0.08)',
                                border: '1px solid rgba(22, 119, 247, 0.22)',
                                alignSelf: isMobile ? 'center' : 'flex-start',
                                mb: 0.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: '#1677F7',
                                    boxShadow: '0 0 8px #1677F7',
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.82rem' },
                                    fontWeight: 800,
                                    letterSpacing: '1px',
                                    color: '#1677F7',
                                    textTransform: 'uppercase',
                                }}
                            >
                                REAL ESTATE CRM SOFTWARE
                            </Typography>
                        </Box>
                    </motion.div>

                    {/* Headline: Manage Every Real Estate Lead. Close Every Opportunity. */}
                    <motion.div
                        variants={slideInVariant}
                        initial="hidden"
                        animate={inView ? 'visible' : 'hidden'}
                        transition={{ delay: 0.1, duration: 1 }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 800,
                                fontSize: isMobile ? '1.75rem' : '2.8rem',
                                color: '#0F172A',
                                lineHeight: 1.18,
                                letterSpacing: '-0.02em',
                                mb: 0.5,
                            }}
                        >
                            Manage Every Real Estate Lead.{' '}
                            <Box
                                component="span"
                                sx={{
                                    color: '#1677F7',
                                    display: 'inline',
                                }}
                            >
                                Close Every Opportunity.
                            </Box>
                        </Typography>
                    </motion.div>

                    {/* Description: Acolead is a powerful Real Estate CRM... */}
                    <motion.div
                        variants={slideInVariant}
                        initial="hidden"
                        animate={inView ? 'visible' : 'hidden'}
                        transition={{ delay: 0.2, duration: 1 }}
                    >
                        <Typography
                            sx={{
                                fontSize: isMobile ? '0.9rem' : '1.05rem',
                                lineHeight: 1.65,
                                color: '#475569',
                                fontWeight: 450,
                            }}
                        >
                            Acolead is a powerful Real Estate CRM that helps builders, developers, channel partners, and sales teams manage leads, follow-ups, inventory, teams, and customer communication — all in one place.
                        </Typography>
                    </motion.div>

                    {/* 6 Features Interactive Animated Carousel Transition */}
                    <Box sx={{ position: 'relative', minHeight: isMobile ? '70px' : '80px', my: 0.5 }}>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={activeStep}
                                custom={direction}
                                variants={carouselVariant}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                style={{ position: 'relative' }}
                            >
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                        border: `1px solid ${activePillar.accent}35`,
                                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                                        <Box
                                            sx={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `linear-gradient(135deg, ${activePillar.accent} 0%, rgba(255,255,255,0.9) 100%)`,
                                                boxShadow: `0 6px 18px ${activePillar.accent}55`,
                                                border: '1px solid rgba(255,255,255,0.8)',
                                            }}
                                        >
                                            <PillarIcon sx={{ fontSize: 15, color: '#fff' }} />
                                        </Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: activePillar.accent }}>
                                            {activePillar.label}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontSize: isMobile ? '0.8rem' : '0.86rem',
                                            lineHeight: 1.5,
                                            color: '#334155',
                                        }}
                                    >
                                        {activePillar.description}
                                    </Typography>
                                </Box>
                            </motion.div>
                        </AnimatePresence>
                    </Box>

                   

                    {/* Interactive 6 Pillars Bar: Lead Management • Follow-ups • Inventory • WhatsApp • Team Management • Reports */}
                    {!isMobile && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                mt: 1.5,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                {realEstatePillars.map((item, index) => (
                                    <Box
                                        key={index}
                                        onClick={() => handleDotClick(index)}
                                        sx={{
                                            px: 1.3,
                                            py: 0.5,
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            bgcolor: index === activeStep ? item.accent : '#F1F5F9',
                                            color: index === activeStep ? '#ffffff' : '#475569',
                                            fontSize: '0.74rem',
                                            fontWeight: index === activeStep ? 700 : 500,
                                            transition: 'all 0.25s ease',
                                            boxShadow: index === activeStep ? `0 2px 8px ${item.accent}40` : 'none',
                                            '&:hover': {
                                                bgcolor: index === activeStep ? item.accent : '#E2E8F0',
                                            },
                                        }}
                                    >
                                        {item.label}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                          
                           {/* Button: [Book a Free Demo] */}
                    <motion.div
                        variants={slideInVariant}
                        initial="hidden"
                        animate={inView ? 'visible' : 'hidden'}
                        transition={{ delay: 0.3, duration: 1 }}
                    >
                        <Button
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            onClick={handleScrollToForm}
                            sx={{
                                alignSelf: isMobile ? 'center' : 'flex-start',
                                bgcolor: '#1677F7',
                                textTransform: 'none',
                                fontWeight: 700,
                                px: isMobile ? 4 : 5,
                                py: isMobile ? 1.3 : 1.5,
                                color: 'white',
                                fontSize: isMobile ? '0.95rem' : '1.05rem',
                                borderRadius: 3,
                                mt: 1,
                                boxShadow: '0 6px 20px rgba(22, 119, 247, 0.3)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                                    transition: 'all 0.6s ease',
                                },
                                '&:hover': {
                                    bgcolor: '#145ed6',
                                    transform: 'translateY(-2px) scale(1.02)',
                                    boxShadow: '0 8px 26px rgba(22, 119, 247, 0.4)',
                                    '&::before': {
                                        left: '100%',
                                    },
                                },
                                '& .MuiButton-endIcon': {
                                    transition: 'transform 0.3s ease',
                                },
                                '&:hover .MuiButton-endIcon': {
                                    transform: 'translateX(4px)',
                                },
                            }}
                        >
                            Book a Free Demo
                        </Button>
                    </motion.div>


                    {/* Mobile Stepper Controls */}
                    {isMobile && (
                        <MobileStepper
                            steps={realEstatePillars.length}
                            position="static"
                            activeStep={activeStep}
                            sx={{
                                backgroundColor: 'transparent',
                                px: 0,
                                py: 1,
                                '& .MuiMobileStepper-dot': {
                                    backgroundColor: '#CBD5E1',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    transition: 'all 0.3s ease',
                                },
                                '& .MuiMobileStepper-dotActive': {
                                    backgroundColor: activePillar.accent,
                                    width: 14,
                                    height: 8,
                                    borderRadius: 4,
                                },
                            }}
                            nextButton={
                                <Button
                                    size="small"
                                    onClick={handleNext}
                                    sx={{
                                        color: activePillar.accent,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    Next <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                </Button>
                            }
                            backButton={
                                <Button
                                    size="small"
                                    onClick={handleBack}
                                    sx={{
                                        color: activePillar.accent,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} /> Back
                                </Button>
                            }
                        />
                    )}
                </Box>

                {/* Right Column: Photos (mainimg with floating calender, sales, card) */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'visible',
                        mt: { xs: 2, md: 0 },
                    }}
                >
                    {/* Main Image */}
                    <Box
                        
                        alt="Acolead Real Estate CRM"
                        sx={{
                            width: '100%',
                            maxWidth: 500,
                            height: 'auto',
                            borderRadius: 4,
                            zIndex: 1,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                        }}
                    />

                    {!isMobile && (
                        <>
                            {/* Floating Calendar Photo */}
                            <Box
                                
                                alt="Calendar"
                                sx={{
                                    position: 'absolute',
                                    bottom: -130,
                                    left: -15,
                                    width: 230,
                                    height: 'auto',
                                    zIndex: 2,
                                    filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))',
                                    animation: 'float 3.5s ease-in-out infinite',
                                    '@keyframes float': {
                                        '0%, 100%': { transform: 'translateY(0px)' },
                                        '50%': { transform: 'translateY(-10px)' },
                                    },
                                }}
                            />
                            {/* Floating Sales Photo */}
                            <Box
                                
                                alt="Sales"
                                sx={{
                                    position: 'absolute',
                                    bottom: -50,
                                    right: -25,
                                    width: 195,
                                    height: 'auto',
                                    zIndex: 2,
                                    filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))',
                                    animation: 'float 3.5s ease-in-out infinite 1s',
                                    '@keyframes float': {
                                        '0%, 100%': { transform: 'translateY(0px)' },
                                        '50%': { transform: 'translateY(-10px)' },
                                    },
                                }}
                            />
                            {/* Floating Card Photo */}
                            <Box
                                
                                alt="Card"
                                sx={{
                                    position: 'absolute',
                                    top: -15,
                                    right: 5,
                                    width: 185,
                                    height: 'auto',
                                    zIndex: 2,
                                    filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))',
                                    animation: 'float 3.5s ease-in-out infinite 2s',
                                    '@keyframes float': {
                                        '0%, 100%': { transform: 'translateY(0px)' },
                                        '50%': { transform: 'translateY(-10px)' },
                                    },
                                }}
                            />
                        </>
                    )}
                </Box>
            </Box>
        </Box>

        <Box
            sx={{
                width: '100%',
                borderTop: '1px solid #E2E8F0',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                    px: { xs: 2, md: 4 },
                    py: 1.25,
                    minWidth: 'max-content',
                    whiteSpace: 'nowrap',
                    animation: 'featureScroll 22s linear infinite',
                    '@keyframes featureScroll': {
                        '0%': { transform: 'translateX(0)' },
                        '100%': { transform: 'translateX(-50%)' },
                    },
                }}
            >
                {marqueeItems.map((item, index) => (
                    <Box
                        key={`${item}-${index}`}
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: { xs: '0.8rem', md: '1rem' },
                            color: '#475569',
                            fontWeight: 500,
                            flexShrink: 0,
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#2DD4BF',
                                display: 'inline-block',
                            }}
                        />
                        <Typography sx={{ color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
                            {item}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>

        </>
    );
};

export default RealEstateHero;
