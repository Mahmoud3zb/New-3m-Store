import { Router } from "express";
import { addProduct } from "./product-controllers/add-product";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { productValidator } from "./product-validato";
import { updateProduct } from "./product-controllers/update-product";
import { getProductById } from "./product-controllers/get-product-by-id";
import { getAllProducts } from "./product-controllers/get-all-product";
import { deleteProduct } from "./product-controllers/delete-product";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

/**
 * @swagger
 * /api/product:
 * get:
 * summary: Get all products
 * description: Retrieve a list of products with optional filtering, search, and pagination.
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: page
 * schema:
 * type: integer
 * default: 1
 * description: Page number for pagination
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * default: 10
 * description: Number of items per page
 * - in: query
 * name: keyword
 * schema:
 * type: string
 * description: Search keyword for product name
 * - in: query
 * name: categoryID
 * schema:
 * type: string
 * description: Filter by specific category ID
 * responses:
 * 200:
 * description: Products fetched successfully
 * 500:
 * description: Internal server error
 */
router.get('/',
    getAllProducts
);

router.get('/:id',
    getProductById
);

router.post('/add',
    isAuthenticated,
    isAuthorized(Role.Admin),
    upload.fields([
        { name: 'imageCover', maxCount: 1 },
        { name: 'images', maxCount: 10 },
    ]),
    productValidator,
    handleValidationErrors,
    addProduct
);

router.put('/:id',
    isAuthenticated,
    isAuthorized(Role.Admin),
    upload.single("image"),
    productValidator,
    handleValidationErrors,
    updateProduct
);

router.delete('/:id',
    isAuthenticated,
    isAuthorized(Role.Admin),
    deleteProduct
);

export default router;