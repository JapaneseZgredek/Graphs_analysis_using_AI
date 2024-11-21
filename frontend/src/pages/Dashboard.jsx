import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import '../styles/global.css';

const Dashboard = () => {
    const [userFiles, setUserFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);


    const analysisResultRef = useRef(null);
    const uploadedTextRef = useRef(null);

    const fetchUserFiles = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:8000/api/user_files", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user files.");
            }

            const data = await response.json();
            setUserFiles(data);
        } catch (err) {
            console.error("Error fetching user files:", err.message);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchUserFiles();
    }, []);

    const handleTileClick = (file) => {
        setSelectedFile(file);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
    };

    const handleDeleteFile = async (fileId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/api/files/${fileId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete file.");
            }

            await fetchUserFiles();
        } catch (err) {
            console.error("Error deleting file:", err.message);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            adjustTextareaHeight();
        }
    }, [selectedFile, isModalOpen]);

    const adjustTextareaHeight = () => {
        if (selectedFile) {
            if (analysisResultRef.current && selectedFile.analysis_result) {
                const lines = selectedFile.analysis_result.split("\n").length;
                const height = Math.min(lines * 24, 400);
                analysisResultRef.current.style.height = `${height}px`;
            }
            if (uploadedTextRef.current && selectedFile.uploaded_text) {
                const lines = selectedFile.uploaded_text.split("\n").length;
                const height = Math.min(lines * 24, 400);
                uploadedTextRef.current.style.height = `${height}px`;
            }
        }
    };

    return (
        <div className="gradient-background">
            <NavBar />
            <div className="dashboard-container">
                <h2 className="dashboard-header">Hello, Welcome to Your Dashboard</h2>
                {error && <div className="error-message">{error}</div>}
                <div className="file-grid">
                    {userFiles.map((file) => (
                        <div
                            key={file.id}
                            className="file-tile"
                            onClick={() => handleTileClick(file)} // Entire tile clickable
                        >
                            <div
                                className="delete-icon"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent modal opening when clicking delete
                                    handleDeleteFile(file.id);
                                }}
                                title="Delete File"
                            >
                                &times;
                            </div>
                            <img
                                src={file.file_preview || "placeholder-image-url.png"} // Fallback image if file_preview is missing
                                alt={file.file_name}
                                className="file-preview-img"
                            />
                            <p className="file-name">{file.file_name}</p>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && selectedFile && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={closeModal}>
                            &times;
                        </button>
                        <h3 className="modal-header">File Details</h3>
                        <div className="modal-body">
                            <div className="image-container">
                                <img
                                    src={selectedFile.file_preview}
                                    alt={selectedFile.file_name}
                                    className="modal-image"
                                />
                            </div>
                        </div>

                        <div className="data-container">
                            <label>File Name</label>
                            <input type="text" value={selectedFile.file_name} readOnly style={{ width: "100%"}} />
                        </div>

                        <div className="data-container">
                            <label>Uploaded At</label>
                            <input
                                type="text"
                                value={new Date(selectedFile.uploaded_at).toLocaleString()}
                                readOnly
                            />
                        </div>

                        {selectedFile.analysis_result && (
                            <div className="data-container">
                                <label>Analysis Result</label>
                                <textarea
                                    ref={analysisResultRef}
                                    className="auto-expand"
                                    value={selectedFile.analysis_result}
                                    readOnly
                                    style={{
                                        height: `${Math.min(
                                            selectedFile.uploaded_text.split("\n").length * 24,
                                            400
                                        )}px`,
                                    }}
                                />
                            </div>
                        )}

                        {/* Tekst przesłany przez użytkownika */}
                        {selectedFile.uploaded_text && (
                            <div className="data-container">
                                <label>Description</label>
                                <textarea
                                    ref={uploadedTextRef}
                                    className="auto-expand"
                                    value={selectedFile.uploaded_text}
                                    readOnly
                                    style={{
                                        height: `${Math.min(
                                            selectedFile.uploaded_text.split("\n").length * 24,
                                            400
                                        )}px`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
