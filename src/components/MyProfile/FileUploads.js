import React, { useState, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    IconButton,
    Chip,
    Alert,
    LinearProgress,
    Grid
} from '@mui/material';
import { 
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { SectionTitle } from './styles';

const FileUploads = ({ 
    resumeFile, 
    receiptFiles = [], 
    onResumeUpload, 
    onReceiptUpload, 
    onFileDelete,
    isUploading = false 
}) => {
    const [uploadErrors, setUploadErrors] = useState({});

    // File validation
    const validateFile = (file, type) => {
        const errors = [];
        
        if (type === 'resume') {
            if (file.type !== 'application/pdf') {
                errors.push('Resume must be a PDF file');
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                errors.push('Resume file size must be less than 10MB');
            }
        } else if (type === 'receipt') {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                errors.push('Receipt must be PDF, JPG, or PNG format');
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                errors.push('Receipt file size must be less than 5MB');
            }
        }
        
        return errors;
    };

    // Resume dropzone
    const onResumeDropAccepted = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        const errors = validateFile(file, 'resume');
        
        if (errors.length > 0) {
            setUploadErrors({ resume: errors });
            return;
        }
        
        setUploadErrors({ ...uploadErrors, resume: null });
        onResumeUpload(file);
    }, [onResumeUpload, uploadErrors]);

    const resumeDropzone = useDropzone({
        onDrop: onResumeDropAccepted,
        accept: {
            'application/pdf': ['.pdf']
        },
        multiple: false,
        disabled: isUploading
    });

    // Receipt dropzone
    const onReceiptDropAccepted = useCallback((acceptedFiles) => {
        const validFiles = [];
        const errors = [];
        
        acceptedFiles.forEach((file, index) => {
            const fileErrors = validateFile(file, 'receipt');
            if (fileErrors.length > 0) {
                errors.push(...fileErrors);
            } else {
                validFiles.push(file);
            }
        });
        
        if (errors.length > 0) {
            setUploadErrors({ receipt: errors });
            return;
        }
        
        setUploadErrors({ ...uploadErrors, receipt: null });
        validFiles.forEach(file => onReceiptUpload(file));
    }, [onReceiptUpload, uploadErrors]);

    const receiptDropzone = useDropzone({
        onDrop: onReceiptDropAccepted,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        multiple: true,
        disabled: isUploading
    });

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        if (extension === 'pdf') {
            return <PdfIcon sx={{ mr: 1 }} />;
        }
        if (['jpg', 'jpeg', 'png'].includes(extension)) {
            return <ImageIcon sx={{ mr: 1 }} />;
        }
        return null;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Box>
            <SectionTitle variant="h6">File Uploads</SectionTitle>
            
            {/* Resume Upload Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Resume (PDF only)
                </Typography>
                
                {/* Resume Dropzone */}
                <Box
                    {...resumeDropzone.getRootProps()}
                    sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: resumeDropzone.isDragActive ? 'copy' : 'pointer',
                        backgroundColor: resumeDropzone.isDragActive ? '#f5f5f5' : 'transparent',
                        '&:hover': {
                            borderColor: '#3f51b5',
                            backgroundColor: '#f8f9fa'
                        }
                    }}
                >
                    <input {...resumeDropzone.getInputProps()} />
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#999', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                        {resumeDropzone.isDragActive 
                            ? 'Drop your resume here...'
                            : 'Drag & drop your resume here, or click to select'
                        }
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        PDF files only, max 10MB
                    </Typography>
                </Box>

                {/* Current Resume Display */}
                {resumeFile && (
                    <Box sx={{ mt: 2 }}>
                        <Chip
                            icon={getFileIcon(resumeFile.name || resumeFile.filename)}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                        {resumeFile.name || resumeFile.filename}
                                    </Typography>
                                    {resumeFile.size && (
                                        <Typography variant="caption" color="textSecondary">
                                            ({formatFileSize(resumeFile.size)})
                                        </Typography>
                                    )}
                                </Box>
                            }
                            onDelete={() => onFileDelete('resume', resumeFile.id || 'current')}
                            deleteIcon={<DeleteIcon />}
                            variant="outlined"
                            sx={{ maxWidth: '100%' }}
                        />
                    </Box>
                )}

                {/* Resume Upload Errors */}
                {uploadErrors.resume && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {uploadErrors.resume.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </Alert>
                )}
            </Box>

            {/* Receipt Upload Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Receipts (PDF, JPG, PNG)
                </Typography>
                
                {/* Receipt Dropzone */}
                <Box
                    {...receiptDropzone.getRootProps()}
                    sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: receiptDropzone.isDragActive ? 'copy' : 'pointer',
                        backgroundColor: receiptDropzone.isDragActive ? '#f5f5f5' : 'transparent',
                        '&:hover': {
                            borderColor: '#3f51b5',
                            backgroundColor: '#f8f9fa'
                        }
                    }}
                >
                    <input {...receiptDropzone.getInputProps()} />
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#999', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                        {receiptDropzone.isDragActive 
                            ? 'Drop your receipts here...'
                            : 'Drag & drop receipts here, or click to select'
                        }
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        PDF, JPG, PNG files, max 5MB each
                    </Typography>
                </Box>

                {/* Current Receipts Display */}
                {receiptFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Uploaded Receipts ({receiptFiles.length}):
                        </Typography>
                        <Grid container spacing={1}>
                            {receiptFiles.map((receipt, index) => (
                                <Grid item key={receipt.id || index} xs={12} sm={6} md={4}>
                                    <Chip
                                        icon={getFileIcon(receipt.name || receipt.filename)}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                    {receipt.name || receipt.filename}
                                                </Typography>
                                                {receipt.size && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        ({formatFileSize(receipt.size)})
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                        onDelete={() => onFileDelete('receipt', receipt.id || index)}
                                        deleteIcon={<DeleteIcon />}
                                        variant="outlined"
                                        sx={{ maxWidth: '100%' }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Receipt Upload Errors */}
                {uploadErrors.receipt && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {uploadErrors.receipt.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </Alert>
                )}
            </Box>

            {/* Upload Progress */}
            {isUploading && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Uploading files...
                    </Typography>
                    <LinearProgress />
                </Box>
            )}
        </Box>
    );
};

export default FileUploads;