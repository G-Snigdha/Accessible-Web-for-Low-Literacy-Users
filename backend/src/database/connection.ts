import { Database } from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import BetterSqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database interface for Kysely
export interface DatabaseSchema {
  users: {
    id: string;
    email: string;
    username: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
    last_login: Date | null;
    is_active: boolean;
    email_verified: boolean;
  };

  user_preferences: {
    id: string;
    user_id: string;
    font_size: 'small' | 'medium' | 'large' | 'extra-large';
    language: string;
    high_contrast: boolean;
    reduce_motion: boolean;
    dark_mode: boolean;
    tts_enabled: boolean;
    tts_speed: number;
    tts_voice: string | null;
    auto_simplify: boolean;
    reading_level_preference: 'elementary' | 'middle' | 'high' | 'auto';
    notification_preferences: string; // JSON string
    created_at: Date;
    updated_at: Date;
  };

  text_processing_results: {
    id: string;
    user_id: string | null;
    session_id: string;
    original_text: string;
    processed_text: string;
    action: string;
    options: string; // JSON string
    analysis: string; // JSON string
    created_at: Date;
    processing_time_ms: number;
  };

  reading_sessions: {
    id: string;
    user_id: string | null;
    session_token: string;
    start_time: Date;
    end_time: Date | null;
    total_duration_seconds: number;
    texts_processed: number;
    words_read: number;
    actions_performed: string; // JSON string
    user_agent: string;
    ip_address: string;
    created_at: Date;
    updated_at: Date;
  };

  user_analytics: {
    id: string;
    user_id: string;
    date: Date;
    sessions_count: number;
    total_reading_time: number;
    words_processed: number;
    texts_simplified: number;
    texts_translated: number;
    texts_rewritten: number;
    texts_proofread: number;
    avg_complexity_score: number;
    preferred_actions: string; // JSON string
    improvement_metrics: string; // JSON string
    created_at: Date;
  };
}

let db: Database;
let kysely: Kysely<DatabaseSchema>;

/**
 * Initialize database connection and create tables
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Create database connection
    const dbPath = process.env.DATABASE_PATH || join(dataDir, 'database.sqlite');
    console.log(`📊 Connecting to database: ${dbPath}`);

    db = new BetterSqlite3(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
      fileMustExist: false
    });

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = 1000');

    // Create Kysely instance
    kysely = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({
        database: db,
      }),
    });

    // Create tables
    await createTables();

    console.log('✅ Database initialized successfully');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create database tables
 */
async function createTables(): Promise<void> {
  // Users table
  await kysely.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('username', 'text', (col) => col.notNull().unique())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('created_at', 'datetime', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .addColumn('updated_at', 'datetime', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .addColumn('last_login', 'datetime')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('email_verified', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  // User preferences table
  await kysely.schema
    .createTable('user_preferences')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => 
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('font_size', 'text', (col) => col.notNull().defaultTo('medium'))
    .addColumn('language', 'text', (col) => col.notNull().defaultTo('en'))
    .addColumn('high_contrast', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('reduce_motion', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('dark_mode', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('tts_enabled', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('tts_speed', 'real', (col) => col.notNull().defaultTo(1.0))
    .addColumn('tts_voice', 'text')
    .addColumn('auto_simplify', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('reading_level_preference', 'text', (col) => col.notNull().defaultTo('auto'))
    .addColumn('notification_preferences', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'datetime', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .addColumn('updated_at', 'datetime', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .execute();

  // Text processing results table
  await kysely.schema
    .createTable('text_processing_results')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => 
      col.references('users.id').onDelete('cascade')
    )
    .addColumn('session_id', 'text', (col) => col.notNull())
    .addColumn('original_text', 'text', (col) => col.notNull())
    .addColumn('processed_text', 'text', (col) => col.notNull())
    .addColumn('action', 'text', (col) => col.notNull())
    .addColumn('options', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('analysis', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'datetime', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .addColumn('processing_time_ms', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  // Reading sessions table
  await kysely.schema
    .createTable('reading_sessions')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => 
      col.references('users.id').onDelete('cascade')
    )
    .addColumn('session_token', 'text', (col) => col.notNull().unique())
    .addColumn('start_time', 'datetime', (col) => col.notNull())
    .addColumn('end_time', 'datetime')
    .addColumn('total_duration_seconds', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('texts_processed', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('words_read', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('actions_performed', 'text', (col) => col.notNull().defaultTo('[]'))
    .addColumn('user_agent', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('ip_address', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('created_at', 'datetime', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .addColumn('updated_at', 'datetime', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .execute();

  // User analytics table
  await kysely.schema
    .createTable('user_analytics')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => 
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('sessions_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('total_reading_time', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('words_processed', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('texts_simplified', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('texts_translated', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('texts_rewritten', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('texts_proofread', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('avg_complexity_score', 'real', (col) => col.notNull().defaultTo(0))
    .addColumn('preferred_actions', 'text', (col) => col.notNull().defaultTo('[]'))
    .addColumn('improvement_metrics', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'datetime', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .execute();

  // Create indexes for better performance
  await Promise.all([
    kysely.schema
      .createIndex('idx_users_email')
      .ifNotExists()
      .on('users')
      .column('email')
      .execute(),

    kysely.schema
      .createIndex('idx_text_processing_user_id')
      .ifNotExists()
      .on('text_processing_results')
      .column('user_id')
      .execute(),

    kysely.schema
      .createIndex('idx_text_processing_session_id')
      .ifNotExists()
      .on('text_processing_results')
      .column('session_id')
      .execute(),

    kysely.schema
      .createIndex('idx_sessions_user_id')
      .ifNotExists()
      .on('reading_sessions')
      .column('user_id')
      .execute(),

    kysely.schema
      .createIndex('idx_analytics_user_date')
      .ifNotExists()
      .on('user_analytics')
      .columns(['user_id', 'date'])
      .execute(),
  ]);

  console.log('✅ Database tables created successfully');
}

/**
 * Get Kysely database instance
 */
export function getDatabase(): Kysely<DatabaseSchema> {
  if (!kysely) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return kysely;
}

/**
 * Get raw SQLite database instance
 */
export function getRawDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (kysely) {
    kysely.destroy();
  }
  if (db) {
    db.close();
  }
  console.log('📊 Database connection closed');
}

/**
 * Generate UUID v4
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}