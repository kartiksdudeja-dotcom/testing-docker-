import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Default fallback posts in case API fails
const defaultPosts = [
  {
    tag: 'AI & SALES',
    title: 'How AI Calling is Transforming Outbound Sales',
    excerpt: 'Discover how AI voices and real-time insights help sales teams connect better and reduce manual effort.',
    date: 'May 28, 2024',
    readTime: '5 min read',
    accent: 'linear-gradient(135deg, #0b1f3a 0%, #1d5eea 35%, #75c8ff 100%)',
  },
];

// Function to generate gradient colors based on post index
const generateGradient = (index) => {
  const gradients = [
    'linear-gradient(135deg, #0b1f3a 0%, #1d5eea 35%, #75c8ff 100%)',
    'linear-gradient(135deg, #f3e8d8 0%, #d3c0a0 35%, #8da2b6 100%)',
    'linear-gradient(135deg, #dfeaf9 0%, #b7d0ee 34%, #7d8d9e 100%)',
    'linear-gradient(135deg, #e9edf5 0%, #bbc6d9 32%, #7d8698 100%)',
  ];
  return gradients[index % gradients.length];
};

// Function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Recently';

  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return date.toLocaleDateString('en-US', options);
};

const getDaysAgo = (dateString) => {
  if (!dateString) return 'Recently';

  const postDate = new Date(dateString);
  const now = new Date();

  const diffMs = now - postDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';

  return `${diffDays} days ago`;
};


// Function to estimate reading time (approximately 200 words per minute)
// Function to transform Payload API response to component data
const transformPostData = (apiPost, index) => {
  let imageUrl = apiPost.heroImage?.url || '';
  
  // Ensure image URL is absolute (add Payload API base URL if needed)
  if (imageUrl && !imageUrl.startsWith('http')) {
    const apiUrl = process.env.REACT_APP_PAYLOAD_API_URL || 'http://localhost:3000/api';
    const baseUrl = apiUrl.replace('/api', '');
    imageUrl = `${baseUrl}${imageUrl}`;
  }
  
  return {
    id: apiPost.id,
    slug: apiPost.slug,
    tag: apiPost.categories?.[0]?.title || 'INSIGHTS',
    title: apiPost.title,
    excerpt: apiPost.meta?.description || apiPost.title,
    date: formatDate(apiPost.createdAt),
    daysAgo: getDaysAgo(apiPost.createdAt),
    image: imageUrl,
    accent: generateGradient(index),
  };
};

const BlogSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCards, setVisibleCards] = useState(4);
  const [activeDot, setActiveDot] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const positionRef = useRef(0);
  const setWidthRef = useRef(0);
  const targetPositionRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastFrameRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const hoverRef = useRef(false);
  const interactionPausedRef = useRef(false);
  const dragRef = useRef({ startX: null, startY: null, startPosition: 0, active: false });
  const suppressClickRef = useRef(false);
  const activeDotRef = useRef(0);
  const cardsPerView = isMobile ? 1 : visibleCards;
  const shouldLoop = false;

  const applyPosition = () => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-positionRef.current}px, 0, 0)`;
    }
  };

 const normalizePosition = useCallback(() => {
  if (!trackRef.current || !viewportRef.current) return;

  const maxPosition = Math.max(
    0,
    trackRef.current.scrollWidth - viewportRef.current.clientWidth
  );

  positionRef.current = Math.max(
    0,
    Math.min(positionRef.current, maxPosition)
  );

  if (targetPositionRef.current !== null) {
    targetPositionRef.current = Math.max(
      0,
      Math.min(targetPositionRef.current, maxPosition)
    );
  }
}, []);

  const scheduleResume = () => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      if (!hoverRef.current && !dragRef.current.active) {
        interactionPausedRef.current = false;
      }
    }, 700);
  };

  const handlePointerDown = (event) => {
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startPosition: positionRef.current,
      active: false,
    };
    interactionPausedRef.current = true;
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (drag.startX === null || drag.startY === null) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.active) {
      if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 8) return;
      drag.active = true;
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      targetPositionRef.current = null;
    }

    event.preventDefault();
    positionRef.current = drag.startPosition - deltaX;
    normalizePosition();
    applyPosition();
  };

  const handlePointerUp = (event) => {
    if (dragRef.current.startX === null || dragRef.current.startY === null) return;
    const wasDragging = dragRef.current.active;
    dragRef.current = { startX: null, startY: null, startPosition: positionRef.current, active: false };
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (wasDragging) scheduleResume();
    else {
      interactionPausedRef.current = false;
      scheduleResume();
    }
  };

const handleArrowClick = (direction) => {
  if (!trackRef.current || !viewportRef.current) return;

  const firstCard = trackRef.current.children[0];
  if (!firstCard) return;

  const cardWidth =
    firstCard.getBoundingClientRect().width;

  const gap = 20;
  const step = cardWidth + gap;

  const maxPosition = Math.max(
    0,
    trackRef.current.scrollWidth -
      viewportRef.current.clientWidth
  );

  const currentPosition =
    targetPositionRef.current !== null
      ? targetPositionRef.current
      : positionRef.current;

  const nextPosition = Math.max(
    0,
    Math.min(
      currentPosition + step * direction,
      maxPosition
    )
  );

  targetPositionRef.current = nextPosition;
};

  const handleDotClick = (index) => {
    const step = setWidthRef.current / posts.length;
    if (!step) return;
    interactionPausedRef.current = true;
    targetPositionRef.current = setWidthRef.current + step * index;
    scheduleResume();
  };

  const handleWheel = (event) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.shiftKey
        ? event.deltaY
        : 0;
    if (!delta) return;

    event.preventDefault();
    interactionPausedRef.current = true;
    targetPositionRef.current = null;
    positionRef.current += delta;
    normalizePosition();
    applyPosition();
    scheduleResume();
  };

  const handleMouseEnter = () => {
    hoverRef.current = true;
    interactionPausedRef.current = true;
  };

  const handleMouseLeave = () => {
    hoverRef.current = false;
    scheduleResume();
  };

  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth < 768) setVisibleCards(1);
      else if (window.innerWidth < 1100) setVisibleCards(2);
      else setVisibleCards(4);
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);
  

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Configure your Payload API URL:
        // For local development: http://localhost:3000/api
        // For production: https://your-cms-domain.com/api
        const apiUrl = process.env.REACT_APP_PAYLOAD_API_URL || 'http://localhost:3000/api';
        
        // Fetch published posts, ordered by creation date (newest first)
        const response = await fetch(
          `${apiUrl}/posts?limit=20&sort=-createdAt&where[_status][equals]=published`,
          {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform API response to component data format
        const transformedPosts = data.docs.map((post, index) =>
          transformPostData(post, index)
        );
        
        setPosts(transformedPosts.length > 0 ? transformedPosts : defaultPosts);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts from Payload API:', err);
        setError(err.message);
        // Fallback to default posts if API fails
        setPosts(defaultPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const carouselPosts = useMemo(
  () => posts,
  [posts]
);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener?.('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener?.('change', updateMotionPreference);
  }, []);

  useEffect(() => {
   const measureCarousel = () => {
  if (!trackRef.current || !viewportRef.current || !posts.length) return;

  setWidthRef.current =
    trackRef.current.scrollWidth;

  normalizePosition();
  applyPosition();
};

    measureCarousel();
    window.addEventListener('resize', measureCarousel);
    return () => window.removeEventListener('resize', measureCarousel);
  }, [posts.length, cardsPerView, shouldLoop, carouselPosts.length, normalizePosition]);

  useEffect(() => {
  if (!posts.length) return;

  const animate = (timestamp) => {
    const lastFrame = lastFrameRef.current || timestamp;
    const deltaTime = Math.min(timestamp - lastFrame, 50);
    lastFrameRef.current = timestamp;

    if (targetPositionRef.current !== null) {
      const difference =
        targetPositionRef.current - positionRef.current;

      const movement =
        difference * Math.min(1, deltaTime / 180);

      positionRef.current += movement;

      if (Math.abs(difference) < 0.5) {
        positionRef.current = targetPositionRef.current;
        targetPositionRef.current = null;
      }

      normalizePosition();
      applyPosition();
    }

    if (trackRef.current && viewportRef.current) {
      const firstCard = trackRef.current.children[0];

      if (firstCard) {
        const cardWidth =
          firstCard.getBoundingClientRect().width;

        const gap = 20;
        const step = cardWidth + gap;

        const currentIndex = Math.round(
          positionRef.current / step
        );

        const maxIndex = Math.max(
          0,
          posts.length - cardsPerView
        );

        const nextIndex = Math.min(
          currentIndex,
          maxIndex
        );

        if (nextIndex !== activeDotRef.current) {
          activeDotRef.current = nextIndex;
          setActiveDot(nextIndex);
        }
      }
    }

    animationFrameRef.current =
      window.requestAnimationFrame(animate);
  };

  animationFrameRef.current =
    window.requestAnimationFrame(animate);

  return () => {
    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(resumeTimerRef.current);
    lastFrameRef.current = null;
  };
}, [
  posts.length,
  cardsPerView,
  normalizePosition,
]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        background: '#f6f9ff',
        py: { xs: 4, md: 6 },
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
       <Box
  sx={{
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
    mb: 4,
    flexWrap: 'nowrap',
  }}
>
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography
      variant="overline"
      sx={{
        display: 'block',
        color: '#1677F7',
        fontWeight: 700,
        letterSpacing: '0.12em',
        fontSize: '0.76rem',
        mb: 1,
      }}
    >
      INSIGHTS
    </Typography>

    <Typography
      variant="h3"
      sx={{
        fontWeight: 700,
        lineHeight: 1.15,
        color: '#101828',
        fontSize: { xs: '1.55rem', md: '2.55rem' },
        whiteSpace: 'normal',
        letterSpacing: '-0.02em',
      }}
    >
      Latest thinking, ideas and industry perspectives
    </Typography>

    
  </Box>

  <Button
    endIcon={<ArrowForwardIcon />}
    sx={{
      color: '#1677F7',
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
      px: 0,
      minWidth: 'fit-content',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      '& .MuiButton-endIcon': {
        marginLeft: '8px',
        display: 'inline-flex',
        flexShrink: 0,
      },
      '&:hover': {
        background: 'transparent',
      },
      [theme.breakpoints.down('md')]: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1,
      },
    }}
  >
    View All<Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>{' Insights'}</Box>
  </Button>
</Box>

        {/* Loading state */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: '#1677F7' }} />
          </Box>
        )}

        {/* Error state */}
        {error && !loading && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              background: 'rgba(220, 53, 69, 0.1)',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              borderRadius: 2,
              color: '#721c24',
            }}
          >
            <Typography variant="body2">
              Unable to load posts from API. Showing default posts instead.
            </Typography>
          </Box>
        )}

        {/* Posts carousel */}
        {!loading && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              px: { xs: 6, md: 8 },
            }}
          >
            <IconButton
              aria-label="Newer insights"
              onClick={() => handleArrowClick(-1)}
              onPointerDown={(event) => event.stopPropagation()}
              sx={{
                position: 'absolute',
                left: { xs: 0, md: 8 },
                top: '50%',
                zIndex: 2,
                transform: 'translateY(-50%)',
                backgroundColor: '#fff',
                color: '#6B7280',
                boxShadow: '0 4px 14px rgba(16, 24, 40, 0.14)',
                '&:hover': {
                backgroundColor: '#1677F7',
                color: '#fff',
},
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label="Older insights"
              onClick={() => handleArrowClick(1)}
              onPointerDown={(event) => event.stopPropagation()}
              sx={{
                position: 'absolute',
                right: { xs: 0, md: 8 },
                top: '50%',
                zIndex: 2,
                transform: 'translateY(-50%)',
                backgroundColor: '#fff',
                color: 'inherit',
                boxShadow: '0 4px 14px rgba(16, 24, 40, 0.14)',
                '&:hover': { backgroundColor: '#1677F7', color: '#fff' },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
            <Box
              ref={viewportRef}
              sx={{
                overflow: 'hidden',
                cursor: 'grab',
                touchAction: 'pan-y',
                '--card-gap': '20px',
                '--card-width': `calc(
  (100% - ${(cardsPerView - 1) * 20}px) / ${cardsPerView}
)`,
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <Box
                ref={trackRef}
                sx={{
                  display: 'flex',
                  gap: 'var(--card-gap)',
                  justifyContent: 'flex-start',
                  willChange: 'transform',
                }}
              >
              {carouselPosts.map((post, index) => (
              <Box
                key={`${post.id || post.title}-${index}`}
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }
                  navigate(`/insights/${post.slug}`);
                }}
                sx={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  height: { xs: 'auto', sm: 460, md: 540 },
                  boxSizing: 'border-box',
                  minWidth: 0,
                  flex: '0 0 var(--card-width)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(16, 24, 40, 0.08)',
                  },
                }}
              >
                {/* Fixed height image container */}
                <Box sx={{ height: { xs: 'auto', sm: 180, md: 255 }, aspectRatio: { xs: '1.4 / 1', sm: 'auto' }, flexShrink: 0, overflow: 'hidden', position: 'relative', background: '#fff', borderRadius: '16px 16px 0 0' }}>
                  {post.image && (
                    <Box
                      component="img"
                      src={post.image}
                      alt={post.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </Box>

                <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Tag and Read Time Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {post.tag}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: '#6B7280',
                      }}
                    >
                      {post.daysAgo}
                    </Typography>
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: '#111827',
                      fontSize: isMobile ? '1.1rem' : '1.2rem',
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: { xs: '2.97rem', md: '3.24rem' },
                    }}
                  >
                    {post.title}
                  </Typography>

                  {/* Excerpt */}
                  <Typography
                    sx={{
                      color: '#4B5563',
                      lineHeight: 1.6,
                      fontSize: '0.95rem',
                      mb: 3,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: { xs: '4.56rem', md: '4.56rem' },
                    }}
                  >
                    {post.excerpt}
                  </Typography>

                  <Box sx={{ flexGrow: 1 }} />

                  {/* Read More Link */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mt: 'auto',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1677F7',
                        textTransform: 'none',
                      }}
                    >
                      READ MORE
                    </Typography>
                    <Box
                      sx={{
                        ml: 1.25,
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#e5f0ff',
                      }}
                    >
                      <ArrowForwardIcon sx={{ color: '#1677F7', fontSize: '1.25rem' }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
              ))}
            </Box>
            </Box>
            {isMobile && posts.length > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 3 }}>
                {posts.slice(0, 4).map((post, index) => (
                  <Box
                    key={post.id || post.slug || index}
                    component="button"
                    type="button"
                    aria-label={`Show insight ${index + 1}`}
                    onClick={() => handleDotClick(index)}
                    sx={{
                      width: 12,
                      height: 12,
                      p: 0,
                      border: 0,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      backgroundColor: index === activeDot ? '#1677F7' : '#cbd0d8',
                    }}
                  />
                ))}
              </Box>
            )}
        </Box>
        )}
      </Box>
    </Box>
  );
};

export default BlogSection;

