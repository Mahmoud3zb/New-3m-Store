import { Router } from "express";
import { getAllCategories } from "./category-controllers/get-all-categories";
import { getCategoryById } from "./category-controllers/get-category-by-id";
import { categoryValidator } from "./category-validator";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { deleteCategory } from "./category-controllers/deleteCategory";
import { addCategory } from "./category-controllers/add-category";
import { updateCategory } from "./category-controllers/update-category";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { Role } from "../user/user-model";

const router = Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

router.post('/add', 
    isAuthenticated, 
    isAuthorized(Role.Admin), 
    categoryValidator, 
    handleValidationErrors, 
    addCategory);

router.put('/:id', 
    isAuthenticated,
    isAuthorized(Role.Admin), 
    categoryValidator, 
    handleValidationErrors, 
    updateCategory);

router.delete('/:id', 
    isAuthenticated, 
    isAuthorized(Role.Admin), 
    deleteCategory);

export default router;