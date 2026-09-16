import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { uploadFileBuffer } from '../../services/storage.service';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

/**
 * POST /api/v1/upload
 * Single file upload to Neon S3
 */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const file = req.file;
    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    const folder = (req.body.folder as string) || 'uploads';
    const { url, key } = await uploadFileBuffer(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );

    res.json({
      success: true,
      data: {
        url,
        key,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }
);

/**
 * POST /api/v1/upload/multiple
 * Multiple file upload to Neon S3
 */
router.post(
  '/multiple',
  authenticate,
  upload.array('files', 10),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const folder = (req.body.folder as string) || 'uploads';
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const { url, key } = await uploadFileBuffer(
          file.buffer,
          file.originalname,
          file.mimetype,
          folder
        );
        return {
          url,
          key,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        };
      })
    );

    res.json({
      success: true,
      data: uploaded,
    });
  }
);

export default router;
