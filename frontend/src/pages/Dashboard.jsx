import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import '../styles/global.css';

const Dashboard = () => {
    const [userFiles, setUserFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                            <img
                                src={selectedFile.file_preview}
                                alt={selectedFile.file_name}
                                className="modal-image"
                            />
                            <p><strong>File Name:</strong> {selectedFile.file_name}</p>
                            <p><strong>Uploaded At:</strong> {new Date(selectedFile.uploaded_at).toLocaleString()}</p>
                            {selectedFile.analysis_result && (
                                <p><strong>Analysis Result:</strong> {selectedFile.analysis_result}</p>
                            )}
                            {selectedFile.uploaded_text && (
                                <p><strong>Description:</strong> {selectedFile.uploaded_text}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
