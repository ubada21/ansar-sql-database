const profileController = require('../../controllers/profileController');
const userModel = require('../../models/userModel');
const CustomError = require('../../utils/customError');

jest.mock('../../models/userModel');

describe('profileController', () => {
  describe('getProfile', () => {
    it('should respond with user if found', async () => {
      const fakeUser = [{ UID: 1, FirstName: 'Ali' }];
      userModel.getUserByUID.mockResolvedValue(fakeUser);
      const req = { user: { uid: 1 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
      const next = jest.fn();
      await profileController.getProfile(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ user: fakeUser });
      expect(next).not.toHaveBeenCalled();
    });
    it('should call next with CustomError if user not found', async () => {
      userModel.getUserByUID.mockResolvedValue([]);
      const req = { user: { uid: 2 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
      const next = jest.fn();
      await profileController.getProfile(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.json).not.toHaveBeenCalled();
    });
    it('should respond with 500 if error thrown', async () => {
      userModel.getUserByUID.mockRejectedValue(new Error('DB error'));
      const req = { user: { uid: 3 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
      const next = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await profileController.getProfile(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      logSpy.mockRestore();
    });
  });

  describe('updateProfile', () => {
    it('should respond with 200 and success message if user updated', async () => {
      userModel.updateUserById.mockResolvedValue({ affectedRows: 1 });
      const req = { user: { uid: 1 }, body: { FirstName: 'Ali' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await profileController.updateProfile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User with UID 1 updated successfully.' });
      expect(next).not.toHaveBeenCalled();
    });
    it('should respond with 404 if user not found', async () => {
      userModel.updateUserById.mockResolvedValue({ affectedRows: 0 });
      const req = { user: { uid: 2 }, body: { FirstName: 'Ali' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await profileController.updateProfile(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.json).not.toHaveBeenCalled();
    });
    it('should respond with 500 if error thrown', async () => {
      userModel.updateUserById.mockRejectedValue(new Error('DB error'));
      const req = { user: { uid: 3 }, body: { FirstName: 'Ali' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const next = jest.fn();
      await profileController.updateProfile(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      errorSpy.mockRestore();
    });
  });

  describe('deleteProfile', () => {
    it('should respond with 200 and success message if user deleted', async () => {
      userModel.deleteUserByUID.mockResolvedValue({ affectedRows: 1 });
      const req = { user: { uid: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await profileController.deleteProfile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User with UID 1 deleted successfully.' });
      expect(next).not.toHaveBeenCalled();
    });
    it('should respond with 404 if user not found', async () => {
      userModel.deleteUserByUID.mockResolvedValue({ affectedRows: 0 });
      const req = { user: { uid: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await profileController.deleteProfile(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.json).not.toHaveBeenCalled();
    });
    it('should respond with 500 if error thrown', async () => {
      userModel.deleteUserByUID.mockRejectedValue(new Error('DB error'));
      const req = { user: { uid: 3 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const next = jest.fn();
      await profileController.deleteProfile(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      errorSpy.mockRestore();
    });
  });
}); 