import dynamic from 'next/dynamic';
import React from 'react';
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import theme from "../../assets/theme";

// Import components without authentication dependencies
const NavBarPlaceholder = () => <Box sx={{ height: '64px', width: '100%', bgcolor: 'primary.main' }} />;
const FooterPlaceholder = () => <Box sx={{ height: '200px', width: '100%', bgcolor: 'primary.main', mt: 4 }} />;

// Import the PublicProfile component dynamically without SSR
const PublicProfileComponent = dynamic(() => import('../../components/Profile/PublicProfile'), {
    ssr: false,
    loading: () => (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            p: 3
        }}>
            <div>Loading profile...</div>
        </Box>
    )
});

export default function PublicProfilePage() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Box className="page-layout" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <NavBarPlaceholder />
                    <Box sx={{ flex: 1, p: { xs: 1, sm: 2 } }}>
                        <PublicProfileComponent />
                    </Box>
                    <FooterPlaceholder />
                </Box>
            </CssBaseline>
        </ThemeProvider>
    );
}
