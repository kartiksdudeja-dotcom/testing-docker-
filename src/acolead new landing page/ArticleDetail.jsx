import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Link as MuiLink,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkIcon from '@mui/icons-material/Link';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckIcon from '@mui/icons-material/Check';

import Header from './Header';
import Footer from './Footer';

// ============================================================================
// CUSTOM SVG ICONS
// ============================================================================

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const API_URL = process.env.REACT_APP_PAYLOAD_API_URL || 'https://206.189.91.184.sslip.io/api';
const BASE_URL = API_URL.replace('/api', '');

const resolveMediaUrl = (urlOrMedia) => {
  if (!urlOrMedia) return null;
  // If it's a populated media object
  if (typeof urlOrMedia === 'object' && urlOrMedia.url) {
    const url = urlOrMedia.url;
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
  }
  // If it's a string URL
  if (typeof urlOrMedia === 'string' && urlOrMedia.startsWith('/')) {
    return `${BASE_URL}${urlOrMedia}`;
  }
  if (typeof urlOrMedia === 'string' && urlOrMedia.startsWith('http')) {
    return urlOrMedia;
  }
  return null;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const estimateReadTime = (content) => {
  if (!content) return '';
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (content.root && content.root.children) {
    const extractText = (nodes) => {
      return nodes
        .map((node) => {
          if (node.text) return node.text;
          if (node.children) return extractText(node.children);
          return '';
        })
        .join(' ');
    };
    text = extractText(content.root.children);
  } else if (typeof content === 'object') {
    text = JSON.stringify(content);
  }
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return '';
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
};

// Extract the first author name from populatedAuthors or authors array
const getAuthorName = (post) => {
  if (post?.populatedAuthors?.length > 0) {
    return post.populatedAuthors[0].name || '';
  }
  if (post?.authors?.length > 0) {
    const author = post.authors[0];
    if (typeof author === 'object') return author.name || '';
  }
  return '';
};

// Get initials from a name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
};

// ============================================================================
// LEXICAL CONTENT RENDERER
// ============================================================================

const LexicalRenderer = ({ content }) => {
  if (!content || !content.root || !content.root.children) {
    return (
      <Typography sx={{ color: '#64748b', fontStyle: 'italic', py: 4, textAlign: 'center' }}>
        No content available.
      </Typography>
    );
  }

  const renderChildren = (children) => {
    if (!children) return null;
    return children.map((child, i) => {
      if (child.text) {
        let text = child.text;
        let styles = {};
        if (child.bold) styles.fontWeight = 'bold';
        if (child.italic) styles.fontStyle = 'italic';
        if (child.underline) styles.textDecoration = 'underline';
        return (
          <span key={i} style={styles}>
            {text}
          </span>
        );
      }
      if (child.type === 'link') {
        return (
          <MuiLink
            key={i}
            href={child.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: '#1677F7', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
          >
            {renderChildren(child.children)}
          </MuiLink>
        );
      }
      return null;
    });
  };

  const renderNode = (node, index) => {
    if (node.type === 'text' || !node.type) {
      return null;
    }

    // Handle upload / inline images from CMS
    if (node.type === 'upload' || node.type === 'image') {
      const mediaUrl = resolveMediaUrl(node.value || node);
      const alt = node.value?.alt || node.alt || 'Article image';
      if (mediaUrl) {
        return (
          <Box
            key={index}
            sx={{
              my: 4,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              backgroundColor: '#f8fafc',
            }}
          >
            <Box
              component="img"
              src={mediaUrl}
              alt={alt}
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover',
                maxHeight: '480px',
              }}
            />
          </Box>
        );
      }
    }

    // Handle CMS Block nodes (Banner, MediaBlock, TableOfContents)
    if (node.type === 'block') {
      const blockType = node.fields?.blockType;

      // MediaBlock – renders an image from CMS media
      if (blockType === 'mediaBlock') {
        const media = node.fields?.media;
        const mediaUrl = resolveMediaUrl(media);
        if (mediaUrl) {
          return (
            <Box
              key={index}
              sx={{
                my: 4,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                backgroundColor: '#f8fafc',
              }}
            >
              <Box
                component="img"
                src={mediaUrl}
                alt={media?.alt || 'Media'}
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                  maxHeight: '480px',
                }}
              />
            </Box>
          );
        }
      }

      // Banner block – styled callout
      if (blockType === 'banner') {
        const style = node.fields?.style || 'info';
        const bannerColors = {
          info: { bg: '#f0f7ff', border: '#1677F7', icon: 'ℹ️' },
          warning: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️' },
          error: { bg: '#fef2f2', border: '#ef4444', icon: '❌' },
          success: { bg: '#f0fdf4', border: '#22c55e', icon: '✅' },
        };
        const colors = bannerColors[style] || bannerColors.info;
        return (
          <Box
            key={index}
            sx={{
              my: 4,
              p: 3,
              backgroundColor: colors.bg,
              borderLeft: `4px solid ${colors.border}`,
              borderRadius: '0 12px 12px 0',
            }}
          >
            {node.fields?.content && (
              <LexicalRenderer content={node.fields.content} />
            )}
          </Box>
        );
      }

      // TableOfContents block – we handle TOC in sidebar, skip inline
      if (blockType === 'tableOfContents') {
        return null;
      }

      // Code block from CMS
      if (blockType === 'code') {
        const codeText = node.fields?.code || '';
        return (
          <Box
            key={index}
            component="pre"
            sx={{
              my: 4,
              p: 3,
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              borderRadius: '12px',
              overflowX: 'auto',
              fontSize: '0.9rem',
              fontFamily: 'Consolas, Monaco, monospace',
              lineHeight: 1.6,
            }}
          >
            <code>{codeText}</code>
          </Box>
        );
      }
    }

    // Handle horizontal rule
    if (node.type === 'horizontalrule') {
      return (
        <Box
          key={index}
          component="hr"
          sx={{
            my: 4,
            border: 'none',
            borderTop: '1px solid #e2e8f0',
          }}
        />
      );
    }

    if (node.type === 'heading') {
      const level = node.tag || 'h2';
      return (
        <Typography
          key={index}
          id={`heading-${index}`}
          variant={level === 'h1' ? 'h3' : level === 'h2' ? 'h4' : 'h5'}
          sx={{
            fontWeight: 800,
            mt: 5,
            mb: 2,
            color: '#0f172a',
            fontSize: level === 'h2' ? '1.65rem' : '1.35rem',
            scrollMarginTop: '100px',
            '&:first-of-type': { mt: 0 },
          }}
        >
          {renderChildren(node.children)}
        </Typography>
      );
    }

    if (node.type === 'paragraph') {
      return (
        <Typography
          key={index}
          sx={{
            mb: 3,
            color: '#334155',
            lineHeight: 1.8,
            fontSize: '1.05rem',
          }}
        >
          {renderChildren(node.children)}
        </Typography>
      );
    }

    if (node.type === 'list') {
      return (
        <Box
          key={index}
          component={node.listType === 'bullet' ? 'ul' : 'ol'}
          sx={{
            mb: 3.5,
            pl: 3,
            color: '#334155',
            lineHeight: 1.8,
            fontSize: '1.05rem',
            '& li': {
              mb: 1,
            },
          }}
        >
          {node.children?.map((item, i) => (
            <li key={i}>{renderChildren(item.children)}</li>
          ))}
        </Box>
      );
    }

    if (node.type === 'quote') {
      return (
        <Box
          key={index}
          sx={{
            display: 'flex',
            gap: 2,
            backgroundColor: '#f0f7ff',
            borderLeft: '4px solid #1677F7',
            borderRadius: '0 12px 12px 0',
            p: 3,
            my: 4,
          }}
        >
          <FormatQuoteIcon sx={{ color: '#1677F7', fontSize: '2.5rem', mt: -0.5 }} />
          <Typography
            sx={{
              fontStyle: 'italic',
              fontWeight: 500,
              color: '#0f172a',
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}
          >
            {renderChildren(node.children)}
          </Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box>
      {content.root.children.map((node, index) => renderNode(node, index))}
    </Box>
  );
};

// ============================================================================
// TABLE OF CONTENTS COMPONENT
// ============================================================================

const extractTextFromNode = (node) => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join('');
  }
  return '';
};

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (content && content.root && content.root.children) {
      const extractedHeadings = [];
      content.root.children.forEach((node, contentIndex) => {
        const isHeading =
          node.type === 'heading' ||
          node.type === 'header' ||
          ['h1', 'h2', 'h3', 'h4'].includes(node.type) ||
          Boolean(node.tag && /^h[1-6]$/i.test(node.tag));

        if (isHeading) {
          const rawText = extractTextFromNode(node).trim();
          const text = rawText || `Section ${extractedHeadings.length + 1}`;
          extractedHeadings.push({
            id: `heading-${contentIndex}`,
            text,
          });
        }
      });
      setHeadings(extractedHeadings);
      if (extractedHeadings.length > 0) {
        setActiveId(extractedHeadings[0].id);
      }
    }
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleScroll = (id) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        p: 2.5,
        mb: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2, px: 0.5 }}>
        <DescriptionOutlinedIcon sx={{ color: '#1677F7', fontSize: '1.25rem' }} />
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#0f172a',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          TABLE OF CONTENTS
        </Typography>
      </Box>

      {/* List items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {headings.map((heading, index) => {
          const isActive = activeId === heading.id || (index === 0 && !activeId);
          const numberLabel = index + 1;

          return (
            <Box
              key={heading.id}
              onClick={() => handleScroll(heading.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 1,
                px: 1.5,
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: isActive ? '#edf5ff' : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isActive ? '#edf5ff' : '#f8fafc',
                },
              }}
            >
              {/* Number Badge */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  mr: 1.5,
                  flexShrink: 0,
                  backgroundColor: isActive ? '#dbeafe' : '#f1f5f9',
                  color: isActive ? '#1677F7' : '#64748b',
                }}
              >
                {numberLabel}
              </Box>

              {/* Text */}
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#1677F7' : '#475569',
                  lineHeight: 1.35,
                }}
              >
                {heading.text}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ============================================================================
// SHARE THIS ARTICLE COMPONENT
// ============================================================================

const ShareThisArticle = () => {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnLinkedIn = () => {
    window.open('https://www.linkedin.com/company/coalitionify-innovate/', '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = () => {
    window.open('https://www.facebook.com/acolead/', '_blank', 'noopener,noreferrer');
  };

  const openInstagram = () => {
    window.open('https://www.instagram.com/acolead_crm/', '_blank', 'noopener,noreferrer');
  };

  const shareOnWhatsApp = () => {
    const message = `I want to know more about your CRM: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?phone=919158661188&text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        p: 2.5,
        mb: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2, px: 0.5 }}>
        <ShareOutlinedIcon sx={{ color: '#1677F7', fontSize: '1.25rem' }} />
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#0f172a',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          SHARE THIS ARTICLE
        </Typography>
      </Box>

      {/* Icons Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
        {/* LinkedIn */}
        <IconButton
          onClick={shareOnLinkedIn}
          sx={{
            backgroundColor: '#0077b5',
            color: '#ffffff',
            width: 40,
            height: 40,
            '&:hover': { backgroundColor: '#005885' },
          }}
        >
          <LinkedInIcon fontSize="small" />
        </IconButton>

        {/* Facebook */}
        <IconButton
          onClick={shareOnFacebook}
          sx={{
            backgroundColor: '#1877f2',
            color: '#ffffff',
            width: 40,
            height: 40,
            '&:hover': { backgroundColor: '#115cbf' },
          }}
        >
          <FacebookIcon fontSize="small" />
        </IconButton>

        {/* Instagram */}
        <IconButton
          onClick={openInstagram}
          aria-label="Open AcoLead on Instagram"
          sx={{
            backgroundColor: '#d62976',
            color: '#ffffff',
            width: 40,
            height: 40,
            '&:hover': { backgroundColor: '#ad1f60' },
          }}
        >
          <InstagramIcon fontSize="small" />
        </IconButton>

        {/* WhatsApp */}
        <IconButton
          onClick={shareOnWhatsApp}
          sx={{
            backgroundColor: '#25d366',
            color: '#ffffff',
            width: 40,
            height: 40,
            '&:hover': { backgroundColor: '#1da851' },
          }}
        >
          <WhatsAppIcon fontSize="small" />
        </IconButton>

        {/* Copy Link */}
        <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
          <IconButton
            onClick={handleCopyLink}
            sx={{
              backgroundColor: '#f1f5f9',
              color: copied ? '#1677F7' : '#64748b',
              border: '1px solid #e2e8f0',
              width: 40,
              height: 40,
              '&:hover': { backgroundColor: '#e2e8f0' },
            }}
          >
            {copied ? <CheckIcon fontSize="small" /> : <LinkIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// ============================================================================
// RELATED INSIGHTS COMPONENT
// ============================================================================

const RelatedInsights = ({ postRelatedPosts, currentPostId, limit = 3 }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If the post has CMS-managed relatedPosts, use those directly
    if (postRelatedPosts && postRelatedPosts.length > 0) {
      // relatedPosts may be populated objects or just IDs
      const populated = postRelatedPosts.filter(p => typeof p === 'object' && p.title);
      if (populated.length > 0) {
        setRelatedPosts(populated.slice(0, limit));
        setLoading(false);
        return;
      }
    }

    // Fallback: fetch recent posts from CMS
    const fetchRelatedPosts = async () => {
      try {
        const response = await fetch(
          `${API_URL}/posts?limit=${limit + 1}&sort=-createdAt&where[_status][equals]=published&where[website][equals]=acolead&depth=1`
        );
        const data = await response.json();
        const filtered = data.docs
          ? data.docs.filter((post) => post.id !== currentPostId).slice(0, limit)
          : [];
        setRelatedPosts(filtered);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [postRelatedPosts, currentPostId, limit]);

  if (loading || relatedPosts.length === 0) return null;

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        p: 2.5,
        mb: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0.5 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#0f172a',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          RELATED INSIGHTS
        </Typography>
        <Typography
          component="span"
          onClick={() => navigate('/?section=insights')}
          sx={{
            fontWeight: 600,
            fontSize: '0.825rem',
            color: '#1677F7',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View All <NavigateNextIcon sx={{ fontSize: '1rem', ml: 0.2 }} />
        </Typography>
      </Box>

      {/* Items list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {relatedPosts.map((post) => {
          const imageUrl = resolveMediaUrl(post.heroImage) || resolveMediaUrl(post.meta?.image) || '';

          const tag = post.categories?.[0]?.title?.toUpperCase() || '';
          const readTime = estimateReadTime(post.content);
          const excerpt = post.meta?.description || '';

          return (
            <Box
              key={post.id}
              onClick={() => post.slug && navigate(`/insights/${post.slug}`)}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                transition: 'all 0.2s',
                '&:hover .title': { color: '#1677F7' },
              }}
            >
              {/* Graphic Thumbnail */}
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  flexShrink: 0,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={post.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>CRM</Typography>
                )}
              </Box>

              {/* Text content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {tag && (
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#64748b',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      mb: 0.3,
                    }}
                  >
                    {tag}
                  </Typography>
                )}
                <Typography
                  className="title"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    lineHeight: 1.3,
                    mb: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 0.5,
                  }}
                >
                  {excerpt}
                </Typography>
                <Typography sx={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                  {readTime}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ============================================================================
// CTA BOX COMPONENT
// ============================================================================

const CtaBox = ({ onBookDemo }) => {
  return (
    <Box
      sx={{
        backgroundColor: '#eef6ff',
        border: '1px solid #d0e4ff',
        borderRadius: '16px',
        p: 3,
        textAlign: 'left',
      }}
    >
      {/* Icon Badge */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          backgroundColor: '#dbeafe',
          color: '#1677F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <DescriptionOutlinedIcon fontSize="small" />
      </Box>

      {/* Heading */}
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '1rem',
          color: '#0f172a',
          mb: 1,
          lineHeight: 1.3,
        }}
      >
        Ready to see AcoLead in action?
      </Typography>

      {/* Description */}
      <Typography
        sx={{
          fontSize: '0.825rem',
          color: '#475569',
          mb: 2.5,
          lineHeight: 1.5,
        }}
      >
        Book a personalized demo and discover how we can help you drive better results.
      </Typography>

      {/* Action Button */}
      <Button
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        onClick={onBookDemo}
        fullWidth
        sx={{
          backgroundColor: '#1677F7',
          color: '#ffffff',
          fontWeight: 700,
          textTransform: 'none',
          borderRadius: '8px',
          py: 1.1,
          fontSize: '0.9rem',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#1163d4',
            boxShadow: '0 4px 12px rgba(22, 119, 247, 0.25)',
          },
        }}
      >
        Book a Demo
      </Button>
    </Box>
  );
};

// ============================================================================
// MAIN ARTICLE DETAIL COMPONENT
// ============================================================================

const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState('IN');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // depth=2 populates: heroImage, categories, authors, relatedPosts (and their heroImage/categories)
        const response = await fetch(
          `${API_URL}/posts?where[slug][equals]=${slug}&where[_status][equals]=published&depth=2`
        );
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
          setPost(data.docs[0]);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '600px' }}>
        <CircularProgress sx={{ color: '#1677F7' }} />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Header
          scrollToSection={(section) => navigate(`/?section=${section}`)}
          handleScrollToForm={() => navigate('/?demo=true')}
          country={country}
          setCountry={setCountry}
        />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center', flexGrow: 1 }}>
          <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 700, mb: 2 }}>
            {error || 'Article not found'}
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/?section=insights')}
            sx={{ color: '#1677F7', textTransform: 'none', fontWeight: 600 }}
          >
            Back to Insights
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  const categoryTitle = post?.categories?.[0]?.title || '';
  const heroImageUrl = resolveMediaUrl(post?.heroImage) || resolveMediaUrl(post?.meta?.image);
  const authorName = getAuthorName(post);
  const authorInitials = getInitials(authorName);
  const publishDate = formatDate(post?.publishedAt || post?.createdAt);
  const readTime = estimateReadTime(post?.content);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ backgroundColor: '#ffffff' }}>
      {/* Global Header */}
      <Header
        scrollToSection={(section) => navigate(`/?section=${section}`)}
        handleScrollToForm={() => navigate('/?demo=true')}
        country={country}
        setCountry={setCountry}
      />

      <Box sx={{ flexGrow: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          {/* MAIN GRID LAYOUT */}
          <Grid container spacing={{ xs: 4, md: 5 }}>
            {/* LEFT COLUMN: ARTICLE CONTENT */}
            <Grid item xs={12} md={8}>
              {/* Category Pill Tag */}
              <Box
                sx={{
                  display: 'inline-block',
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: '#e0edff',
                  color: '#1677F7',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  mb: 2.5,
                }}
              >
                {categoryTitle}
              </Box>

              {/* Title */}
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  mb: 2.5,
                  lineHeight: 1.2,
                  fontSize: { xs: '2rem', sm: '2.4rem', md: '2.65rem' },
                }}
              >
                {post?.title}
              </Typography>

              {/* Subtitle / Excerpt */}
              {(post?.meta?.description || post?.excerpt) && (
                <Typography
                  sx={{
                    color: '#475569',
                    fontSize: '1.05rem',
                    lineHeight: 1.6,
                    mb: 3.5,
                  }}
                >
                  {post?.meta?.description || post?.excerpt}
                </Typography>
              )}

              {/* Meta Row: Date, Read Time, Author */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 2, sm: 3 },
                  flexWrap: 'wrap',
                  mb: 4,
                  pb: 3,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                {/* Date */}
                {publishDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748b' }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: '1.05rem', color: '#64748b' }} />
                    <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                      {publishDate}
                    </Typography>
                  </Box>
                )}

                {/* Read Time */}
                {readTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748b' }}>
                    <AccessTimeOutlinedIcon sx={{ fontSize: '1.05rem', color: '#64748b' }} />
                    <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                      {readTime}
                    </Typography>
                  </Box>
                )}

                {/* Author Info */}
                {authorName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, ml: { sm: 2 } }}>
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        border: '2px solid #e2e8f0',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      {authorInitials}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>
                        By {authorName}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* HERO BANNER IMAGE */}
              {heroImageUrl && (
                <Box
                  sx={{
                    width: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    mb: 4,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <Box
                    component="img"
                    src={heroImageUrl}
                    alt={post?.heroImage?.alt || post?.title}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '520px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
              )}

              {/* ARTICLE BODY CARD */}
              <Box
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  p: { xs: 3, sm: 4, md: 5 },
                  boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                  color: '#334155',
                }}
              >
                <LexicalRenderer content={post?.content} />
              </Box>
            </Grid>

            {/* RIGHT COLUMN: SIDEBAR */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: { md: 'sticky' }, top: { md: '90px' } }}>
                {/* Table of Contents Card */}
                <TableOfContents content={post?.content} />

                {/* Share This Article Card */}
                <ShareThisArticle />

                {/* Related Insights Card */}
                <RelatedInsights postRelatedPosts={post?.relatedPosts} currentPostId={post?.id} />

                {/* Call to Action Box */}
                <CtaBox onBookDemo={() => navigate('/?demo=true')} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Global Footer */}
      <Footer />
    </Box>
  );
};

export default ArticleDetail;