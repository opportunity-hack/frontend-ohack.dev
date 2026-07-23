import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Box, CircularProgress, Alert, Skeleton } from "@mui/material";
import HackathonRequestForm from "../../../components/HackathonRequest/HackathonRequestForm";
import {
  RefinedRoot,
  RefinedFonts,
  Eyebrow,
} from "../../../components/design/refined";
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
        setError(
          "We couldn't retrieve the hackathon request. It may have been deleted or you don't have permission to view it."
        );
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

      ga.event({
        action: "update",
        category: "EditHackathonRequest",
        label: "request_updated",
        value: request_id,
      });

      // Redirect home after a successful update
      setTimeout(() => router.push("/"), 3000);
      return true;
    } catch (err) {
      console.error("Error updating hackathon request:", err);
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
        <title>Edit Hackathon Request | Opportunity Hack</title>
        <meta
          name="description"
          content="Update your hackathon request details — event specifics, nonprofit partnerships, and organizational details for your Opportunity Hack event."
        />
        <meta name="robots" content="noindex,nofollow" />
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        <section
          className="ohx-wrap ohx-narrow"
          style={{
            paddingTop: "clamp(104px, 13vh, 156px)",
            paddingBottom: "clamp(48px, 7vh, 80px)",
          }}
        >
          <Eyebrow>Edit your request</Eyebrow>
          <h1 className="ohx-display" style={{ marginTop: 14, fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Update your event details
          </h1>
          <p className="ohx-lead" style={{ marginTop: 16, marginBottom: 32 }}>
            Make any changes below and save — we'll pick up the latest version
            before your planning call.
          </p>

          {loading ? (
            <Box>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="rectangular" height={600} sx={{ mt: 2, borderRadius: 2 }} />
            </Box>
          ) : error ? (
            <div className="ohx-card" style={{ padding: 28 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 20 }}>
                Please return to the homepage or reach out if you believe this is
                a mistake.
              </p>
              <button
                type="button"
                className="ohx-btn ohx-btn--primary"
                onClick={() => router.push("/")}
              >
                Return to homepage
              </button>
            </div>
          ) : requestData ? (
            <HackathonRequestForm
              initialData={requestData}
              onSubmit={handleUpdateRequest}
              isEdit={true}
            />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
              <CircularProgress />
            </Box>
          )}
        </section>
      </RefinedRoot>
    </>
  );
}
