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
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "./user-model";

const router = Router();


router.get('/wishlist', isAuthenticated, getWishlist);
router.post('/wishlist', isAuthenticated, addToWishlist);
router.delete('/wishlist/:productID', isAuthenticated, removeFromWishlist);

router.put('/profile/image', isAuthenticated, upload.single('profileImage'), updateProfileImage);

router.get('/', isAuthenticated, isAuthorized(Role.Admin), getAllUsers);
router.get('/:id', isAuthenticated, isAuthorized(Role.Admin), getUserById);
router.post('/add', isAuthenticated, isAuthorized(Role.Admin), createUserValidator, handleValidationErrors, addUser);
router.put('/:id', isAuthenticated, updateUserNameValidation, handleValidationErrors, updateUserNameById);
router.delete('/:id', isAuthenticated, isAuthorized(Role.Admin), deleteUserById);

export default router;