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
  TextField,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Header from './Header';
import Footer from './Footer';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const estimateReadTime = (content) => {
  if (!content) return '5 min read';
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
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
};

const getTagColor = (tag) => {
  const colorMap = {
    'AI & SALES': { bg: 'rgba(15, 32, 96, 0.12)', text: '#0F2060' },
    'SALES STRATEGY': { bg: 'rgba(34, 139, 34, 0.12)', text: '#228B22' },
    'DATA & INSIGHTS': { bg: 'rgba(75, 0, 130, 0.12)', text: '#4B0082' },
    'CUSTOMER EXPERIENCE': { bg: 'rgba(255, 140, 0, 0.12)', text: '#FF8C00' },
    'INSIGHTS': { bg: 'rgba(22, 119, 247, 0.08)', text: '#1677F7' },
  };
  return colorMap[tag] || { bg: 'rgba(22, 119, 247, 0.08)', text: '#1677F7' };
};

// ============================================================================
// LEXICAL CONTENT RENDERER
// ============================================================================

const LexicalRenderer = ({ content }) => {
  if (!content || !content.root || !content.root.children) {
    return <Typography>No content available</Typography>;
  }

  const renderNode = (node, index) => {
    // Handle text nodes
    if (node.type === 'text' || !node.type) {
      return null;
    }

    // Handle headings
    if (node.type === 'heading') {
      const level = node.tag || 'h2';
      const headingVariant = {
        h1: 'h4',
        h2: 'h5',
        h3: 'h6',
      }[level] || 'h5';

      return (
        <Typography
          key={index}
          variant={headingVariant}
          sx={{
            fontWeight: 700,
            mt: 3,
            mb: 2,
            color: '#111827',
            
            '&:first-of-type': { mt: 0 },
          }}
          id={`heading-${index}`}
        >
          {renderChildren(node.children)}
        </Typography>
      );
    }

    // Handle paragraphs
    if (node.type === 'paragraph') {
      return (
        <Typography
          key={index}
          sx={{
            mb: 2,
            color: '#4B5563',
            lineHeight: 1.8,
            fontSize: '16px',
          }}
        >
          {renderChildren(node.children)}
        </Typography>
      );
    }

    // Handle lists
    if (node.type === 'list') {
      return (
        <Box
          key={index}
          component={node.listType === 'bullet' ? 'ul' : 'ol'}
          sx={{
            mb: 2,
            pl: 3,
            color: '#4B5563',
            lineHeight: 1.8,
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

    // Handle quotes
    if (node.type === 'quote') {
      return (
        <Box
          key={index}
          sx={{
            borderLeft: '4px solid #1677F7',
            pl: 2,
            py: 1.5,
            mb: 2,
            fontStyle: 'italic',
            color: '#4B5563',
            bg: 'rgba(22, 119, 247, 0.05)',
            backgroundColor: 'rgba(22, 119, 247, 0.05)',
          }}
        >
          {renderChildren(node.children)}
        </Box>
      );
    }

    return null;
  };

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
            sx={{ color: '#1677F7', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {renderChildren(child.children)}
          </MuiLink>
        );
      }
      return null;
    });
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

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    if (content && content.root && content.root.children) {
      const extractedHeadings = content.root.children
        .filter((node) => node.type === 'heading')
        .map((node, index) => ({
          id: `heading-${index}`,
          text: node.children?.[0]?.text || `Heading ${index + 1}`,
          level: node.tag || 'h2',
        }));
      setHeadings(extractedHeadings);
    }
  }, [content]);

  if (headings.length === 0) {
    return null;
  }

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };

  return (
    <Box
      sx={{
        bg: '#fff',
        backgroundColor: '#fff',
        border: '1px solid rgba(22, 119, 247, 0.1)',
        borderRadius: 2,
        p: 2.5,
        mb: 3,
        
        maxHeight: '400px',
        overflowY: 'auto',
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '0.95rem',
          mb: 2,
          color: '#111827',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Table of Contents
      </Typography>

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          pl: 0,
          m: 0,
        }}
      >
        {headings.map((heading, index) => (
          <li key={index}>
            <Button
              
              sx={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                textTransform: 'none',
                color: '#4B5563',
                fontSize: '0.9rem',
                mb: 1,
                '&:hover': {
                  color: '#1677F7',
                  backgroundColor: 'rgba(22, 119, 247, 0.05)',
                },
              }}
              fullWidth
            >
              {heading.text}
            </Button>
          </li>
        ))}
      </Box>
    </Box>
  );
};

// ============================================================================
// RELATED INSIGHTS COMPONENT
// ============================================================================

const RelatedInsights = ({ currentPostId, limit = 3 }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const apiUrl = process.env.REACT_APP_PAYLOAD_API_URL || 'https://206.189.91.184.sslip.io/api';
        const response = await fetch(`${apiUrl}/posts?limit=${limit + 1}&sort=-createdAt&where[_status][equals]=published`);
        const data = await response.json();
        const filtered = data.docs.filter((post) => post.id !== currentPostId).slice(0, limit);
        setRelatedPosts(filtered);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPostId, limit]);

  if (loading || relatedPosts.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        bg: '#fff',
        backgroundColor: '#fff',
        border: '1px solid rgba(22, 119, 247, 0.1)',
        borderRadius: 2,
        p: 2.5,
        mb: 3,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '0.95rem',
          mb: 2,
          color: '#111827',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Related Insights
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {relatedPosts.map((post) => {
          let imageUrl = post.heroImage?.url || post.meta?.image?.url || '';
          if (imageUrl && !imageUrl.startsWith('http')) {
            const apiUrl = process.env.REACT_APP_PAYLOAD_API_URL || 'https://206.189.91.184.sslip.io/api';
            const baseUrl = apiUrl.replace('/api', '');
            imageUrl = `${baseUrl}${imageUrl}`;
          }

          return (
            <Box
              key={post.id}
              sx={{
                cursor: 'pointer',
                borderRadius: 0,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 320,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(16, 24, 40, 0.08)',
                },
              }}
              onClick={() => navigate(`/insights/${post.slug}`)}
            >
              {/* Fixed height image container */}
              <Box sx={{ height: 180, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                {imageUrl && (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={post.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </Box>

              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Tag and Read Time Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {post.categories?.[0]?.title || 'INSIGHTS'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      color: '#6B7280',
                    }}
                  >
                    {estimateReadTime(post.content)}
                  </Typography>
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#111827',
                    lineHeight: 1.3,
                    mb: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.title}
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
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#1677F7',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    READ MORE
                  </Typography>
                  <ArrowForwardIcon sx={{ ml: 0.5, color: '#1677F7', fontSize: '1rem' }} />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ============================================================================
// NEWSLETTER SIGNUP COMPONENT
// ============================================================================



 

// ============================================================================
// MAIN ARTICLE DETAIL COMPONENT
// ============================================================================
// Helper function
const getRelativeDate = (date) => {
  const now = new Date();
  const postDate = new Date(date);

  const nowStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const postStart = new Date(
    postDate.getFullYear(),
    postDate.getMonth(),
    postDate.getDate()
  );

  const diffDays = Math.floor(
    (nowStart - postStart) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays > 1) return `${diffDays} days ago`;

  return 'Today';
};


// MAIN ARTICLE DETAIL COMPONENT

const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState('IN');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const apiUrl = process.env.REACT_APP_PAYLOAD_API_URL || 'https://206.189.91.184.sslip.io/api';
        const response = await fetch(`${apiUrl}/posts?where[slug][equals]=${slug}&where[_status][equals]=published`);
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
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#1677F7' }} />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography sx={{ color: '#dc3545', textAlign: 'center', mb: 2 }}>
          {error || 'Article not found'}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ color: '#1677F7' }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  const tagColor = getTagColor(post.categories?.[0]?.title || 'INSIGHTS');
  const heroImage = post.heroImage?.url
    ? (post.heroImage.url.startsWith('http')
        ? post.heroImage.url
        : `${(process.env.REACT_APP_PAYLOAD_API_URL || 'https://206.189.91.184.sslip.io/api').replace('/api', '')}${post.heroImage.url}`)
    : null;

  
    

  

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Header
        scrollToSection={(section) => navigate(`/?section=${section}`)}
        handleScrollToForm={() => navigate('/?demo=true')}
        country={country}
        setCountry={setCountry}
      />
      <Box sx={{ backgroundColor: '#f8f9fa', flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
        {/* ARTICLE HEADER */}
        
          <Typography
            sx={{
              display: 'inline-block',
              px: 1.2,
              py: 0.6,
              borderRadius: 1,
              background: tagColor.bg,
              color: tagColor.text,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mb: 2,
            }}
          >
            {post.categories?.[0]?.title || 'INSIGHTS'}
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: '#111827',
              mb: 2,
              lineHeight: 1.2,
              fontSize: isMobile ? '1.8rem' : '2.5rem',
            }}
          >
            {post.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {post.author && (
              <Typography sx={{ color: '#4B5563', fontSize: '0.95rem', fontWeight: 500 }}>
                By {post.author}
              </Typography>
            )}
            <Typography sx={{ color: '#6B7280', fontSize: '0.95rem' }}>
              {formatDate(post.createdAt)}
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: '0.95rem' }}>
              {getRelativeDate(post.createdAt)}
            </Typography>
          </Box>

          

        {/* HERO IMAGE */}
        {heroImage && (
          <Box
            component="img"
            src={heroImage}
            alt={post.title}
            sx={{
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              borderRadius: 2,
              mb: 4,
            }}
          />
        )}

        {/* MAIN CONTENT */}
        <Grid container spacing={4}>
          {/* LEFT COLUMN - ARTICLE CONTENT */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                backgroundColor: '#fff',
                borderRadius: 2,
                p: { xs: 2, md: 3 },
                boxShadow: '0 2px 8px rgba(16, 24, 40, 0.05)',
              }}
            >
              <LexicalRenderer content={post.content} />
            </Box>
          </Grid>

        {/* RIGHT COLUMN - SIDEBAR */}
<Grid item xs={12} md={4}>
  <TableOfContents content={post.content} />

  <RelatedInsights currentPostId={post.id} />
</Grid>
        </Grid>
      </Container>
      </Box>
      <Footer
        scrollToSection={(section) => navigate(`/?section=${section}`)}
        handleScrollToForm={() => navigate('/?demo=true')}
      />
    </Box>
  );
};

export default ArticleDetail;
