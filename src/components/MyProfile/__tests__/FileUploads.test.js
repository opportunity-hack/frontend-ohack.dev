import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import FileUploads from '../FileUploads';

// Mock props for testing
const defaultProps = {
    resumeFile: null,
    receiptFiles: [],
    onResumeUpload: jest.fn(),
    onReceiptUpload: jest.fn(),
    onFileDelete: jest.fn(),
    isUploading: false
};

const renderWithSnackbar = (component) => {
    return render(
        <SnackbarProvider maxSnack={3}>
            {component}
        </SnackbarProvider>
    );
};

describe('FileUploads Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders file upload dropzones', () => {
        renderWithSnackbar(<FileUploads {...defaultProps} />);
        
        expect(screen.getByText('File Uploads')).toBeInTheDocument();
        expect(screen.getByText('Resume (PDF only)')).toBeInTheDocument();
        expect(screen.getByText('Receipts (PDF, JPG, PNG)')).toBeInTheDocument();
        expect(screen.getByText('Drag & drop your resume here, or click to select')).toBeInTheDocument();
        expect(screen.getByText('Drag & drop receipts here, or click to select')).toBeInTheDocument();
    });

    test('displays uploaded resume file', () => {
        const resumeFile = {
            id: 'test-resume-1',
            name: 'test-resume.pdf',
            filename: 'test-resume.pdf',
            size: 1024
        };

        const props = {
            ...defaultProps,
            resumeFile
        };

        renderWithSnackbar(<FileUploads {...props} />);
        
        expect(screen.getByText('test-resume.pdf')).toBeInTheDocument();
        expect(screen.getByText('(1 KB)')).toBeInTheDocument();
    });

    test('displays uploaded receipt files', () => {
        const receiptFiles = [
            {
                id: 'receipt-1',
                name: 'receipt1.jpg',
                filename: 'receipt1.jpg',
                size: 2048
            },
            {
                id: 'receipt-2',
                name: 'receipt2.pdf',
                filename: 'receipt2.pdf',
                size: 3072
            }
        ];

        const props = {
            ...defaultProps,
            receiptFiles
        };

        renderWithSnackbar(<FileUploads {...props} />);
        
        expect(screen.getByText('Uploaded Receipts (2):')).toBeInTheDocument();
        expect(screen.getByText('receipt1.jpg')).toBeInTheDocument();
        expect(screen.getByText('receipt2.pdf')).toBeInTheDocument();
        expect(screen.getByText('(2 KB)')).toBeInTheDocument();
        expect(screen.getByText('(3 KB)')).toBeInTheDocument();
    });

    test('calls onFileDelete when delete button is clicked', () => {
        const resumeFile = {
            id: 'test-resume-1',
            name: 'test-resume.pdf',
            filename: 'test-resume.pdf',
            size: 1024
        };

        const props = {
            ...defaultProps,
            resumeFile
        };

        renderWithSnackbar(<FileUploads {...props} />);
        
        // The delete icon is inside the chip button
        const deleteIcon = screen.getByTestId('DeleteIcon');
        fireEvent.click(deleteIcon);
        
        expect(props.onFileDelete).toHaveBeenCalledWith('resume', 'test-resume-1');
    });

    test('shows upload progress indicator when uploading', () => {
        const props = {
            ...defaultProps,
            isUploading: true
        };

        renderWithSnackbar(<FileUploads {...props} />);
        
        expect(screen.getByText('Uploading files...')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('formats file sizes correctly', () => {
        const resumeFile = {
            id: 'test-resume-1',
            name: 'large-resume.pdf',
            filename: 'large-resume.pdf',
            size: 1048576 // 1 MB
        };

        const props = {
            ...defaultProps,
            resumeFile
        };

        renderWithSnackbar(<FileUploads {...props} />);
        
        expect(screen.getByText('(1 MB)')).toBeInTheDocument();
    });

    test('handles files without size information', () => {
        const resumeFile = {
            id: 'test-resume-1',
            name: 'resume-no-size.pdf',
            filename: 'resume-no-size.pdf'
            // no size property
        };

        const props = {
            ...defaultProps,
            resumeFile
        };

        renderWithSnackbar(<FileUploads {...props} />);
        
        expect(screen.getByText('resume-no-size.pdf')).toBeInTheDocument();
        // Should not show size when not available
        expect(screen.queryByText(/\(\d+/)).not.toBeInTheDocument();
    });
});