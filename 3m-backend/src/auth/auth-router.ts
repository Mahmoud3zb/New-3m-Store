import { Router } from "express";
import { registerHandler, registerValidation } from "./register";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { loginHandler, loginValidation } from "./login";
import { googleLogin } from "./google-login";
import { logoutHandler } from "./logout";
import { upload } from "../middlewares/upload.middleware";
import { parseAddressBox } from "../middlewares/parse-address-box";
import { resetPassword } from "./reset-password";
import { forgotPassword } from "./forget-password";


const router = Router();


router.post('/register',
    upload.single('profileImage'),
    parseAddressBox,
    registerValidation,
    handleValidationErrors,
    registerHandler);

router.post('/login',
    loginValidation,
    handleValidationErrors,
    loginHandler);

router.post("/google",googleLogin);
router.post("/logout",logoutHandler);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword)
export default router;