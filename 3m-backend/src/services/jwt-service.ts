// jwt.service.ts
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const SECRET = process.env.secretKey!;



export const jwtService = {
createToken(payload: object, opts?: jwt.SignOptions) {
return jwt.sign(payload, SECRET, { expiresIn: "2h", ...opts });
},
    verifyToken<T = any>(token: string) {
    try {
        return jwt.verify(token, SECRET) as T;
    } catch (err) {
        return null;
    }
    },
};

export default jwtService;

// const SECRET = process.env.secretKey;
// if (!SECRET) throw new Error("JWT_SECRET not set");

// export const jwtService = {
//     createToken(payload: object, opts?: jwt.SignOptions) {
//         return jwt.sign(payload, SECRET, { expiresIn: "2h", ...opts });
//     },

//     verifyToken<T = any>(token: string) {
//     try {
//         return jwt.verify(token, SECRET) as T;
//     } catch (err) {
//         return null;
//     }
//     },

//     decodeToken(token: string) {
//         return jwt.decode(token);
//     },
// };