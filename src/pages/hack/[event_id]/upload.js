import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import {
  Typography,
  Button,
  LinearProgress,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import {
  LayoutContainer,
  TitleContainer,
  ProjectsContainer,
} from "../../../styles/nonprofit/styles";
import { useEnv } from "../../../context/env.context";
import Head from "next/head";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const ACCEPTED_FILE_TYPES = ["image/*", "video/*"];

export default function EventUpload() {
  const router = useRouter();
  const { event_id } = router.query;
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState(null);
  const { googleCloudStorageBucket } = useEnv();

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const uploadFiles = async () => {
    for (let file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`${file.name} exceeds 500 MB limit`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          `https://storage.googleapis.com/upload/storage/v1/b/${googleCloudStorageBucket}/o?uploadType=media&name=${event_id}/${file.name}`,
          {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": file.type,
            },
          }
        );

        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        setUploadError(`Error uploading ${file.name}: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  if (!event_id) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <LayoutContainer>
      <Head>
        <title>
          TODO (page isn't done yet) Upload Media for Event {event_id}
        </title>
      </Head>
      <TitleContainer>
        <Typography variant="h2">
          TODO (page isn't done yet) Upload Media for Event {event_id}
        </Typography>
      </TitleContainer>
      <ProjectsContainer>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            backgroundColor: (theme) => theme.palette.grey[100],
            borderRadius: 2,
          }}
        >
          <Box
            {...getRootProps()}
            sx={{
              border: "3px dashed #1976d2",
              borderRadius: 2,
              p: 8,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
                borderColor: "primary.dark",
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon
              sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
            />
            {isDragActive ? (
              <Typography variant="h5">Drop the files here ...</Typography>
            ) : (
              <Typography variant="h5">
                Drag 'n' drop some files here, or click to select files
              </Typography>
            )}
            <Typography variant="body1" sx={{ mt: 2 }}>
              (Only images and videos up to 500 MB each are accepted)
            </Typography>
          </Box>
        </Paper>

        <Grid container spacing={2}>
          {files.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={file.name}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="body2" noWrap>
                  {file.name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress[file.name] || 0}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {uploadError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {uploadError}
          </Typography>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 4 }}
          onClick={uploadFiles}
          disabled={files.length === 0}
        >
          Upload Files
        </Button>
      </ProjectsContainer>
    </LayoutContainer>
  );
}
