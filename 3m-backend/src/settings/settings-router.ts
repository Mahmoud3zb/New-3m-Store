import { Router } from "express";
import { getSettings, updateSettings } from "./settings-controller";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

const router = Router();

// GET settings is public
router.get("/", getSettings);

// PUT settings requires authentication and Admin role
router.put(
    "/",
    isAuthenticated,
    isAuthorized(Role.Admin),
    updateSettings
);

export default router;
