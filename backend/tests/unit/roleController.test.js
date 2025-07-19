const roleController = require('../../controllers/roleController');
const roleModel = require('../../models/roleModel');
const roleService = require('../../services/roleService');
const CustomError = require('../../utils/customError');
const { cleanupDatabase } = require('../sql/testSQLUtils');

jest.mock('../../models/roleModel');
jest.mock('../../services/roleService');

// Global setup and teardown
beforeAll(async () => {
  // Any global setup if needed
});

afterAll(async () => {
  await cleanupDatabase();
});

describe('roleController', () => {
  describe('getAllRoles', () => {
    it('should respond with 200 and roles on success', async () => {
      const fakeRoles = [{ RoleID: 1, ROLENAME: 'Admin' }];
      roleModel.getAllRoles.mockResolvedValue(fakeRoles);
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await roleController.getAllRoles(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ roles: fakeRoles });
    });
    it('should call next with error if exception thrown', async () => {
      roleModel.getAllRoles.mockRejectedValue(new Error('DB error'));
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await roleController.getAllRoles(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });

  describe('getUsersByRole', () => {
    it('should respond with 200 and users if found', async () => {
      roleService.checkRoleExists.mockResolvedValue(true);
      const fakeUsers = { affectedRows: 1, users: [{ UID: 1, name: 'Ali' }] };
      roleModel.getUsersByRole.mockResolvedValue(fakeUsers);
      const req = { params: { roleid: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await roleController.getUsersByRole(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: fakeUsers });
    });
    it('should respond with 404 if role not found', async () => {
      roleService.checkRoleExists.mockResolvedValue(false);
      const req = { params: { roleid: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await roleController.getUsersByRole(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
    it('should respond with 404 if no users found for role', async () => {
      roleService.checkRoleExists.mockResolvedValue(true);
      roleModel.getUsersByRole.mockResolvedValue({ affectedRows: 0 });
      const req = { params: { roleid: 3 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await roleController.getUsersByRole(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
    it('should call next with error if exception thrown', async () => {
      roleService.checkRoleExists.mockResolvedValue(true);
      roleModel.getUsersByRole.mockRejectedValue(new Error('DB error'));
      const req = { params: { roleid: 4 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await roleController.getUsersByRole(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });
}); 