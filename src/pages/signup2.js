import { Container, Typography, Box } from '@mui/material'
import LoginOrRegister from '../components/LoginOrRegister/LoginOrRegister2'


export default function LoginAndSignup() {
    const params = new URLSearchParams(window.location.search)
    const previousPage = params.get('previousPage') || '/'    

    return (
      <Container maxWidth="md">
        <Box sx={{ mt:8, py: 4 }}>
          <Typography variant="h3" component="h1" align="center" gutterBottom>
            Join Opportunity Hack
          </Typography>
          

          <Typography
            variant="h6"
            component="h2"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Connect with our community to start making a difference through
            technology
          </Typography>

          <LoginOrRegister
            introText="Ready to use your skills for social good? Join our community of developers, designers, and changemakers."
            previousPage={previousPage}
          />
        </Box>
      </Container>
    );
}


