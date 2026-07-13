import { RequestHandler } from "express";
import { User } from "../user/user-model";
import bcrypt from "bcrypt";
import { jwtService } from "../services/jwt-service";
import { body } from "express-validator";
import { emailService } from "../services/email-service";

export const registerValidation = [
        body("name")
                .trim()
                .notEmpty().withMessage("Name is required")
                .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
        body("email")
                .trim()
                .notEmpty().withMessage("Email is required")
                .isEmail().withMessage("Invalid email format"),
        body("password")
                .notEmpty().withMessage("Password is required")
                .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
        body("address.street").notEmpty().withMessage("Street is required"),
        body("address.city").notEmpty().withMessage("City is required"),
        body("address.country").notEmpty().withMessage("Country is required"),
];
interface IAddress {
        street: string;
        city: string;
        country: string;
}
interface IRegisterBody {
        name: string;
        email: string;
        password: string;
        address: IAddress;
        profileImage?: string
}

export const registerHandler: RequestHandler<{}, {}, IRegisterBody> = async (req, res, next) => {
        try {
                const { email, password, name, address } = req.body;
                const profileImage = req.file?.path ||
                "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567/default-avatar.png";

                const user = await User.findOne({ email }).exec();
                if (user) return res.status(409).json({ message: "Email already registered" });

                const hashed = await bcrypt.hash(password, 10);
                const newUser = new User({ email, password: hashed, name, address,profileImage });
                await newUser.save();

                const token = jwtService.createToken(
                        { id: newUser._id, email: newUser.email, role: newUser.role },
                        { expiresIn: "3d" }
                );
                await emailService.sendEmailVerificationLink(newUser.email, token);

                const userObj = newUser.toObject();
                const { password: _, ...userWithoutPassword } = userObj;

                return res.status(201).json({
                        message: "Register successful. Please check your email to verify your account.",
                        user: userWithoutPassword
                });
        } catch (err) {
                next(err);
        }
};