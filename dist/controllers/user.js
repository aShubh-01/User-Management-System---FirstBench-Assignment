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
exports.getUsers = exports.deactivateUser = exports.updateUser = exports.createAdmin = exports.createUser = exports.loginAdmin = exports.loginUser = void 0;
const config_1 = require("../config");
const userSchema_1 = require("../validators/userSchema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
function createJwt(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.jwtSecret);
}
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const userData = yield config_1.prisma.user.findFirst({
            where: { email: email, role: 'USER' }
        });
        if (!userData || !userData.isAccountActive) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }
        const matchPassword = bcrypt_1.default.compareSync(password, (userData === null || userData === void 0 ? void 0 : userData.password) || ''); // MATCH THE ENCRYPTED AND RECEIVED PASSWORD
        if (matchPassword) {
            const token = createJwt({ userId: userData.id, role: userData.role });
            delete userData.password;
            delete userData.isAccountActive;
            delete userData.id;
            delete userData.role;
            res.status(200).json({
                message: 'User Logged In',
                userData,
                token
            });
            return;
        }
        else {
            res.status(400).json({
                message: 'Incorrect Password'
            });
            return;
        }
    }
    catch (err) {
        console.error(err);
    }
    res.status(500).json({
        message: "Unable to login user"
    });
});
exports.loginUser = loginUser;
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const adminData = yield config_1.prisma.user.findFirst({
            where: { email: email, role: 'SUPERADMIN' },
        });
        if (!adminData || !adminData.isAccountActive) {
            res.status(404).json({
                message: "Admin not found"
            });
            return;
        }
        const matchPassword = bcrypt_1.default.compareSync(password, (adminData === null || adminData === void 0 ? void 0 : adminData.password) || ''); // MATCH THE ENCRYPTED AND RECEIVED PASSWORD
        if (matchPassword) {
            const token = createJwt({ userId: adminData.id, role: adminData.role });
            delete adminData.password;
            delete adminData.isAccountActive;
            delete adminData.id;
            delete adminData.role;
            res.status(200).json({
                message: 'Admin Logged In',
                adminData,
                token
            });
            return;
        }
        else {
            res.status(400).json({
                message: 'Incorrect Password for admin'
            });
            return;
        }
    }
    catch (err) {
        console.error(err);
    }
    res.status(500).json({
        message: "Unable to login admin"
    });
});
exports.loginAdmin = loginAdmin;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, phoneNumber } = req.body;
    const parseResponse = userSchema_1.userDataSchema.safeParse(req.body);
    if (!parseResponse.success) {
        res.status(400).json({
            message: 'Invalid Data Schema',
            issues: parseResponse.error.issues.map((issue) => (issue.message))
        });
        return;
    }
    try {
        const { id: userId, role } = yield config_1.prisma.user.create({
            data: {
                username: username,
                email: email,
                password: bcrypt_1.default.hashSync(password, 10), // ENCRYPT THE PASSWORD BEFORE STORING IT IN THE DB
                phoneNumber: phoneNumber
            },
            select: { id: true, role: true }
        });
        const token = createJwt({ userId, role });
        res.status(200).json({
            message: 'User created succesfully',
            token
        });
        return;
    }
    catch (err) {
        console.error(err);
    }
    res.status(500).json({
        message: "Unable to create user"
    });
});
exports.createUser = createUser;
const createAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, phoneNumber } = req.body; // GET ADMIN DETAILS FROM THE CLIENT
    const parseResponse = userSchema_1.userDataSchema.safeParse(req.body); // PARSE THE DATA
    if (!parseResponse.success) {
        res.status(400).json({
            message: 'Invalid Data Schema',
            issues: parseResponse.error.issues.map((issue) => (issue.message))
        });
        return;
    }
    try {
        const { id: userId, role } = yield config_1.prisma.user.create({
            data: {
                username: username,
                email: email,
                password: bcrypt_1.default.hashSync(password, 10), // ENCRYPT THE PASSWORD BEFORE STORING IT IN THE DB
                phoneNumber: phoneNumber,
                role: 'SUPERADMIN'
            },
            select: { id: true, role: true }
        });
        const token = jsonwebtoken_1.default.sign({ userId, role }, config_1.jwtSecret);
        res.status(200).json({
            message: 'Admin created succesfully',
            token
        });
        return;
    }
    catch (err) {
        console.error(err);
    }
    res.status(500).json({
        message: "Unable to create admin"
    });
});
exports.createAdmin = createAdmin;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parseResponse = userSchema_1.userDataSchemaOptional.safeParse(req.body); // PARSE THE USER DATA
    if (!parseResponse.success) {
        res.status(400).json({
            message: 'Invalid Data Schema',
            issues: parseResponse.error.issues.map((message) => (message))
        });
        return;
    }
    const userId = req.userId; // GET THE USER ID FROM MIDDLEWARE
    try {
        if (req.body.password)
            req.body.password = bcrypt_1.default.hashSync(req.body.password, 10); // ENCRYPT THE NEW PASSWORD
        yield config_1.prisma.user.update({
            where: { id: userId },
            data: req.body
        });
        res.status(200).json({
            message: 'User data updated!'
        });
        return;
    }
    catch (err) {
        console.error(err);
    }
    res.status(500).json({
        message: 'Unable to update user data'
    });
});
exports.updateUser = updateUser;
const deactivateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        yield config_1.prisma.user.update({
            where: { id: userId }, // NOTE - IF PRESERVING DATA IS AN PRIORITY THEN ITS BETTER TO JUST FLAG THE ACCOUNT AS DELETED,
            data: { isAccountActive: false } // RATHER THAN DELETING THE ACCOUNT FROM DB ITSELF
        });
        res.status(200).json({
            message: 'User account deactivated'
        });
        return;
    }
    catch (err) {
        console.error(err);
    }
    res.status(500).json({
        message: 'Unable to deactivate user'
    });
});
exports.deactivateUser = deactivateUser;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield config_1.prisma.user.findMany({
            where: { role: 'USER' },
            select: {
                username: true,
                email: true,
                phoneNumber: true,
                isAccountActive: true
            }
        });
        if (allUsers.length < 1) { // SEND RESPONSE BASED ON FETCHED DATA
            res.status(404).json({
                message: 'No users found'
            });
            return;
        }
        res.status(500).json({
            message: 'Users found',
            allUsers
        });
        return;
    }
    catch (err) {
        console.error(err);
    }
    res.status(500).json({
        message: 'Unable to fetch all users'
    });
});
exports.getUsers = getUsers;
