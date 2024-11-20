// src/components/FileUploadTool.js
import React from 'react';
import NavBar from '../NavBar';
import '../../styles/global.css';

const FileUploadTool = () => {
    return (
        <div className="gradient-background">
            <NavBar />
            <div className="container form-container">
                <h2>Upload Files</h2>
                <div className="mb-3">
                    <label htmlFor="fileUpload" className="form-label">Select a file</label>
                    <input type="file" className="form-control" id="fileUpload" />
                </div>
                <button className="btn btn-primary">Upload</button>
            </div>
        </div>
    );
};

export default FileUploadTool;
