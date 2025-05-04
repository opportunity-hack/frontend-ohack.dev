import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Typography,
  Box,
  Container,
  CircularProgress,
  Paper,
  Button,
  Alert,
  Skeleton,
  Breadcrumbs,
} from "@mui/material";
import HackathonRequestForm from "../../../components/HackathonRequest/HackathonRequestForm";
import { parse as parseDate } from "date-fns";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import * as ga from "../../../lib/ga";

export default function EditHackathonRequest() {
  const router = useRouter();
  const { request_id } = router.query;
  
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch hackathon request data
  useEffect(() => {
    async function fetchRequestData() {
      if (!request_id) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/create-hackathon/${request_id}`
        );
        
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convert date strings to Date objects
        if (data.expectedHackathonDate) {
          // Handle ISO date format (e.g. "2025-05-30T07:00:00.000Z")
          data.expectedHackathonDate = new Date(data.expectedHackathonDate);
        }
        if (data.preferredDate) {
          data.preferredDate = new Date(data.preferredDate);
        }
        if (data.alternateDate) {
          data.alternateDate = new Date(data.alternateDate);
        }
        
        setRequestData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching hackathon request:", err);
        setError("We couldn't retrieve the hackathon request. It may have been deleted or you don't have permission to view it.");
        // Track error event
        ga.event({
          action: "error",
          category: "EditHackathonRequest",
          label: "fetch_request_failed",
          value: request_id,
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchRequestData();
  }, [request_id]);
  
  // Handle form submission for updating the request
  const handleUpdateRequest = async (formData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/create-hackathon/${request_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Update failed with status: ${response.status}`);
      }
      
      // Track successful update
      ga.event({
        action: "update",
        category: "EditHackathonRequest",
        label: "request_updated",
        value: request_id,
      });
      
      // Redirect to home or confirmation page after successful update
      setTimeout(() => router.push("/"), 3000);
      return true;
    } catch (err) {
      console.error("Error updating hackathon request:", err);
      // Track error event
      ga.event({
        action: "error",
        category: "EditHackathonRequest",
        label: "update_request_failed",
        value: request_id,
      });
      throw err;
    }
  };
  
  return (
    <>
      <Head>
        <title>
          Edit Hackathon Request | Opportunity Hack
        </title>
        <meta
          name="description"
          content="Update your hackathon request details. Modify event specifics, nonprofit partnerships, and organizational details for your Opportunity Hack event."
        />
      </Head>
      
      <Container maxWidth="lg">
        <Box mt={4} mb={2}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link href="/" passHref>
              <Button 
                color="inherit" 
                size="small" 
                startIcon={<HomeIcon />}
                component="a"
              >
                Home
              </Button>
            </Link>
            <Link href="/hack" passHref>
              <Button 
                color="inherit"
                size="small"
                component="a"
              >
                Hackathons
              </Button>
            </Link>
            <Typography color="textPrimary" sx={{ display: 'flex', alignItems: 'center' }}>
              <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
              Edit Request
            </Typography>
          </Breadcrumbs>
        </Box>
        
        <Box mt={4} mb={6}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ fontWeight: 700 }}
          >
            Edit Hackathon Request
          </Typography>
          
          <Typography variant="h6" component="h2" gutterBottom color="textSecondary">
            Update your Opportunity Hack event details
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              <Skeleton width="60%" />
            </Typography>
            <Skeleton variant="rectangular" height={600} />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 4, my: 4, bgcolor: "#fff5f5" }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography paragraph>
              Please return to the homepage or contact us if you believe this is a mistake.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/")}
            >
              Return to Homepage
            </Button>
          </Paper>
        ) : requestData ? (
          <HackathonRequestForm 
            initialData={requestData}
            onSubmit={handleUpdateRequest}
            isEdit={true}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        )}
      </Container>
    </>
  );
}