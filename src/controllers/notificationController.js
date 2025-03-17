const Notification = require("../models/notificationModel");
const { STATUS_CODES } = require("../constants/constants");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('transaction');
    res.status(STATUS_CODES.OK).json(notifications);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Notification not found" });
    }
    res.status(STATUS_CODES.OK).json(notification);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};