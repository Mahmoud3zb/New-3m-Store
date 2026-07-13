import { Router } from "express";
import { getAllOrders } from "./order-controller/get-all-orders";
import { getOrderById } from "./order-controller/get-order-by-id";
import { getUserOrders } from "./order-controller/get-user-orders";
import { updateOrderStatus } from "./order-controller/update-order-status";
import { createOrder, validator } from "./order-controller/create-order";
import { directOrder, directValidator } from "./order-controller/direct-order";
import { getAnalytics } from "./order-controller/get-analytics";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model"; 

const router = Router();

router.post(
    '/',
    isAuthenticated,
    validator,
    handleValidationErrors,
    createOrder
);

router.post(
    '/direct',
    isAuthenticated,
    directValidator,
    handleValidationErrors,
    directOrder
);

router.get(
    '/',
    isAuthenticated,
    isAuthorized(Role.Admin),
    getAllOrders
);

router.get(
    '/admin/analytics',
    isAuthenticated,
    isAuthorized(Role.Admin),
    getAnalytics
);

router.get(
    '/user',
    isAuthenticated,
    getUserOrders
);

router.get(
    '/:id',
    isAuthenticated,
    getOrderById
);

router.put(
    '/:id',
    isAuthenticated,
    isAuthorized(Role.Admin),
    updateOrderStatus
);

export default router;