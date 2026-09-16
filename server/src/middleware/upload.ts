import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { AppError } from './errorHandler';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, WebP, GIF and SVG images are allowed', 400, 'INVALID_FILE_TYPE'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_FILE_SIZE },
});

export const uploadProduct = upload.array('images', 6);
export const uploadSingle = upload.single('image');
export const uploadDeliveryProof = upload.single('proof');

export function getFileUrl(filename: string, folder: string): string {
  return `${config.API_URL}/uploads/${folder}/${filename}`;
}
