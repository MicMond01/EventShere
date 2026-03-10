import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { submitRatingSchema } from '../schemas/rating.schemas';
import * as ratingController from '../controllers/rating.controller';

const router = Router();

router.post('/',            authenticate, validate(submitRatingSchema), ratingController.submitRating as any);
router.get ('/my-score',    authenticate, ratingController.getMyScore as any);
router.post('/:id/flag',    authenticate, ratingController.flagRating);

export default router;
