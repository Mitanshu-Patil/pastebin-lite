const express = require("express");
const Paste = require("../models/paste");

const router = express.Router();

/* ================= HEALTH CHECK ================= */
router.get("/healthz", async (req, res) => {
  try {
    await Paste.findOne();
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

/* ================= CREATE PASTE ================= */
router.post("/pastes", async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Invalid content" });
    }

    let expiresAt = null;

    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return res.status(400).json({ error: "Invalid ttl_seconds" });
      }
      expiresAt = new Date(Date.now() + ttl_seconds * 1000);
    }

    if (max_views !== undefined) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        return res.status(400).json({ error: "Invalid max_views" });
      }
    }

    const paste = await Paste.create({
      content,
      expiresAt,
      maxViews: max_views ?? null,
      views: 0,
    });

    res.status(201).json({
      id: paste._id.toString(),
      url: `${req.protocol}://${req.get("host")}/p/${paste._id}`,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= FETCH PASTE ================= */
router.get("/pastes/:id", async (req, res) => {
  try {
    const paste = await Paste.findById(req.params.id);
    if (!paste) {
      return res.status(404).json({ error: "Not found" });
    }

    const now =
      process.env.TEST_MODE === "1"
        ? new Date(Number(req.headers["x-test-now-ms"]))
        : new Date();

    // TTL CHECK
    if (paste.expiresAt && now > paste.expiresAt) {
      return res.status(404).json({ error: "Expired" });
    }

    // MAX VIEWS CHECK
    if (paste.maxViews !== null && paste.views >= paste.maxViews) {
      return res.status(404).json({ error: "View limit exceeded" });
    }

    // INCREMENT VIEW COUNT
    paste.views += 1;
    await paste.save();

    res.status(200).json({
      content: paste.content,
      remaining_views:
        paste.maxViews !== null ? paste.maxViews - paste.views : null,
      expires_at: paste.expiresAt,
    });
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

module.exports = router;
