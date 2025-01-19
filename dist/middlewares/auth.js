"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = exports.checkIsAccountActive = exports.checkUser = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({
            message: 'auth token not found'
        });
        return;
    }
    try {
        const decodedJwt = jsonwebtoken_1.default.verify(token, config_1.jwtSecret);
        if (!decodedJwt.userId) {
            console.log(decodedJwt);
            res.status(403).json({
                message: 'Unauthorized access'
            });
            return;
        }
        req.userId = decodedJwt.userId;
        next();
    }
    catch (err) {
        console.error(err);
        res.status(401).json({
            message: 'Unable to authorize user'
        });
    }
});
exports.authenticateUser = authenticateUser;
const checkUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const existingUser = yield config_1.prisma.user.findFirst({
            where: { email }
        });
        if (existingUser) {
            res.status(409).json({
                message: 'Email already registered'
            });
            return;
        }
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error'
        });
    }
});
exports.checkUser = checkUser;
const checkIsAccountActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const { isAccountActive } = yield config_1.prisma.user.findFirst({
            where: { id: userId },
            select: { isAccountActive: true }
        });
        if (!isAccountActive) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }
        next();
    }
    catch (err) {
        console.error(err);
        res.status(401).json({
            message: 'Unable to authorize user'
        });
    }
});
exports.checkIsAccountActive = checkIsAccountActive;
const authenticateAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({
            message: 'auth token not found'
        });
        return;
    }
    const decodedJwt = jsonwebtoken_1.default.verify(token, config_1.jwtSecret);
    if (decodedJwt.role != 'SUPERADMIN') {
        res.status(403).json({
            message: 'Unauthorized access'
        });
        return;
    }
    next();
});
exports.authenticateAdmin = authenticateAdmin;
