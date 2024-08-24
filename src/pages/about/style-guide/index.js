import React from 'react';
import { Typography, Grid, Box, Button, Link } from '@mui/material';
import { LayoutContainer, TitleContainer, ProjectsContainer } from '../../../styles/nonprofit/styles';
import Head from 'next/head';
import Image from 'next/image';

export default function StyleGuide(){
  const colors = {
    darkBlue: '#003087',
    lightBlue: '#009CDE',
  };

  const logoVariants = [
    { name: 'Banner', aspect: '3 / 1' },
    { name: 'Cropped', aspect: '2 / 1' },
    { name: 'Square', aspect: '1 / 1' },
  ];

  const logoColors = ['Black', 'Dark_Blue', 'Light_Blue', 'White'];

  const twoLetterLogoColors = ['Black', 'Dark_Blue', 'Light_Blue'];

  const LogoDownloadButton = ({ type, color, variant }) => {
    const basePath = 'https://cdn.ohack.dev/ohack.dev/logos/';
    const fileName = type === 'full' 
      ? `OpportunityHack_Logo_${color}_${variant}.svg`
      : `OpportunityHack_2Letter_${color}.svg`;
    const pngFileName = fileName.replace('.svg', '.png');

    return (
      <Box mt={1}>
        <Button variant="outlined" size="small" sx={{ mr: 1 }}>
          <Link href={`${basePath}${pngFileName}`} target="_blank" rel="noopener noreferrer">
            PNG
          </Link>
        </Button>
        { ((type === "2-letter") || (type === "full" && color === "Black" && variant === "Cropped")) && <Button variant="outlined" size="small">
          <Link href={`${basePath}${fileName}`} target="_blank" rel="noopener noreferrer">
            SVG
          </Link>
        </Button>
        }
      </Box>
    );
  };

  return (
    <LayoutContainer container>
      <Head>
        <title>Opportunity Hack Brand Guide: Logos, Colors, and UX Guidelines</title>
        <meta name="description" content="Official brand guide for Opportunity Hack. Download logos, learn color schemes, and explore UX guidelines. Perfect for volunteers, designers, and developers working on social good projects." />
        <meta property="og:title" content="Opportunity Hack Brand Guide: Logos, Colors, and UX Guidelines" />
        <meta property="og:description" content="Access Opportunity Hack's official logos, color schemes, and UX guidelines. Ideal for volunteers and designers working on tech for social good projects." />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Dark_Blue_Square.png" />
        <meta property="og:url" content="https://ohack.dev/styleguide" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Opportunity Hack Brand Guide: Logos, Colors, and UX Guidelines" />
        <meta name="twitter:description" content="Download Opportunity Hack logos, explore our color palette, and learn UX best practices for social good tech projects." />
        <meta name="twitter:image" content="https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Dark_Blue_Square.png" />
        <meta name="keywords" content="Opportunity Hack, logo, brand guide, style guide, UX guidelines, nonprofit tech, social good, volunteer, design, development, hackathon" />
        <link rel="canonical" href="https://ohack.dev/styleguide" />
      </Head>

      <TitleContainer container>
        <Typography variant="h2">
          Opportunity Hack Brand and Style Guide
        </Typography>
        <Typography variant="body1">
          Welcome to the official brand and style guide for Opportunity Hack. This comprehensive resource provides everything you need to maintain consistency across our visual identity and user experience design.
        </Typography>
      </TitleContainer>

      <ProjectsContainer>
        <Box mt={4}>
          <Typography variant="h2" gutterBottom>
            Brand Colors
          </Typography>
          <Typography variant="body1" gutterBottom>
            Our color palette reflects our commitment to innovation and social good. Use these colors consistently across all Opportunity Hack materials and digital products.
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(colors).map(([name, value]) => (
              <Grid item key={name} xs={6} sm={3}>
                <Box
                  sx={{
                    width: '100%',
                    height: 100,
                    backgroundColor: value,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    marginBottom: 1,
                  }}
                >
                  {name}
                </Box>
                <Typography variant="body1">{value}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box mt={4}>
          <Typography variant="h2" gutterBottom>
            Typography
          </Typography>
          <Typography variant="body1" gutterBottom>
            Consistent typography helps maintain a cohesive look across our platform and materials. Here are our standard text styles:
          </Typography>
          <Typography variant="h1" gutterBottom>Heading 1</Typography>
          <Typography variant="h2" gutterBottom>Heading 2</Typography>
          <Typography variant="h3" gutterBottom>Heading 3</Typography>
          <Typography variant="h4" gutterBottom>Heading 4</Typography>
          <Typography variant="body1" gutterBottom>Body 1: This is the main body text style.</Typography>
          <Typography variant="body2" gutterBottom>Body 2: This is the secondary body text style.</Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h2" gutterBottom>
            UI Components: Buttons
          </Typography>
          <Typography variant="body1" gutterBottom>
            Our button styles are designed for clarity and ease of use. Use these consistently in your UX designs:
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" color="primary">Primary Button</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary">Secondary Button</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary">Outlined Button</Button>
            </Grid>
          </Grid>
        </Box>

      <Box mt={4}>
        <Typography variant="h2" gutterBottom>
          Logo Usage and Downloads
        </Typography>
        <Typography variant="body1" gutterBottom>
          Our logo is the face of Opportunity Hack. We offer various versions to suit different design needs. Choose the appropriate logo based on your project requirements. All logos are available in both SVG and PNG formats.
        </Typography>
        
        <Typography variant="h3" mt={2}>Full Logo</Typography>
        {logoColors.map(color => (
          <Box key={color} mt={2}>
            <Typography variant="h4">{color.replace('_', ' ')}</Typography>
            <Grid container spacing={2}>
              {logoVariants.map(variant => (
                <Grid item xs={12} sm={4} key={variant.name}>
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: variant.aspect,
                      border: '1px solid #ccc',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: color === 'White' ? '#ccc' : 'transparent',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={`https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_${color}_${variant.name}.png`}
                      alt={`${color.replace('_', ' ')} ${variant.name} Logo`}
                        width={10 * variant.aspect.split(' / ')[0]}
                        height={10 * variant.aspect.split(' / ')[1]}
                      layout="responsive"
                      
                    />
                  </Box>
                  <Typography variant="body2" mt={1}>{variant.name}</Typography>
                  <LogoDownloadButton type="full" color={color} variant={variant.name} />
                
                  
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        <Typography variant="h3" mt={4}>2-Letter Logo</Typography>
        <Typography variant="body1" gutterBottom>
            Generated with this AI prompt from <Button href="https://ideogram.ai/u/ohack/liked" variant='outlined' target="_blank">Ideogram.ai</Button>
            <blockquote>
            A sleek and modern logo design featuring a harmonious combination of a minimalist “O” and a bold “H”. The “O” is a perfect circle with an open right side, inviting viewers to explore its contents. The “H” is nestled inside, forming a visually appealing and subtle heart shape in the upper left quadrant. The design is crafted with geometric precision, using angular, circuit-like lines in a dark, navy blue or charcoal gray color. The balanced and symmetrical composition makes it adaptable for various sizes, from small icons to large displays, showcasing a sense of sophistication and elegance.
            </blockquote>
        </Typography>

        <Grid container spacing={2}>
          {twoLetterLogoColors.map(color => (
            <Grid item xs={12} sm={4} key={color}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  border: '1px solid #ccc',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={`https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_${color}.svg`}
                  alt={`${color.replace('_', ' ')} 2-Letter Logo`}
                  width={80}
                  height={80}
                />            
              </Box>
              <Typography variant="body1" mt={1}>{color.replace('_', ' ')}</Typography>
              <LogoDownloadButton type="2-letter" color={color} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box mt={4}>
          <Typography variant="h2" gutterBottom>
            UX Best Practices
          </Typography>
          <Typography variant="body1" style={{ fontSize:'14px' }} component="ul">
            <li>Maintain consistent use of colors across the platform</li>
            <li>Use appropriate typography hierarchy to guide users</li>
            <li>Ensure sufficient contrast for readability</li>
            <li>Use the full logo in headers and prominent places</li>
            <li>Opt for the 2-letter logo in confined spaces or as an icon</li>
            <li>Keep designs clean and uncluttered</li>
            <li>Align elements consistently for a polished look</li>
            <li>Design with accessibility in mind, following WCAG guidelines</li>
            <li>Create intuitive navigation structures</li>
            <li>Use consistent iconography throughout the platform</li>
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h2" gutterBottom>
            Get Involved
          </Typography>
          <Typography variant="body1" style={{ fontSize:'14px' }} gutterBottom>
            Are you a UX designer or developer passionate about using your skills for social good? Join Opportunity Hack and contribute to meaningful projects that make a difference. Visit our <a href="/volunteer">volunteer page</a> to learn more about how you can get involved.
          </Typography>
        </Box>
      </ProjectsContainer>
    </LayoutContainer>
  );
};