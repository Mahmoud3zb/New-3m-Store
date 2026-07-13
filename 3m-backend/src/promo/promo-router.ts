import { Router } from "express";
import {
    createPromo,
    getAllPromos,
    deletePromo,
    getActivePromos,
    validatePromoCode
} from "./promo-controller";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

const router = Router();


router.get("/active", getActivePromos);
router.post("/validate", validatePromoCode);


router.post("/", isAuthenticated, isAuthorized(Role.Admin), createPromo);
router.get("/", isAuthenticated, isAuthorized(Role.Admin), getAllPromos);
router.delete("/:id", isAuthenticated, isAuthorized(Role.Admin), deletePromo);

export default router;
