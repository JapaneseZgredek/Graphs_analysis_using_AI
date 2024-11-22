import React, {useEffect, useState} from 'react';
import NavBar from '../NavBar';
import '../../styles/global.css';

const GenerateDescription = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [inputType, setInputType] = useState("file");
    const [displayedText, setDisplayedText] = useState("");
    const [textIndex, setTextIndex] = useState(0);

    const fullDescription = 'Welcome to the Generate Description tool! ' +
        'Here, you can upload an infographic file to automatically generate a meaningful description ' +
        'using our AI-powered analysis. Simply select an image and click "Upload & Analyze".';

    useEffect(() => {
        if (textIndex < fullDescription.length) {
            const timer = setTimeout(() => {
                setDisplayedText((prev) => prev + fullDescription[textIndex]);
                setTextIndex((prev) => prev + 1);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [textIndex, fullDescription]);


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
        setAnalysisResult(null);
    };

    const validateImageUrl = async (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true); // Valid image
            img.onerror = () => resolve(false); // Invalid image
            img.src = url;
        });
    };

    const handleUrlInput = async (e) => {
        const url = e.target.value;
        setImageUrl(url);
        setSelectedFile(null);

        if (url.trim() === "") {
            setPreviewUrl(null);
            setError("Please enter a valid image URL.");
            return;
        }

        const isValid = await validateImageUrl(url);
        if (isValid) {
            setPreviewUrl(url);
            setError("");
        } else {
            setPreviewUrl(null);
            setError("Please enter a valid image URL.");
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const convertUrlToBase64 = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch the image from the URL.");
            }
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(",")[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.log("Error converting URL to Base64: ", error.message);
            throw new Error("Failed to convert URL to Base64.");
        }
    };

    const handleUploadAndAnalyze = async () => {
        if (!selectedFile && !imageUrl.trim()) {
            setError("Please provide an image file or a valid URL.");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const userResponse = await fetch("http://127.0.0.1:8000/api/users/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!userResponse.ok) {
                throw new Error("Failed to fetch user details");
            }

            const userData = await userResponse.json();
            const userId = userData.id;

            let base64File;

            if (selectedFile) {
                base64File = await convertFileToBase64(selectedFile);
            } else if (imageUrl.trim()) {
                base64File = await convertUrlToBase64(imageUrl.trim());
            }

            const payload = {
                user_id: userId,
                file_name: selectedFile ? selectedFile.name : "image_from_url",
                uploaded_text: "",
                file: base64File,
            };

            console.log("Payload being sent:", payload);

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
            <NavBar/>
            {!previewUrl &&
                <div className="info-box">
                    <p>{displayedText}</p>
                </div>
            }
            <div className="centered-content">
                <div
                    className={`upload-container ${
                        previewUrl ? "expanded" : "initial"
                    }`}
                >
                    <h2 className="text-center">Generate Description</h2>
                    <div className="mb-3">
                        <div className="toggle-input">
                            <label>
                                <input
                                    type="radio"
                                    name="inputType"
                                    value="file"
                                    checked={inputType === "file"}
                                    onChange={() => {
                                        setInputType("file");
                                        setImageUrl("");
                                        setPreviewUrl(null);
                                        setAnalysisResult(null);
                                    }}
                                />
                                Upload File
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="inputType"
                                    value="url"
                                    checked={inputType === "url"}
                                    onChange={() => {
                                        setInputType("url");
                                        setSelectedFile(null);
                                        setPreviewUrl(null)
                                        setAnalysisResult(null);
                                    }}
                                />
                                Enter URL
                            </label>
                        </div>
                        {inputType === "file" ? (
                            <input
                                type="file"
                                className={`form-control ${error ? "is-invalid" : ""}`}
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        ) : (
                            <input
                                type="text"
                                className={`form-control ${error ? "is-invalid" : ""}`}
                                placeholder="Enter image URL"
                                value={imageUrl}
                                onChange={handleUrlInput}
                            />
                        )}
                        {error && <div className="invalid-feedback text-center">{error}</div>}
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