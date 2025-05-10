import React, { useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

const CloudinaryUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const cld = new Cloudinary({ 
    cloud: { 
      cloudName: 'diq0qgpa8',
      apiKey: '655148812717991'
    } 
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'ml_default'); // You'll need to create this in your Cloudinary settings

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/diq0qgpa8/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        const img = cld
          .image(data.public_id)
          .format('auto')
          .quality('auto')
          .resize(auto().gravity(autoGravity()).width(500).height(500));
        
        setUploadedImage(img);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cloudinary-upload-container">
      <div className="upload-section">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="file-input"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="upload-button"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Uploading...
            </>
          ) : (
            <>
              <i className="fas fa-upload"></i> Upload Image
            </>
          )}
        </button>
      </div>

      {uploadedImage && (
        <div className="preview-section">
          <h3>Uploaded Image</h3>
          <AdvancedImage cldImg={uploadedImage} />
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload; 