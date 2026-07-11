import './FileUpload.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function FileUpload(){
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const navigate = useNavigate();

    const uploadFile = (event) => {
        setFile(event.target.files[0]);
        setError(null);
        setShowErrorModal(false);
    };

    {/*File error handling*/}
    const getErrorDetails = (errorMessage) => {
        const errorMappings = {
            'Empty File Uploaded': {
                title: 'Empty File Detected',
                message: 'The file you uploaded appears to be empty or corrupted.',
                suggestions: [
                    'Check that the file contains content',
                    'Try saving the file again from the original application',
                    'Ensure the file is not password protected'
                ]
            },
            'No Scraper available': {
                title: 'File Format Not Supported',
                message: 'We couldn\'t process this file format or the content structure isn\'t recognized.',
                suggestions: [
                    'Ensure your file is a PDF or TXT format',
                    'Check that the file contains readable text',
                    'Try converting the file to a different supported format'
                ]
            },
            'No file part in request': {
                title: 'Upload Error',
                message: 'There was a problem uploading your file.',
                suggestions: [
                    'Try selecting the file again',
                    'Check your internet connection',
                    'Refresh the page and try again'
                ]
            }
        };

        for (const [key, details] of Object.entries(errorMappings)) {
            if (errorMessage.includes(key)) {
                return details;
            }
        }

        return {
            title: 'Upload Failed',
            message: errorMessage || 'An unexpected error occurred while processing your file.',
            suggestions: [
                'Check that your file is not corrupted',
                'Ensure the file is in a supported format (.pdf, .txt)',
                'Try refreshing the page and uploading again',
                'If the problem persists, contact support'
            ]
        };
    };

    {/*Send file to backend for processing - API call*/}
    const sendFile = async () => {
        if(!file) return;
        
        setIsUploading(true);
        setError(null);
        
        const packagedFile = new FormData();
        packagedFile.append('exam_file', file);

        try{
            const send = await fetch('http://localhost:5000/api/upload_exam', {
                method: 'POST',
                body: packagedFile
            });

            const response = await send.json();

            if (!send.ok) {
                const errorMessage = response.error || response.message || `Upload failed with status: ${send.status}`;
                const errorDetails = getErrorDetails(errorMessage);
                setError(errorDetails);
                setShowErrorModal(true);
                
                setFile(null);
                const fileInput = document.getElementById('fileUploadButton');
                if (fileInput) {
                    fileInput.value = '';
                }
                return;
            }

            navigate('/filecontents', {
                state: {
                    questions: response.data,
                    fileName: file.name
                }
            });

        } catch (error) {
            console.error("Upload failed: ", error);
            const errorDetails = getErrorDetails(error.message);
            setError(errorDetails);
            setShowErrorModal(true);
            
            setFile(null);
            const fileInput = document.getElementById('fileUploadButton');
            if (fileInput) {
                fileInput.value = '';
            }
        } finally {
            setIsUploading(false);
        }
    };

    const closeErrorModal = () => {
        setShowErrorModal(false);
        setError(null);
    };

    const retryUpload = () => {
        closeErrorModal();
        const fileInput = document.getElementById('fileUploadButton');
        if (fileInput) {
            fileInput.click();
        }
    };

    return(
        <div>
            <Link to="/">
                <button className="logoHomeButton">
                    <img src="/images/cornerLogo.png" className="smallLogo" alt="Home" />
                </button>
            </Link>

            <Link to="/usermanual">
                <button className="userManualButton">User Manual</button>
            </Link>
            <Link to="/about">
                <button className="aboutButton">About BLA</button>
            </Link>

            <div className="fu-lightgrey-container">
                <Link to="/entry">
                    <button className="ceBackButton">
                        <img src="/images/backButton.png" className="ceBackSymbol" alt="Back" />
                    </button>
                </Link>
                <div className="fuHeader">
                    <h1>Upload Document</h1>
                    <h3>Compatible file types for question paper include: .pdf, .txt</h3>
                </div>
                {!file ? (
                    <div className="chooseFileButton">
                        <img src="/images/cloudSymbol.png" className="fuCloudSymbol" alt="Upload" />
                        <h2>No files uploaded</h2>
                        <label htmlFor="fileUploadButton" className="newFileUploadButton">Select File</label>
                        <input 
                            id="fileUploadButton" 
                            type="file" 
                            accept=".pdf, .txt" 
                            onChange={uploadFile}
                        />
                    </div>
                ) : (
                    <div className="afterSelected">
                        <img src="/images/cloudSymbol.png" className="fuCloudSymbol2" alt="File Ready" />
                        <div className="fileAndSymbol">
                            <img src="/images/fileSymbol.png" className="fuFileSymbol" alt="File" />
                            <h2>{file.name}</h2>
                        </div>

                        <button className="fuNextButton" onClick={sendFile} disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Next'}
                        </button>
                    </div>
                )}
            </div>

            {showErrorModal && error && (
                <div className="errorModalOverlay" onClick={closeErrorModal}>
                    <div className="errorModal" onClick={e => e.stopPropagation()}>
                        <div className="errorModalHeader">
                            <div className="errorIcon">⚠️</div>
                            <h2>{error.title}</h2>
                            <button className="closeButton" onClick={closeErrorModal}>×</button>
                        </div>
                        
                        <div className="errorModalBody">
                            <p className="errorMessage">{error.message}</p>
                            
                            <div className="suggestions">
                                <h4>What you can try:</h4>
                                <ul>
                                    {error.suggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        <div className="errorModalFooter">
                            <button className="retryButton" onClick={retryUpload}>
                                Try Another File
                            </button>
                            <button className="closeModalButton" onClick={closeErrorModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FileUpload;
