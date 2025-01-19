"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDataSchemaOptional = exports.userDataSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.userDataSchema = zod_1.default.object({
    username: zod_1.default.string({ message: 'Username must be a string' }).min(1, { message: 'Username cannot be empty' }),
    email: zod_1.default.string({ message: 'Email must be a string' }).min(1, { message: 'Email cannot be empty' })
        .includes('@', { message: "missing '@'" }).includes('.com', { message: "missing '.com'" }),
    password: zod_1.default.string({ message: 'Password must be a string' }).min(8, { message: 'Password must be atleast 8 characters long' }),
    phoneNumber: zod_1.default.string({ message: 'Phone number must be a string' }).min(10, { message: 'Phone number must be 10 digit' })
});
exports.userDataSchemaOptional = exports.userDataSchema.optional();
