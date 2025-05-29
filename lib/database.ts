import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// User operations
export const userQueries = {
  async create(userData: {
    email: string
    name: string
    password_hash: string
    role?: string
    subscription?: string
  }) {
    const [user] = await sql`
      INSERT INTO users (email, name, password_hash, role, subscription)
      VALUES (${userData.email}, ${userData.name}, ${userData.password_hash}, 
              ${userData.role || "user"}, ${userData.subscription || "free"})
      RETURNING *
    `
    return user
  },

  async findByEmail(email: string) {
    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    return user
  },

  async findById(id: string) {
    const [user] = await sql`
      SELECT * FROM users WHERE id = ${id}
    `
    return user
  },

  async update(
    id: string,
    updates: Partial<{
      name: string
      email: string
      avatar_url: string
      role: string
      subscription: string
      email_verified: boolean
      two_factor_enabled: boolean
    }>,
  ) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")

    const values = Object.values(updates)

    const [user] = await sql`
      UPDATE users 
      SET ${sql.unsafe(setClause)}
      WHERE id = ${id}
      RETURNING *
    `.apply(null, [id, ...values] as any)

    return user
  },
}

// Website operations
export const websiteQueries = {
  async create(websiteData: {
    user_id: string
    name: string
    url: string
    description?: string
    audit_frequency?: string
    notifications?: boolean
    tags?: string[]
  }) {
    const [website] = await sql`
      INSERT INTO websites (user_id, name, url, description, audit_frequency, notifications, tags)
      VALUES (${websiteData.user_id}, ${websiteData.name}, ${websiteData.url}, 
              ${websiteData.description || ""}, ${websiteData.audit_frequency || "weekly"}, 
              ${websiteData.notifications ?? true}, ${websiteData.tags || []})
      RETURNING *
    `
    return website
  },

  async findByUserId(userId: string) {
    const websites = await sql`
      SELECT w.*, 
             COUNT(a.id) as total_audits,
             AVG(a.overall_score) as average_score,
             MAX(a.completed_at) as last_audit_at
      FROM websites w
      LEFT JOIN audits a ON w.id = a.website_id AND a.status = 'completed'
      WHERE w.user_id = ${userId}
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `
    return websites
  },

  async findById(id: string) {
    const [website] = await sql`
      SELECT * FROM websites WHERE id = ${id}
    `
    return website
  },

  async update(
    id: string,
    updates: Partial<{
      name: string
      url: string
      description: string
      status: string
      audit_frequency: string
      notifications: boolean
      tags: string[]
      last_audit_at: string
      next_audit_at: string
    }>,
  ) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")

    const values = Object.values(updates)

    const [website] = await sql`
      UPDATE websites 
      SET ${sql.unsafe(setClause)}
      WHERE id = ${id}
      RETURNING *
    `.apply(null, [id, ...values] as any)

    return website
  },

  async delete(id: string) {
    await sql`DELETE FROM websites WHERE id = ${id}`
  },
}

// Audit operations
export const auditQueries = {
  async create(auditData: {
    website_id: string
    user_id: string
    status?: string
  }) {
    const [audit] = await sql`
      INSERT INTO audits (website_id, user_id, status, started_at)
      VALUES (${auditData.website_id}, ${auditData.user_id}, 
              ${auditData.status || "queued"}, NOW())
      RETURNING *
    `
    return audit
  },

  async findByWebsiteId(websiteId: string, limit = 10) {
    const audits = await sql`
      SELECT * FROM audits 
      WHERE website_id = ${websiteId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return audits
  },

  async findByUserId(userId: string, limit = 50) {
    const audits = await sql`
      SELECT a.*, w.name as website_name, w.url as website_url
      FROM audits a
      JOIN websites w ON a.website_id = w.id
      WHERE a.user_id = ${userId}
      ORDER BY a.created_at DESC
      LIMIT ${limit}
    `
    return audits
  },

  async findById(id: string) {
    const [audit] = await sql`
      SELECT a.*, w.name as website_name, w.url as website_url
      FROM audits a
      JOIN websites w ON a.website_id = w.id
      WHERE a.id = ${id}
    `
    return audit
  },

  async updateStatus(
    id: string,
    status: string,
    data?: {
      overall_score?: number
      seo_score?: number
      performance_score?: number
      security_score?: number
      ux_score?: number
      issues_critical?: number
      issues_warning?: number
      issues_info?: number
      metrics?: object
      recommendations?: object
      error_message?: string
    },
  ) {
    const updates: any = { status }

    if (status === "running") {
      updates.started_at = new Date().toISOString()
    } else if (status === "completed") {
      updates.completed_at = new Date().toISOString()
      if (data) {
        Object.assign(updates, data)
      }
    } else if (status === "failed" && data?.error_message) {
      updates.error_message = data.error_message
      updates.completed_at = new Date().toISOString()
    }

    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")

    const values = Object.values(updates)

    const [audit] = await sql`
      UPDATE audits 
      SET ${sql.unsafe(setClause)}
      WHERE id = ${id}
      RETURNING *
    `.apply(null, [id, ...values] as any)

    return audit
  },

  async delete(id: string) {
    await sql`DELETE FROM audits WHERE id = ${id}`
  },
}

// Notification operations
export const notificationQueries = {
  async create(notificationData: {
    user_id: string
    website_id?: string
    audit_id?: string
    type: string
    title: string
    message: string
    priority?: string
    action_url?: string
  }) {
    const [notification] = await sql`
      INSERT INTO notifications (user_id, website_id, audit_id, type, title, message, priority, action_url)
      VALUES (${notificationData.user_id}, ${notificationData.website_id || null}, 
              ${notificationData.audit_id || null}, ${notificationData.type}, 
              ${notificationData.title}, ${notificationData.message}, 
              ${notificationData.priority || "medium"}, ${notificationData.action_url || null})
      RETURNING *
    `
    return notification
  },

  async findByUserId(userId: string, limit = 50) {
    const notifications = await sql`
      SELECT n.*, w.name as website_name
      FROM notifications n
      LEFT JOIN websites w ON n.website_id = w.id
      WHERE n.user_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT ${limit}
    `
    return notifications
  },

  async markAsRead(id: string) {
    const [notification] = await sql`
      UPDATE notifications 
      SET read = true 
      WHERE id = ${id}
      RETURNING *
    `
    return notification
  },

  async markAllAsRead(userId: string) {
    await sql`
      UPDATE notifications 
      SET read = true 
      WHERE user_id = ${userId} AND read = false
    `
  },

  async delete(id: string) {
    await sql`DELETE FROM notifications WHERE id = ${id}`
  },

  async getUnreadCount(userId: string) {
    const [result] = await sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ${userId} AND read = false
    `
    return Number.parseInt(result.count)
  },
}

// API Key operations
export const apiKeyQueries = {
  async create(keyData: {
    user_id: string
    name: string
    key_hash: string
    key_prefix: string
    expires_at?: string
    permissions?: object
  }) {
    const [apiKey] = await sql`
      INSERT INTO api_keys (user_id, name, key_hash, key_prefix, expires_at, permissions)
      VALUES (${keyData.user_id}, ${keyData.name}, ${keyData.key_hash}, 
              ${keyData.key_prefix}, ${keyData.expires_at || null}, 
              ${JSON.stringify(keyData.permissions || {})})
      RETURNING *
    `
    return apiKey
  },

  async findByHash(keyHash: string) {
    const [apiKey] = await sql`
      SELECT ak.*, u.id as user_id, u.email, u.subscription
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.key_hash = ${keyHash} AND ak.is_active = true
      AND (ak.expires_at IS NULL OR ak.expires_at > NOW())
    `
    return apiKey
  },

  async updateLastUsed(id: string) {
    await sql`
      UPDATE api_keys 
      SET last_used_at = NOW() 
      WHERE id = ${id}
    `
  },

  async findByUserId(userId: string) {
    const apiKeys = await sql`
      SELECT id, name, key_prefix, last_used_at, expires_at, is_active, created_at
      FROM api_keys 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return apiKeys
  },

  async deactivate(id: string) {
    const [apiKey] = await sql`
      UPDATE api_keys 
      SET is_active = false 
      WHERE id = ${id}
      RETURNING *
    `
    return apiKey
  },
}

// Audit Schedule operations
export const scheduleQueries = {
  async create(scheduleData: {
    website_id: string
    user_id: string
    frequency: string
    time_of_day?: string
    timezone?: string
  }) {
    const [schedule] = await sql`
      INSERT INTO audit_schedules (website_id, user_id, frequency, time_of_day, timezone, next_run_at)
      VALUES (${scheduleData.website_id}, ${scheduleData.user_id}, ${scheduleData.frequency}, 
              ${scheduleData.time_of_day || "09:00:00"}, ${scheduleData.timezone || "UTC"}, 
              NOW() + INTERVAL '1 day')
      RETURNING *
    `
    return schedule
  },

  async findByUserId(userId: string) {
    const schedules = await sql`
      SELECT s.*, w.name as website_name, w.url as website_url
      FROM audit_schedules s
      JOIN websites w ON s.website_id = w.id
      WHERE s.user_id = ${userId}
      ORDER BY s.next_run_at ASC
    `
    return schedules
  },

  async findDueSchedules() {
    const schedules = await sql`
      SELECT s.*, w.name as website_name, w.url as website_url, u.email as user_email
      FROM audit_schedules s
      JOIN websites w ON s.website_id = w.id
      JOIN users u ON s.user_id = u.id
      WHERE s.is_active = true 
      AND s.next_run_at <= NOW()
      ORDER BY s.next_run_at ASC
    `
    return schedules
  },

  async updateNextRun(id: string, nextRunAt: string) {
    const [schedule] = await sql`
      UPDATE audit_schedules 
      SET last_run_at = NOW(), next_run_at = ${nextRunAt}
      WHERE id = ${id}
      RETURNING *
    `
    return schedule
  },

  async toggle(id: string, isActive: boolean) {
    const [schedule] = await sql`
      UPDATE audit_schedules 
      SET is_active = ${isActive}
      WHERE id = ${id}
      RETURNING *
    `
    return schedule
  },
}

// Analytics queries
export const analyticsQueries = {
  async getUserStats(userId: string) {
    const [stats] = await sql`
      SELECT 
        COUNT(DISTINCT w.id) as total_websites,
        COUNT(DISTINCT a.id) as total_audits,
        AVG(a.overall_score) as average_score,
        COUNT(DISTINCT CASE WHEN a.created_at >= NOW() - INTERVAL '30 days' THEN a.id END) as audits_last_30_days
      FROM websites w
      LEFT JOIN audits a ON w.id = a.website_id AND a.status = 'completed'
      WHERE w.user_id = ${userId}
    `
    return stats
  },

  async getScoreTrends(userId: string, days = 30) {
    const trends = await sql`
      SELECT 
        DATE(a.completed_at) as date,
        AVG(a.overall_score) as avg_score,
        COUNT(*) as audit_count
      FROM audits a
      JOIN websites w ON a.website_id = w.id
      WHERE w.user_id = ${userId} 
      AND a.status = 'completed'
      AND a.completed_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(a.completed_at)
      ORDER BY date ASC
    `
    return trends
  },

  async getIssueBreakdown(userId: string) {
    const [breakdown] = await sql`
      SELECT 
        SUM(a.issues_critical) as total_critical,
        SUM(a.issues_warning) as total_warning,
        SUM(a.issues_info) as total_info
      FROM audits a
      JOIN websites w ON a.website_id = w.id
      WHERE w.user_id = ${userId} 
      AND a.status = 'completed'
      AND a.completed_at >= NOW() - INTERVAL '30 days'
    `
    return breakdown
  },
}

export default sql
