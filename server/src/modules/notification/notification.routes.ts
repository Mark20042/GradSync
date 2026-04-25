import { Router } from 'express';
import type { Response } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import Notification from '../../shared/utils/notification.helper.js';

const router = Router();

// GET /api/notifications
router.get('/', protect as any, async (req: any, res: Response) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(notifications);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch notifications' }); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect as any, async (req: any, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) { res.status(404).json({ message: 'Notification not found' }); return; }
    if (String(notification.recipient) !== String(req.user._id)) { res.status(401).json({ message: 'Not authorized' }); return; }
    notification.isRead = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) { res.status(500).json({ message: 'Failed to update notification' }); }
});

export default router;
