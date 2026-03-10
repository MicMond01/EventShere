import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import * as uploadController from '../controllers/upload.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/octet-stream'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new AppError('File type not allowed', 400));
  },
});

const router = Router();

router.post('/image',  authenticate, upload.single('file'),     uploadController.uploadImage);
router.post('/images', authenticate, upload.array('files', 10), uploadController.uploadImages);
router.post('/video',  authenticate, upload.single('file'),     uploadController.uploadVideo);
router.post('/model',  authenticate, upload.single('file'),     uploadController.uploadModel);

export default router;
