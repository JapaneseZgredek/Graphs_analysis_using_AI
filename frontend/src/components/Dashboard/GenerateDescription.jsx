import React, { useState } from 'react';
import NavBar from '../NavBar';
import '../../styles/global.css';

const GenerateDescription = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            setError("No file selected");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file (jpg, png, etc.)")
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5 MB");
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        setError("");
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUploadAndAnalyze = async () => {
        if (!selectedFile) {
            setError("Pleaser provide an image.")
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const userResponse = await fetch("http://127.0.0.1:8000/api/users/me", {
                headers: { Authorization: `Bearer ${token}`}
            });

            if (!userResponse.ok) {
                throw new Error("Failed to fetch user details");
            }

            const userData = await userResponse.json();
            const userId = userData.id;

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64File = reader.result.split(",")[1];

                const payload = {
                    user_id: userId,
                    file_name: selectedFile.name,
                    uploaded_text: "",
                    file: base64File,
                };

                console.log("Payload being sent")

                const response = await fetch("http://127.0.0.1:8000/api/files", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || "Failed to upload file");
                }

                const data = await response.json();
                console.log("File uploaded successfully", data);

                await handleAnalyzeFile(data.id);
            };

            reader.readAsDataURL(selectedFile);
        } catch (err) {
            console.error("Error during file upload:", err.message);
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAnalyzeFile = async (fileId) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(
                'http://127.0.0.1:8000/api/analyze_file/' + fileId,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to analyze image");
            }

            const result = await response.json();
            console.log("Analysis result:", result);
            setAnalysisResult(result.analysis_result);
        } catch (err) {
            console.error("Error during image analysis: ", err.message);
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="gradient-background">
            <NavBar />
            <div className="centered-content">
                <div
                    className={`upload-container ${
                        previewUrl ? "expanded" : "initial"
                    }`}
                >
                    <h2 className="text-center">Generate Description</h2>
                    <div className="mb-3">
                        <input
                            type="file"
                            className={`form-control ${error ? "is-invalid" : ""}`}
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {error && <div className="invalid-feedback text-center">{error}</div> }
                    </div>
                    {previewUrl && (
                        <div className="image-preview mt-4">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "400px",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                }}
                            />
                        </div>
                    )}
                    {previewUrl && (
                        <button
                            className="btn btn-primary w-100 mt-3 animate-button"
                            onClick={handleUploadAndAnalyze}
                            disabled={isUploading || isAnalyzing}
                        >
                            {isUploading ? "Uploading..." : isAnalyzing ? "Analyzing..." : "Upload & Analyze"}
                        </button>
                    )}
                    {analysisResult && (
                        <div className="mt-4">
                            <h3>Analysis Result:</h3>
                            <p>{analysisResult}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateDescription;