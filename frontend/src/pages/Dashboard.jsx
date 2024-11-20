import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import "../styles/global.css";

const Dashboard = () => {
    const [userEmail, setUserEmail] = useState("");
    const [userFiles, setUserFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Pobranie danych użytkownika
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://127.0.0.1:8000/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }

                const userData = await response.json();
                setUserEmail(userData.email);
            } catch (err) {
                console.error("Error fetching user data:", err.message);
            }
        };

        fetchUserData();
    }, []);

    // Pobranie plików użytkownika
    useEffect(() => {
        const fetchUserFiles = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://127.0.0.1:8000/api/files", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user files");
                }

                const files = await response.json();
                setUserFiles(files);
            } catch (err) {
                console.error("Error fetching user files:", err.message);
            }
        };

        fetchUserFiles();
    }, []);

    // Kliknięcie kafelka
    const handleFileClick = (file) => {
        setSelectedFile(file);
        setShowModal(true);
    };

    // Zamknięcie modala
    const closeModal = () => {
        setSelectedFile(null);
        setShowModal(false);
    };

    return (
        <div className="gradient-background">
            <NavBar />
            <div className="dashboard-container">
                <div className="greeting">Hello, {userEmail}</div>
                <div className="file-grid">
                    {userFiles.map((file) => (
                        <div
                            key={file.id}
                            className="file-tile"
                            onClick={() => handleFileClick(file)}
                        >
                            <img
                                src={`data:image/png;base64,${btoa(
                                    new Uint8Array(file.file_data).reduce(
                                        (data, byte) => data + String.fromCharCode(byte),
                                        ""
                                    )
                                )}`}
                                alt={file.file_name}
                                className="file-thumbnail"
                            />
                            <div className="file-name">{file.file_name}</div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>File Details</h2>
                            {selectedFile && (
                                <div className="file-details">
                                    <p><strong>File Name:</strong> {selectedFile.file_name}</p>
                                    <p><strong>Analysis Result:</strong> {selectedFile.analysis_result || "N/A"}</p>
                                    <p><strong>Uploaded At:</strong> {new Date(selectedFile.uploaded_at).toLocaleString()}</p>
                                    <p><strong>Does Match:</strong> {selectedFile.does_match ? "Yes" : "No"}</p>
                                </div>
                            )}
                            <button className="btn btn-secondary" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
