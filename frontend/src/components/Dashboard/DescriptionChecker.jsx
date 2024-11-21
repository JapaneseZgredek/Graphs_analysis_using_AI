import React, {useEffect, useState} from 'react';
import NavBar from '../NavBar';
import '../../styles/global.css';

const DescriptionChecker = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState("");
    const [textInput, setTextInput] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [displayedText, setDisplayedText] = useState("")
    const [textIndex, setTextIndex] = useState(0);

    const fullDescription = 'Welcome to Validate Description tool! ' +
                                    'Here, you can upload an infographic file with description of what is ' +
                                    ' shown in it, then check with power our AI-powered analysis tool whether ' +
                                    ' description match infographic';

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
            setError("Please select a valid image file (jpg, png, etc.)");
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

    const handleUpload = async () => {
        if (!selectedFile || !textInput.trim()) {
            setError("Please provide an image and a description.");
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
                const errorResponse = await userResponse.json();
                throw new Error(errorResponse.detail || "Failed to fetch user details");
            }

            const userData = await userResponse.json();
            const userId = userData.id;

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64File = reader.result.split(",")[1]; // Pobieramy dane base64

                const payload = {
                    user_id: userId,
                    file_name: selectedFile.name, // Nazwa pliku
                    uploaded_text: textInput.trim(),
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
                    const errorResponse = await response.json();
                    console.error("Backend error response:", errorResponse);
                    throw new Error(errorResponse.detail || "Failed to upload file");
                }

                const data = await response.json();
                console.log("File uploaded successfully:", data);

                await handleAnalyzeImage(data.id);
            };

            reader.readAsDataURL(selectedFile); // Odczyt pliku w formacie base64
        } catch (err) {
            console.error("Error during file upload:", err.message);
            setError(err.message || "An error occurred during file upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAnalyzeImage = async (fileId) => {
        setIsAnalyzing(true);
        try {
            const payload = {
                description: textInput.trim(),
            };

            console.log("Sending payload to analyze endpoint:", payload); // Loguj dane wysyłane do API

            const response = await fetch(
                `http://127.0.0.1:8000/api/analyze_image_with_description/${fileId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error("Backend error response:", errorResponse); // Loguj błędy z backendu
                throw new Error("Failed to analyze image with description");
            }

            const result = await response.json();
            console.log("Analysis result:", result); // Loguj wynik analizy
            setAnalysisResult(result.analysis_result);
        } catch (err) {
            console.error("Error during image analysis:", err.message);
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="gradient-background">
            <NavBar />
            {!previewUrl &&
                <div className="info-box text-center">
                    <p>{displayedText}</p>
                </div>
            }
            <div className="centered-content">
                <div
                    className={`upload-container ${
                        previewUrl ? "expanded" : "initial"
                    }`}
                >
                    <h2 className="text-center">Upload Your File</h2>
                    <div className="mb-3">
                        <input
                            type="file"
                            className={`form-control ${error ? "is-invalid" : ""}`}
                            onChange={handleFileChange}
                            accept="image/*"
                        />
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
                            <textarea
                                className="text-input mt-3"
                                placeholder="Enter your description here..."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                            />
                        </div>
                    )}
                    {previewUrl && textInput.trim() && (
                        <button
                            className="btn btn-primary w-100 mt-3 animate-button"
                            onClick={handleUpload}
                        >
                            {isUploading ? "Uploading...": isAnalyzing ? "Analyzing...": "Upload"}
                        </button>
                    )}
                    {analysisResult && (
                        <div className="mt-4">
                            <h3>AnalysisResult: </h3>
                            <p>{analysisResult}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DescriptionChecker;
