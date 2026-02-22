/**
 * Subscription Check Middleware
 * Checks if user has an active Pro subscription.
 * Must be used AFTER auth middleware (relies on req.user).
 *
 * Usage: router.get('/pro-feature', auth, subscription, handler)
 */

const subscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const user = req.user;

    // Auto-expire if subscription end date has passed
    if (
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) < new Date() &&
      user.subscriptionStatus === 'active'
    ) {
      user.isPro = false;
      user.subscriptionStatus = 'expired';
      await user.save();
      req.user = user;
    }

    // Check for active Pro subscription
    if (!user.isPro || user.subscriptionStatus !== 'active') {
      const messages = {
        expired: 'Your subscription has expired. Please renew your Pro plan to access this feature.',
        cancelled: 'Your subscription has been cancelled. Please resubscribe to access this feature.',
        inactive: 'You need a Pro subscription to access this feature. Subscribe for just ₹49/month!',
      };

      return res.status(403).json({
        success: false,
        message: messages[user.subscriptionStatus] || messages.inactive,
        subscriptionStatus: user.subscriptionStatus,
        isPro: user.isPro,
        ...(user.subscriptionEndDate && { subscriptionEndDate: user.subscriptionEndDate }),
      });
    }

    // Attach expiry warning if subscription is ending within 3 days
    if (user.subscriptionEndDate) {
      const daysRemaining = Math.ceil(
        (new Date(user.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining <= 3 && daysRemaining > 0) {
        req.subscriptionWarning = {
          daysRemaining,
          message: `Your subscription expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Renew to avoid interruption.`,
        };
      }
    }

    next();
  } catch (error) {
    console.error('❌ Subscription middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error checking subscription status. Please try again.',
    });
  }
};

module.exports = { subscription };