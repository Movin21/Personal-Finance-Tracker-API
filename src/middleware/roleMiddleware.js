const authorizedRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Invalid User Role, Forbidden" });
    }
    next();
  };
};

module.exports = authorizedRoles;
