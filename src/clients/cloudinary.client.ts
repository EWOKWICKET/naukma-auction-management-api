import { v2 as cloudinary } from 'cloudinary';

export function uploadImage(buffer: Buffer, folder: string, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, public_id: publicId, overwrite: true, resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
          resolve(result.secure_url);
        },
      )
      .end(buffer);
  });
}

export async function deleteImage(folder: string, publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(`${folder}/${publicId}`);
}
