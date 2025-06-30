import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the SQL client with the database URL
// Handle cases where DATABASE_URL might not be available during build
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production')
}

// Use a fallback for build/development when DATABASE_URL is not available
const sql = databaseUrl ? neon(databaseUrl) : null

// Initialize the Drizzle ORM only if we have a database connection
export const db = sql ? drizzle(sql) : null

// Helper function for raw SQL queries
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
  if (!sql) {
    console.warn('Database not available - using mock data')
    return [] as T
  }
  
  try {
    const result = await sql(query, params)
    return result as T
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// User-related queries
export async function getUsers(limit = 100, offset = 0, search = "") {
  if (!sql) {
    console.warn('Database not available - returning empty users')
    return []
  }
  
  const searchClause = search ? `WHERE email ILIKE $3 OR name ILIKE $3` : ""
  const query = `
    SELECT id, email, name, role, subscription_plan, created_at, updated_at
    FROM users
    ${searchClause}
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `

  const params = search ? [limit, offset, `%${search}%`] : [limit, offset]
  return executeQuery(query, params)
}

export async function getUserById(id: number) {
  if (!sql) {
    console.warn('Database not available - returning null user')
    return null
  }
  
  const query = `
    SELECT id, email, name, role, subscription_plan, created_at, updated_at
    FROM users
    WHERE id = $1
  `
  const result = await executeQuery(query, [id])
  return result[0]
}

export async function updateUser(id: number, data: any) {
  const { name, email, role, subscription_plan } = data
  const query = `
    UPDATE users
    SET name = $1, email = $2, role = $3, subscription_plan = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING id, email, name, role, subscription_plan, created_at, updated_at
  `
  const result = await executeQuery(query, [name, email, role, subscription_plan, id])
  return result[0]
}

export async function deleteUser(id: number) {
  const query = `DELETE FROM users WHERE id = $1`
  return executeQuery(query, [id])
}

// Document-related queries
export async function getDocuments(limit = 100, offset = 0, userId?: number) {
  if (!sql) {
    console.warn('Database not available - returning empty documents')
    return []
  }
  
  const userClause = userId ? `WHERE user_id = $3` : ""
  const query = `
    SELECT d.*, u.email as user_email, u.name as user_name
    FROM documents d
    JOIN users u ON d.user_id = u.id
    ${userClause}
    ORDER BY d.created_at DESC
    LIMIT $1 OFFSET $2
  `

  const params = userId ? [limit, offset, userId] : [limit, offset]
  return executeQuery(query, params)
}

export async function getDocumentById(id: number) {
  if (!sql) {
    console.warn('Database not available - returning null document')
    return null
  }
  
  const query = `
    SELECT d.*, u.email as user_email, u.name as user_name
    FROM documents d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = $1
  `
  const result = await executeQuery(query, [id])
  return result[0]
}

export async function updateDocument(id: number, data: any) {
  if (!sql) {
    console.warn('Database not available - cannot update document')
    throw new Error('Database not available')
  }
  
  const { title, content, document_type, blob_url } = data
  const query = `
    UPDATE documents
    SET title = $1, content = $2, document_type = $3, blob_url = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `
  const result = await executeQuery(query, [title, content, document_type, blob_url, id])
  return result[0]
}

export async function deleteDocument(id: number) {
  if (!sql) {
    console.warn('Database not available - cannot delete document')
    throw new Error('Database not available')
  }
  
  const query = `DELETE FROM documents WHERE id = $1`
  return executeQuery(query, [id])
}

// Usage logs queries
export async function getUsageLogs(limit = 100, offset = 0, userId?: number) {
  const userClause = userId ? `WHERE user_id = $3` : ""
  const query = `
    SELECT l.*, u.email as user_email, u.name as user_name
    FROM usage_logs l
    JOIN users u ON l.user_id = u.id
    ${userClause}
    ORDER BY l.created_at DESC
    LIMIT $1 OFFSET $2
  `

  const params = userId ? [limit, offset, userId] : [limit, offset]
  return executeQuery(query, params)
}

// Settings queries
export async function getSettings() {
  const query = `SELECT * FROM settings ORDER BY key`
  return executeQuery(query)
}

export async function updateSetting(key: string, value: string, description?: string) {
  const query = `
    UPDATE settings
    SET value = $1, description = COALESCE($2, description), updated_at = CURRENT_TIMESTAMP
    WHERE key = $3
    RETURNING *
  `
  const result = await executeQuery(query, [value, description, key])
  return result[0]
}

export async function createSetting(key: string, value: string, description: string) {
  const query = `
    INSERT INTO settings (key, value, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (key) DO UPDATE
    SET value = $2, description = $3, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  const result = await executeQuery(query, [key, value, description])
  return result[0]
}

// Dashboard statistics
export async function getDashboardStats() {
  const stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    totalUsage: 0,
    recentUsers: [],
    usageByFeature: [],
    documentsByType: [],
  }

  // Get total users
  const totalUsersQuery = `SELECT COUNT(*) as count FROM users`
  const totalUsersResult = await executeQuery(totalUsersQuery)
  stats.totalUsers = Number.parseInt(totalUsersResult[0].count)

  // Get active users (users who have logged in within the last 30 days)
  const activeUsersQuery = `
    SELECT COUNT(DISTINCT user_id) as count 
    FROM usage_logs 
    WHERE created_at > NOW() - INTERVAL '30 days'
  `
  const activeUsersResult = await executeQuery(activeUsersQuery)
  stats.activeUsers = Number.parseInt(activeUsersResult[0].count)

  // Get total documents
  const totalDocumentsQuery = `SELECT COUNT(*) as count FROM documents`
  const totalDocumentsResult = await executeQuery(totalDocumentsQuery)
  stats.totalDocuments = Number.parseInt(totalDocumentsResult[0].count)

  // Get total usage
  const totalUsageQuery = `SELECT SUM(tokens_used) as total FROM usage_logs`
  const totalUsageResult = await executeQuery(totalUsageQuery)
  stats.totalUsage = Number.parseInt(totalUsageResult[0].total || "0")

  // Get recent users
  const recentUsersQuery = `
    SELECT id, email, name, created_at 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT 5
  `
  stats.recentUsers = await executeQuery(recentUsersQuery)

  // Get usage by feature
  const usageByFeatureQuery = `
    SELECT feature, SUM(tokens_used) as total 
    FROM usage_logs 
    GROUP BY feature 
    ORDER BY total DESC
  `
  stats.usageByFeature = await executeQuery(usageByFeatureQuery)

  // Get documents by type
  const documentsByTypeQuery = `
    SELECT document_type, COUNT(*) as count 
    FROM documents 
    GROUP BY document_type 
    ORDER BY count DESC
  `
  stats.documentsByType = await executeQuery(documentsByTypeQuery)

  return stats
}
