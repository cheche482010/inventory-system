const { ActivityLog } = require("../models")

const logActivity = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send

    res.send = function (data) {
      // Log successful operations
      if (res.statusCode < 400 && req.user) {
        ActivityLog.create({
          userId: req.user.id,
          action,
          resource,
          resourceId: req.params.id || null,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
          },
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        }).catch(console.error)
      }

      originalSend.call(this, data)
    }

    next()
  }
}

module.exports = { logActivity }
