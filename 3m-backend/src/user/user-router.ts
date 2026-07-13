import { Router } from "express";
import { getAllUsers } from "./user-controllers/get-all-users";
import { createUserValidator, updateUserNameValidation } from "./user-validator";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { addUser } from "./user-controllers/add-user";
import { getUserById } from "./user-controllers/get-user-by-id";
import { deleteUserById } from "./user-controllers/delete-user-by-id";
import { updateUserNameById } from "./user-controllers/update-user-name-by-id";
import { updateProfileImage } from "./user-controllers/update-profile-image";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { getWishlist, addToWishlist, removeFromWishlist } from "./user-controllers/wishlist-controllers";
import { upload } from "../middlewares/upload.middleware";

const router = Router();


router.get('/wishlist', isAuthenticated, getWishlist);
router.post('/wishlist', isAuthenticated, addToWishlist);
router.delete('/wishlist/:productID', isAuthenticated, removeFromWishlist);

router.put('/profile/image', isAuthenticated, upload.single('profileImage'), updateProfileImage);

router.get('/',getAllUsers);
router.get('/:id',getUserById);
router.post('/add',createUserValidator,handleValidationErrors,addUser);
router.put('/:id',updateUserNameValidation,handleValidationErrors,updateUserNameById);
router.delete('/:id',deleteUserById);

export default router;