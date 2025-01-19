"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtSecret = exports.port = exports.prisma = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
exports.prisma = new client_1.PrismaClient();
exports.port = Number(process.env.PORT) || 3000;
exports.jwtSecret = process.env.JWT_SECRET || '123secret';
