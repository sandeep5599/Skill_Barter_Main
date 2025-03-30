// services/uploadService.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Choose implementation based on your preferences:
// Option 1: AWS S3
// Option 2: Local file storage

// Configuration - choose your preferred option
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local'; // 'local' or 's3'

// Configure AWS S3 if using S3
if (STORAGE_TYPE === 's3') {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
}

/**
 * Upload a file to storage
 * @param {Object} file - File object from multer (contains buffer)
 * @param {String} folder - Folder name (e.g., 'assessments', 'submissions')
 * @returns {Promise<String>} - URL of the uploaded file
 */
exports.uploadFile = async (file, folder) => {
  if (STORAGE_TYPE === 's3') {
    return uploadToS3(file, folder);
  } else {
    return uploadToLocal(file, folder);
  }
};

/**
 * Upload file to AWS S3
 */
const uploadToS3 = async (file, folder) => {
  const s3 = new AWS.S3();
  const fileId = uuidv4();
  const fileExtension = path.extname(file.originalname);
  const key = `${folder}/${fileId}${fileExtension}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };
  
  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Upload file to local storage
 */
const uploadToLocal = async (file, folder) => {
  // Create directory if it doesn't exist
  const uploadDir = path.join(__dirname, '../uploads', folder);
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const fileId = uuidv4();
  const fileExtension = path.extname(file.originalname);
  const fileName = `${fileId}${fileExtension}`;
  const filePath = path.join(uploadDir, fileName);
  
  try {
    // Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);
    
    // Return URL to access the file
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    return `${baseUrl}/uploads/${folder}/${fileName}`;
  } catch (error) {
    console.error('Local file upload error:', error);
    throw new Error('Failed to save file locally');
  }
};

/**
 * Delete a file from storage
 * @param {String} fileUrl - URL of the file to delete
 * @returns {Promise<Boolean>} - Success status
 */
exports.deleteFile = async (fileUrl) => {
  if (STORAGE_TYPE === 's3') {
    return deleteFromS3(fileUrl);
  } else {
    return deleteFromLocal(fileUrl);
  }
};

/**
 * Delete file from AWS S3
 */
const deleteFromS3 = async (fileUrl) => {
  const s3 = new AWS.S3();
  
  // Extract key from URL
  const urlParts = new URL(fileUrl);
  const key = urlParts.pathname.substring(1); // Remove leading slash
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };
  
  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
};

/**
 * Delete file from local storage
 */
const deleteFromLocal = async (fileUrl) => {
  // Extract path from URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
  const relativePath = fileUrl.replace(baseUrl, '');
  const filePath = path.join(__dirname, '..', relativePath);
  
  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Local file delete error:', error);
    return false;
  }
};