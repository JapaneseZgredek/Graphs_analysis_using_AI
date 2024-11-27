import React, { useEffect, useState } from "react";
import NavBar from "../NavBar";
import "../../styles/global.css";

const DescriptionChecker = () => {
  const [inputType, setInputType] = useState("file"); // Track selected input type
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [twitterUrl, setTwitterUrl] = useState("");
  const [error, setError] = useState("");
  const [textInput, setTextInput] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  const fullDescription =
    "Welcome to Validate Description tool! " +
    "Here, you can upload an infographic file with a description " +
    "or fetch data from a Twitter post, and then check " +
    "if the description matches the infographic using AI-powered analysis.";

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
    setTextInput("");
    setAnalysisResult(null);
  };

  const handleTwitterUrl = async () => {
      if (!twitterUrl.trim()) {
          setError("Please enter a valid Twitter post URL.");
          return;
      }

      // Extract Tweet ID from the URL
      const tweetIdMatch = twitterUrl.match(/status\/(\d+)/);
      if (!tweetIdMatch) {
          setError("Invalid Twitter URL. Please enter a valid URL.");
          return;
      }
      const tweetId = tweetIdMatch[1]; // Extract tweet ID from the URL

      setIsFetching(true);
      setError("");

      try {
          const response = await fetch(`http://127.0.0.1:8000/api/twitter_data`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ url: twitterUrl.trim(), tweet_id: tweetId }), // Send both the URL and Tweet ID
          });

          if (!response.ok) {
              throw new Error("Failed to fetch Twitter data. Please check the URL.");
          }

          const data = await response.json();
          const mediaImage = data.image_url;
          const tweetText = data.tweet_text;

          if (!mediaImage || !tweetText) {
              throw new Error("Failed to extract image or text from Twitter post.");
          }

          setPreviewUrl(mediaImage); // Set the image URL for the preview
          setTextInput(tweetText); // Set the tweet text as the description
          setError("");
      } catch (err) {
          console.error("Error fetching Twitter data:", err.message);
          setError(err.message || "An error occurred while fetching Twitter data.");
      } finally {
          setIsFetching(false);
      }
  };

  const handleUpload = async () => {
    if (!previewUrl || !textInput.trim()) {
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

      const payload = {
        user_id: userId,
        file_name: inputType === "file" ? selectedFile.name : "twitter_image",
        uploaded_text: textInput.trim(),
        file: await fetchImageAsBase64(previewUrl),
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
        throw new Error("Failed to analyze image with description");
      }

      const result = await response.json();
      setAnalysisResult(result.analysis_result);
    } catch (err) {
      console.error("Error during image analysis:", err.message);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchImageAsBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="gradient-background">
      <NavBar />
      {!previewUrl && (
        <div className="info-box text-center">
          <p>{displayedText}</p>
        </div>
      )}
      <div className="centered-content">
        <div
          className={`upload-container ${previewUrl ? "expanded" : "initial"}`}
        >
          <h2 className="text-center">Validate Description</h2>
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
                    setTwitterUrl("");
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    setTextInput("");
                    setAnalysisResult(null);
                  }}
                />
                Upload File
              </label>
              <label>
                <input
                  type="radio"
                  name="inputType"
                  value="twitter"
                  checked={inputType === "twitter"}
                  onChange={() => {
                    setInputType("twitter");
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setTextInput("");
                    setAnalysisResult(null);
                  }}
                />
                Twitter Post
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
              <div>
                <input
                  type="text"
                  className={`form-control ${error ? "is-invalid" : ""}`}
                  placeholder="Enter Twitter post URL"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                />
                <button
                  className="btn btn-primary w-100 mt-3 animate-button"
                  onClick={handleTwitterUrl}
                  disabled={isFetching || !twitterUrl.trim()}
                >
                  {isFetching ? "Fetching..." : "Fetch Twitter Data"}
                </button>
              </div>
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
              <textarea
                className="text-input mt-3"
                placeholder="Enter your description here..."
                value={textInput}
                readOnly={inputType === "twitter"}
                onChange={(e) => setTextInput(e.target.value)}
              />
            </div>
          )}
          {previewUrl && textInput.trim() && (
            <button
              className="btn btn-primary w-100 mt-3 animate-button"
              onClick={handleUpload}
              disabled={isUploading || isAnalyzing}
            >
              {isUploading ? "Uploading..." : isAnalyzing ? "Analyzing..." : "Upload & Analyze"}
            </button>
          )}
          {analysisResult && (
            <div className="mt-4">
              <h3>Analysis Result: </h3>
              <p>{analysisResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DescriptionChecker;
