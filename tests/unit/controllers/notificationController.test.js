const {
  getNotifications,
  markAsRead
} = require('../../../src/controllers/notificationController');
const Notification = require('../../../src/models/notificationModel');
const { STATUS_CODES } = require('../../../src/constants/constants');

// Mock dependencies
jest.mock('../../../src/models/notificationModel');

describe('Notification Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      user: {
        id: 'user123'
      },
      params: {
        id: 'notification123'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('getNotifications', () => {
    it('should get all notifications for a user', async () => {
      // Mock notifications
      const mockNotifications = [
        { _id: 'notification1', type: 'budget_warning', message: 'Warning 1', user: 'user123', isRead: false },
        { _id: 'notification2', type: 'budget_exceeded', message: 'Warning 2', user: 'user123', isRead: true }
      ];
      
      // Mock Notification.find
      Notification.find = jest.fn().mockReturnThis();
      Notification.sort = jest.fn().mockReturnThis();
      Notification.populate = jest.fn().mockResolvedValue(mockNotifications);
      
      await getNotifications(req, res);
      
      // Assertions
      expect(Notification.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(Notification.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Notification.populate).toHaveBeenCalledWith('transaction');
      expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
    });
    
    it('should handle errors when getting notifications', async () => {
      // Mock Notification.find with error
      const mockError = new Error('Database error');
      Notification.find = jest.fn().mockReturnThis();
      Notification.sort = jest.fn().mockReturnThis();
      Notification.populate = jest.fn().mockRejectedValue(mockError);
      
      await getNotifications(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });
  
  describe('markAsRead', () => {
    it('should mark a notification as read successfully', async () => {
      // Mock updated notification
      const updatedNotification = {
        _id: 'notification123',
        type: 'budget_warning',
        message: 'Warning message',
        user: 'user123',
        isRead: true
      };
      
      // Mock Notification.findOneAndUpdate
      Notification.findOneAndUpdate = jest.fn().mockResolvedValue(updatedNotification);
      
      await markAsRead(req, res);
      
      // Assertions
      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'notification123', user: 'user123' },
        { isRead: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith(updatedNotification);
    });
    
    it('should return 404 if notification is not found', async () => {
      // Mock Notification.findOneAndUpdate - notification not found
      Notification.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      
      await markAsRead(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });
    
    it('should handle errors during marking notification as read', async () => {
      // Mock Notification.findOneAndUpdate with error
      const mockError = new Error('Database error');
      Notification.findOneAndUpdate = jest.fn().mockRejectedValue(mockError);
      
      await markAsRead(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });
});