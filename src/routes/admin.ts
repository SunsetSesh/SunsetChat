import { Router, Request, Response } from "express";
import { User, Guild } from "@spacebar/util";
import { MoreThan, LessThan } from "typeorm";
import crypto from "crypto";

const router = Router();

// Middleware to check admin role
const isAdmin = async (req: Request, res: Response, next: Function) => {
    const user = await User.findOne({ where: { id: req.headers["user-id"] } });
    if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

router.use(isAdmin);

// Global Moderation Actions
router.post("/moderation/ban", async (req: Request, res: Response) => {
    const { userId, reason } = req.body;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.banned = true;
    user.banReason = reason;
    await user.save();
    res.json({ message: `User ${userId} banned` });
});

// Premium Status Management
router.post("/premium/user", async (req: Request, res: Response) => {
    const { userId, type, durationDays } = req.body;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    await PremiumStatus.create({
        userId,
        type,
        expiresAt,
        createdAt: new Date(),
    }).save();
    res.json({ message: `Premium added for user ${userId}` });
});

// Global Guild Management
router.delete("/guilds/:guildId", async (req: Request, res: Response) => {
    const guild = await Guild.findOne({ where: { id: req.params.guildId } });
    if (!guild) return res.status(404).json({ error: "Guild not found" });
    await guild.remove();
    res.json({ message: `Guild ${req.params.guildId} deleted` });
});

// User/Platform Statistics
router.get("/statistics", async (req: Request, res: Response) => {
    const userCount = await User.count();
    const guildCount = await Guild.count();
    const activeUsers = await User.count({ where: { lastActive: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)) } });
    res.json({ userCount, guildCount, activeUsers });
});

// Premium Gift Link Generation
router.post("/gift-links", async (req: Request, res: Response) => {
    const { premiumType, durationDays } = req.body;
    const code = crypto.randomBytes(16).toString("hex");
    const giftLink = await GiftLink.create({
        code,
        premiumType,
        durationDays,
        createdBy: req.headers["user-id"],
        createdAt: new Date(),
    }).save();
    res.json({ code, link: `https://your-spacebar.com/gift/${code}` });
});

// Global Announcements
router.post("/announcements", async (req: Request, res: Response) => {
    const { content, expiresAt } = req.body;
    const announcement = await GlobalAnnouncement.create({
        content,
        createdBy: req.headers["user-id"],
        createdAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).save();
    res.json({ message: "Announcement posted", announcement });
});

// Fetch Announcements for Clients
router.get("/announcements", async (req: Request, res: Response) => {
    const announcements = await GlobalAnnouncement.find({
        where: { expiresAt: MoreThan(new Date()) },
    });
    res.json(announcements);
});

export default router;
