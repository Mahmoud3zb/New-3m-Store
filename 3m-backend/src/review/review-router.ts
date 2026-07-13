import { Router } from "express";
import { getProductReviews } from "./review-controllers/get-product-reviews";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { addReviewValidator, addReview } from "./review-controllers/add-review";
import { deleteReview } from "./review-controllers/delete-review";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

const router = Router();

router.post('/:productID',
    isAuthenticated,
    isAuthorized(Role.User),
    addReviewValidator,
    handleValidationErrors,
    addReview);


router.get('/:productID',
    getProductReviews);

router.delete('/:reviewID',
    isAuthenticated,
    deleteReview);

export default router;