const userController = require('../../controllers/userController');
const userModel = require('../../models/userModel');
const userService = require('../../services/userService');
const roleService = require('../../services/roleService');
const roleModel = require('../../models/roleModel');
const errorHandler = require('../../middlewares/errorHandler');
const CustomError = require('../../utils/customError');

jest.mock('../../models/userModel');
jest.mock('../../services/userService');
jest.mock('../../services/roleService');
jest.mock('../../models/roleModel');

describe('userController', () => {
  describe('getAllUsers', () => {
    it('should respond with users and status 200', async () => {
      const fakeUsers = [
        { UID: 1, FirstName: 'Muhammad' },
        { UID: 2, FirstName: 'Ahmad' }
      ];
      userModel.getAllUsers.mockResolvedValue(fakeUsers);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await userController.getAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: fakeUsers });
      expect(next).not.toHaveBeenCalled();
    });
  });
  describe('getUserByUID', () => {
    it('should respond with user and status 200 if found', async () => {
      const fakeUser = [{ UID: 1, FirstName: 'Muhammad' }];
      userModel.getUserByUID.mockResolvedValue(fakeUser);
      const req = { params: { uid: 1 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();

      await userController.getUserByUID(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ user: fakeUser });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with CustomError if user not found', async () => {
      userModel.getUserByUID.mockResolvedValue([]);
      const req = { params: { uid: 2 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();

      await userController.getUserByUID(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should respond with 500 if error thrown', async () => {
      userModel.getUserByUID.mockRejectedValue(new Error('DB error'));
      const req = { params: { uid: 3 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.getUserByUID(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
  describe('createUser', () => {
    it('should respond with 201 and UID on success', async () => {
      const fakeUserData = { FirstName: 'Ali', Email: 'ali@example.com' };
      const fakeResult = { insertId: 123 };
      userModel.createUser.mockResolvedValue(fakeResult);
      const req = { body: fakeUserData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully', UID: 123 });
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond with 409 if duplicate entry error', async () => {
      const fakeUserData = { FirstName: 'Ali', Email: 'ali@example.com' };
      const dupError = { code: 'ER_DUP_ENTRY' };
      userModel.createUser.mockRejectedValue(dupError);
      const req = { body: fakeUserData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should respond with 500 and log error for other errors', async () => {
      const fakeUserData = { FirstName: 'Ali', Email: 'ali@example.com' };
      const genericError = new Error('DB error');
      userModel.createUser.mockRejectedValue(genericError);
      const req = { body: fakeUserData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });
  describe('updateUser', () => {
    it('should respond with 200 and success message if user updated', async () => {
      userModel.updateUserById.mockResolvedValue({ affectedRows: 1 });
      const req = { params: { uid: 1 }, body: { FirstName: 'Ali' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User with UID 1 updated successfully.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond with 404 if user not found', async () => {
      userModel.updateUserById.mockResolvedValue({ affectedRows: 0 });
      const req = { params: { uid: 2 }, body: { FirstName: 'Ali' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should respond with 500 if error thrown', async () => {
      userModel.updateUserById.mockRejectedValue(new Error('DB error'));
      const req = { params: { uid: 3 }, body: { FirstName: 'Ali' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
  describe('deleteUserByUID', () => {
    it('should respond with 200 and success message if user deleted', async () => {
      userModel.deleteUserByUID.mockResolvedValue({ affectedRows: 1 });
      const req = { params: { uid: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.deleteUserByUID(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User with UID 1 deleted successfully.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond with 404 if user not found', async () => {
      userModel.deleteUserByUID.mockResolvedValue({ affectedRows: 0 });
      const req = { params: { uid: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.deleteUserByUID(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should respond with 500 if error thrown', async () => {
      userModel.deleteUserByUID.mockRejectedValue(new Error('DB error'));
      const req = { params: { uid: 3 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
      const next = jest.fn();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await userController.deleteUserByUID(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
  describe('assignRoleToUser', () => {
    const reqBase = { body: { UID: 1, RoleID: 2 } };
    let req, res;
    beforeEach(() => {
      req = { body: { ...reqBase.body } };
      res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    it('should respond with 201 and success message if role assigned', async () => {
      userService.checkUserExists.mockResolvedValue(true);
      roleService.checkRoleExists.mockResolvedValue(true);
      roleModel.assignRoleToUser.mockResolvedValue();

      await userController.assignRoleToUser(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Role 2 Assigned to User 1' });
    });

    it('should respond with 404 if user not found', async () => {
      userService.checkUserExists.mockResolvedValue(false);
      roleService.checkRoleExists.mockResolvedValue(true);
      const next = jest.fn()
      await userController.assignRoleToUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError))
    });

    it('should respond with 404 if role not found', async () => {
      userService.checkUserExists.mockResolvedValue(true);
      roleService.checkRoleExists.mockResolvedValue(false);
      const next = jest.fn()
      await userController.assignRoleToUser(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(CustomError))
    });

    it('should respond with 409 if duplicate entry error', async () => {
      userService.checkUserExists.mockResolvedValue(true);
      roleService.checkRoleExists.mockResolvedValue(true);
      roleModel.assignRoleToUser.mockRejectedValue({ code: 'ER_DUP_ENTRY' });
      const next = jest.fn()

      await userController.assignRoleToUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError))
    });

    it('should log error for other errors', async () => {
      userService.checkUserExists.mockResolvedValue(true);
      roleService.checkRoleExists.mockResolvedValue(true);
      const genericError = new Error('DB error');
      roleModel.assignRoleToUser.mockRejectedValue(genericError);
      const next = jest.fn();

      await userController.assignRoleToUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });
  describe('getUserRoles', () => {
    it('should respond with 200 and roles if found', async () => {
      const fakeRoles = [{ RoleID: 1, ROLENAME: 'Admin' }];
      const req = { params: { uid: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const roleModel = require('../../models/roleModel');
      roleModel.getUserRoles.mockResolvedValue(fakeRoles);

      await userController.getUserRoles(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ roles: fakeRoles });
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond with 404 if user not found (no roles)', async () => {
      const req = { params: { uid: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const roleModel = require('../../models/roleModel');
      roleModel.getUserRoles.mockResolvedValue([]);

      await userController.getUserRoles(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError))
    });

    it('should respond with 500 and next error if exception thrown', async () => {
      const req = { params: { uid: 3 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const roleModel = require('../../models/roleModel');
      const error = new Error('DB error');
      roleModel.getUserRoles.mockRejectedValue(error);

      await userController.getUserRoles(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError))
    });
  });
});

describe('errorHandler middleware', () => {
  it('should return all CustomError properties in the response', () => {
    const err = new CustomError('Test error', 418, 'TEST', { foo: 'bar' });
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    process.env.NODE_ENV = 'production';
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Test error',
      code: 'TEST',
      data: { foo: 'bar' },
    });
  });
  it('should include stack in development mode', () => {
    const err = new CustomError('Dev error', 500, 'DEV_ERROR');
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    process.env.NODE_ENV = 'development';
    errorHandler(err, req, res, next);
    expect(res.json.mock.calls[0][0].stack).toBeDefined();
  });
}); 
