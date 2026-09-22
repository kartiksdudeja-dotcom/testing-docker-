import React from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery } from '@mui/material';

// Real Client Logos from public/Client Logos directory
const realClientLogos = [
  {
    id: 1,
    name: 'Desai Estate',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/Desai Estate.jpeg',
    alt: 'Desai Estate Real Estate Logo',
  },
  {
    id: 2,
    name: 'Direct Resale',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/Direct Resale.png',
    alt: 'Direct Resale Logo',
  },
  {
    id: 3,
    name: 'Global Consultancy',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/Globle consultancy.jpg',
    alt: 'Global Consultancy Logo',
  },
  {
    id: 4,
    name: 'Inspirational Homes',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/Inspirational Homes.png',
    alt: 'Inspirational Homes Logo',
  },
  {
    id: 5,
    name: 'KD Asset Builder',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/Kd Asset Builder.png',
    alt: 'KD Asset Builder Logo',
    bigLogo: true,
  },
  {
    id: 6,
    name: 'Mittal Brothers',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/Mittal Brothers.png',
    alt: 'Mittal Brothers Logo',
  },
  {
    id: 7,
    name: 'PropMentor',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/PROPMENTORLOGO.jpeg',
    alt: 'PropMentor Logo',
  },
  {
    id: 8,
    name: 'PotterzWheel Realty',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/PotterzWheel Realty.jpeg',
    alt: 'PotterzWheel Realty Logo',
  },
  {
    id: 9,
    name: 'Pune Property Guide',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/Pune_Property_Guide__1_ (1).png',
    alt: 'Pune Property Guide Logo',
  },
  {
    id: 10,
    name: 'Sukran Realty',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/Sukran Realty.png',
    alt: 'Sukran Realty Logo',
  },
  {
    id: 11,
    name: 'LeadsInn',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/leadsinn.jpeg',
    alt: 'LeadsInn Logo',
  },
  {
    id: 12,
    name: 'White Collar Realty',
    logoSrc: process.env.PUBLIC_URL + '/Client Logos/whitecollar.png',
    alt: 'White Collar Realty Logo',
  },
];

const ClientLogosMarquee = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Duplicate the array 3x for smooth, 100% seamless infinite horizontal looping
  const marqueeItems = [...realClientLogos, ...realClientLogos, ...realClientLogos];

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        py: { xs: 5, md: 7 },
        background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 50%, #F1F5F9 100%)',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Keyframe and Hover CSS */}
      <style>
        {`
          @keyframes marqueePipelineReal {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-33.333333%);
            }
          }

          .marquee-pipeline-track {
            display: flex;
            align-items: center;
            width: max-content;
            animation: marqueePipelineReal 40s linear infinite;
            will-change: transform;
          }

          /* Pause marquee animation when cursor hovers anywhere over the track */
          .marquee-pipeline-container:hover .marquee-pipeline-track {
            animation-play-state: paused !important;
          }

          /* Default logo card style: monochrome/grayscale when running */
          .real-client-logo-card {
            filter: grayscale(100%) opacity(0.65);
            transition: filter 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                        transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                        box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }

          /* Hover state: cursor ON logo -> full vibrant color, stopped animation, pop up effect */
          .real-client-logo-card:hover {
            filter: grayscale(0%) opacity(1) !important;
            transform: translateY(-6px) scale(1.08) !important;
            box-shadow: 0 16px 32px -8px rgba(22, 119, 247, 0.25), 0 4px 12px rgba(0, 0, 0, 0.06) !important;
            border-color: #1677F7 !important;
            background-color: #FFFFFF !important;
            z-index: 10;
          }

          .real-client-logo-img {
            max-height: 90px;
            max-width: 220px;
            width: auto;
            height: auto;
            object-fit: contain;
            transition: filter 0.35s ease, transform 0.35s ease;
          }

          /* Bigger logos for images with extra whitespace */
          .real-client-logo-img.big-logo {
            max-height: 180px;
            max-width: 280px;
          }
            .real-client-logo-img.mittal-logo {
            max-height: 260px;
            max-width: 370px;
}
        `}
      </style>

      {/* Heading Section */}
      <Container maxWidth="lg" sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.6,
            borderRadius: '50px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#1677F7',
              boxShadow: '0 0 8px #1677F7',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: '#1D4ED8',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            }}
          >
            INDUSTRIES WE SERVE
          </Typography>
        </Box>

        <Typography
          variant="h3"
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.6rem', sm: '2.1rem', md: '2.5rem' },
            color: '#0F172A',
            letterSpacing: '-0.02em',
            mb: 1,
          }}
        >
          Trusted by Real Estate Businesses
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#64748B',
            fontSize: { xs: '0.9rem', sm: '1.05rem' },
            maxWidth: '650px',
            mx: 'auto',
          }}
        >
          Empowering top agencies, builders, and property consultants to capture and convert more leads efficiently.
        </Typography>
      </Container>

      {/* Marquee Wrapper with Side Masks */}
      <Box
        className="marquee-pipeline-container"
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          py: 1.5,
        }}
      >
        {/* Left Edge Gradient Fade */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: { xs: 60, md: 180 },
            zIndex: 3,
            background: 'linear-gradient(to right, #F8FAFC 0%, rgba(248, 250, 252, 0) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Right Edge Gradient Fade */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: { xs: 60, md: 180 },
            zIndex: 3,
            background: 'linear-gradient(to left, #F1F5F9 0%, rgba(241, 245, 249, 0) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Moving Pipeline Track */}
        <Box className="marquee-pipeline-track">
          {marqueeItems.map((client, index) => (
            <Box
              key={`${client.id}-${index}`}
              className="real-client-logo-card"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 4,
                py: 2.5,
                mx: 2,
                borderRadius: '18px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                minWidth: { xs: '220px', sm: '280px' },
                height: { xs: '110px', sm: '130px' },
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                userSelect: 'none',
              }}
            >
              <img
                src={client.logoSrc}
                alt={client.alt}
                className={`real-client-logo-img${client.bigLogo ? ' big-logo' : ''}${client.id === 6 ? ' mittal-logo' : ''}`}
                loading="lazy"
                onError={(e) => {
                  // Fallback to text if an image fails to load
                  e.target.style.display = 'none';
                  e.target.parentNode.innerText = client.name;
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

    </Box>
  );
};

export default ClientLogosMarquee;
