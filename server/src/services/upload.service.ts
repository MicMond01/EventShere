import cloudinary from '../config/cloudinary';
import { AppError } from '../middleware/errorHandler';

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `eventshere/${folder}`, resource_type: resourceType },
      (err, result) => {
        if (err || !result) return reject(err ?? new AppError('Upload failed', 500));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadMany(
  files: Express.Multer.File[],
  folder: string
) {
  return Promise.all(files.map(f => uploadToCloudinary(f.buffer, folder, 'image')));
}
