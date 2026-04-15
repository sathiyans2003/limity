const db = require('../config/db');

// @GET /api/analytics/overview - Dashboard overview stats
const getOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total links
    const [[totalLinks]] = await db.query(
      'SELECT COUNT(*) as count FROM links WHERE user_id = ?', [userId]
    );

    // Active vs expired
    const [[activeLinks]] = await db.query(
      'SELECT COUNT(*) as count FROM links WHERE user_id = ? AND is_expired = FALSE AND is_active = TRUE', [userId]
    );

    // Total clicks
    const [[totalClicks]] = await db.query(
      `SELECT COALESCE(SUM(l.total_clicks), 0) as count
       FROM links l WHERE l.user_id = ?`, [userId]
    );

    // Today's clicks
    const [[todayClicks]] = await db.query(
      `SELECT COUNT(*) as count FROM click_logs cl
       JOIN links l ON cl.link_id = l.id
       WHERE l.user_id = ? AND DATE(cl.clicked_at) = CURDATE()`, [userId]
    );

    // Clicks last 7 days (for chart)
    const [weeklyClicks] = await db.query(
      `SELECT DATE(cl.clicked_at) as date, COUNT(*) as clicks
       FROM click_logs cl
       JOIN links l ON cl.link_id = l.id
       WHERE l.user_id = ? AND cl.clicked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(cl.clicked_at)
       ORDER BY date ASC`, [userId]
    );

    // Device breakdown
    const [deviceStats] = await db.query(
      `SELECT cl.device_type, COUNT(*) as count
       FROM click_logs cl
       JOIN links l ON cl.link_id = l.id
       WHERE l.user_id = ?
       GROUP BY cl.device_type`, [userId]
    );

    // Top 5 performing links
    const [topLinks] = await db.query(
      `SELECT id, title, short_code, original_url, total_clicks, created_at
       FROM links WHERE user_id = ? ORDER BY total_clicks DESC LIMIT 5`, [userId]
    );

    res.json({
      success: true,
      stats: {
        totalLinks: totalLinks.count,
        activeLinks: activeLinks.count,
        expiredLinks: totalLinks.count - activeLinks.count,
        totalClicks: totalClicks.count,
        todayClicks: todayClicks.count,
      },
      weeklyClicks,
      deviceStats,
      topLinks: topLinks.map(l => ({
        ...l,
        shortUrl: `${process.env.APP_URL}/${l.short_code}`,
      })),
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/analytics/link/:id - Detailed analytics for one link
const getLinkAnalytics = async (req, res) => {
  try {
    // Verify ownership
    const [linkRows] = await db.query(
      'SELECT * FROM links WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!linkRows.length) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    const link = linkRows[0];

    // Clicks per day (last 30 days)
    const [dailyClicks] = await db.query(
      `SELECT DATE(clicked_at) as date, COUNT(*) as clicks
       FROM click_logs WHERE link_id = ?
       AND clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(clicked_at) ORDER BY date ASC`, [link.id]
    );

    // Device breakdown
    const [devices] = await db.query(
      `SELECT device_type, COUNT(*) as count FROM click_logs
       WHERE link_id = ? GROUP BY device_type`, [link.id]
    );

    // Referer sources
    const [referers] = await db.query(
      `SELECT COALESCE(referer, 'Direct') as source, COUNT(*) as count
       FROM click_logs WHERE link_id = ?
       GROUP BY referer ORDER BY count DESC LIMIT 10`, [link.id]
    );

    // Recent clicks
    const [recentClicks] = await db.query(
      `SELECT ip_address, device_type, referer, clicked_at
       FROM click_logs WHERE link_id = ?
       ORDER BY clicked_at DESC LIMIT 20`, [link.id]
    );

    res.json({
      success: true,
      link: { ...link, shortUrl: `${process.env.APP_URL}/${link.short_code}` },
      analytics: { dailyClicks, devices, referers, recentClicks },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getOverview, getLinkAnalytics };
