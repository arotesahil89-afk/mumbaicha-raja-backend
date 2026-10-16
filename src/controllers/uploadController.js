import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

// Ensure base upload directory exists
if (!fs.existsSync(UPLOADS_ROOT)) {
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}

const ALLOWED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadController = {
  uploadImage: async (req, res, next) => {
    try {
      const { image, filename: originalName, folder = 'flash_banners' } = req.body;

      if (!image) {
        return res.status(400).json({ success: false, message: 'Image data is required' });
      }

      // Sanitize folder (only alphanumeric and underscores/hyphens)
      const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'flash_banners';
      const targetDir = path.join(UPLOADS_ROOT, safeFolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      let mimeType = '';
      let base64Data = image;

      // Extract mime type if it is a data URI
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/s);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ success: false, message: 'Invalid data URI format' });
        }
        mimeType = matches[1].toLowerCase();
        base64Data = matches[2];
      }

      // Convert to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Check size
      if (buffer.length > MAX_SIZE_BYTES) {
        return res.status(400).json({
          success: false,
          message: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB limit`,
        });
      }

      // Inspect buffer magic bytes for security validation
      const hexHeader = buffer.subarray(0, 12).toString('hex').toLowerCase();
      let extension = '';

      if (hexHeader.startsWith('ffd8ff')) {
        mimeType = 'image/jpeg';
        extension = 'jpg';
      } else if (hexHeader.startsWith('89504e47')) {
        mimeType = 'image/png';
        extension = 'png';
      } else if (hexHeader.startsWith('47494638')) {
        mimeType = 'image/gif';
        extension = 'gif';
      } else if (hexHeader.startsWith('52494646') && buffer.subarray(8, 12).toString('utf8') === 'WEBP') {
        mimeType = 'image/webp';
        extension = 'webp';
      } else if (buffer.subarray(0, 100).toString('utf8').includes('<svg')) {
        mimeType = 'image/svg+xml';
        extension = 'svg';
      } else if (mimeType && ALLOWED_MIME_TYPES[mimeType]) {
        extension = ALLOWED_MIME_TYPES[mimeType];
      } else {
        return res.status(400).json({ success: false, message: 'Unsupported or invalid image format' });
      }

      // Generate cryptographically unique safe filename
      const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
      const savedFileName = `${safeFolder}_${uniqueSuffix}.${extension}`;
      const filePath = path.join(targetDir, savedFileName);

      // Write file safely to disk
      await fs.promises.writeFile(filePath, buffer);

      // Determine public URL
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const relativePath = `/uploads/${safeFolder}/${savedFileName}`;
      
      let fullUrl = `${protocol}://${host}${relativePath}`;
      if (host.includes('mumbaicharaja.co')) {
        fullUrl = `https://mumbaicharaja.co${relativePath}`;
      }

      return res.status(201).json({
        success: true,
        url: fullUrl,
        path: relativePath,
        filename: savedFileName,
        size: buffer.length,
        mimeType,
      });
    } catch (err) {
      console.error('Upload error:', err);
      next(err);
    }
  },
};

export default uploadController;
