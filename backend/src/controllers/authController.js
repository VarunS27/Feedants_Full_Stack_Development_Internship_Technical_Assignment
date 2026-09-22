const authService = require('../services/authService');
const { asyncHandler, sendSuccess } = require('../utils/http');

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  sendSuccess(res, result, { status: 201 });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result);
});

const me = asyncHandler(async (req, res) => {
  const { passwordHash, __v, ...user } = req.user;
  sendSuccess(res, user);
});

const setLanguage = asyncHandler(async (req, res) => {
  const user = await authService.updateLanguage(req.user._id, req.body.language);
  sendSuccess(res, user);
});

module.exports = { signup, login, me, setLanguage };
