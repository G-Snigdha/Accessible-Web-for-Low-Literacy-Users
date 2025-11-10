import type { User, UserPreferences } from '../types/index.js';
import { getDatabase, generateId } from '../database/connection.js';

/**
 * User Service
 * Handles user management operations
 */
class UserService {
  
  /**
   * Create a new user
   */
  async createUser(userData: {
    email: string;
    username: string;
    password_hash: string;
    preferences?: Partial<UserPreferences>;
  }): Promise<User> {
    const db = getDatabase();
    const userId = generateId();
    const preferencesId = generateId();
    const now = new Date();

    try {
      // Create user
      await db
        .insertInto('users')
        .values({
          id: userId,
          email: userData.email,
          username: userData.username,
          password_hash: userData.password_hash,
          created_at: now,
          updated_at: now,
          last_login: null,
          is_active: true,
          email_verified: false,
        })
        .execute();

      // Create default preferences
      const defaultPreferences = {
        id: preferencesId,
        user_id: userId,
        font_size: 'medium' as const,
        language: 'en',
        high_contrast: false,
        reduce_motion: false,
        dark_mode: false,
        tts_enabled: true,
        tts_speed: 1.0,
        tts_voice: null,
        auto_simplify: false,
        reading_level_preference: 'auto' as const,
        notification_preferences: JSON.stringify({
          email_notifications: true,
          reading_reminders: false,
          progress_updates: true,
          new_features: false
        }),
        created_at: now,
        updated_at: now,
        ...userData.preferences
      };

      await db
        .insertInto('user_preferences')
        .values(defaultPreferences)
        .execute();

      // Return user with preferences
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }

      return user;

    } catch (error) {
      console.error('Create user error:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const db = getDatabase();
      
      const userResult = await db
        .selectFrom('users')
        .leftJoin('user_preferences', 'users.id', 'user_preferences.user_id')
        .selectAll()
        .where('users.id', '=', id)
        .executeTakeFirst();

      if (!userResult) {
        return null;
      }

      return this.mapDbUserToUser(userResult);

    } catch (error) {
      console.error('Find user by ID error:', error);
      return null;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const db = getDatabase();
      
      const userResult = await db
        .selectFrom('users')
        .leftJoin('user_preferences', 'users.id', 'user_preferences.user_id')
        .selectAll()
        .where('users.email', '=', email)
        .executeTakeFirst();

      if (!userResult) {
        return null;
      }

      return this.mapDbUserToUser(userResult);

    } catch (error) {
      console.error('Find user by email error:', error);
      return null;
    }
  }

  /**
   * Find user by email or username
   */
  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    try {
      const db = getDatabase();
      
      const userResult = await db
        .selectFrom('users')
        .leftJoin('user_preferences', 'users.id', 'user_preferences.user_id')
        .selectAll()
        .where((eb) => eb.or([
          eb('users.email', '=', email),
          eb('users.username', '=', username)
        ]))
        .executeTakeFirst();

      if (!userResult) {
        return null;
      }

      return this.mapDbUserToUser(userResult);

    } catch (error) {
      console.error('Find user by email or username error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const db = getDatabase();
      
      await db
        .updateTable('users')
        .set({
          ...updates,
          updated_at: new Date()
        })
        .where('id', '=', userId)
        .execute();

      const user = await this.findById(userId);
      if (!user) {
        throw new Error('User not found after update');
      }

      return user;

    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const db = getDatabase();
      
      await db
        .updateTable('users')
        .set({
          last_login: new Date(),
          updated_at: new Date()
        })
        .where('id', '=', userId)
        .execute();

    } catch (error) {
      console.error('Update last login error:', error);
      throw new Error('Failed to update last login');
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const db = getDatabase();
      
      const preferences = await db
        .selectFrom('user_preferences')
        .selectAll()
        .where('user_id', '=', userId)
        .executeTakeFirst();

      if (!preferences) {
        return null;
      }

      return this.mapDbPreferencesToUserPreferences(preferences);

    } catch (error) {
      console.error('Get preferences error:', error);
      return null;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const db = getDatabase();
      
      // Prepare updates for database
      const dbUpdates: any = {
        ...updates,
        updated_at: new Date()
      };

      // Handle JSON fields
      if (updates.notification_preferences) {
        dbUpdates.notification_preferences = JSON.stringify(updates.notification_preferences);
      }

      await db
        .updateTable('user_preferences')
        .set(dbUpdates)
        .where('user_id', '=', userId)
        .execute();

      const preferences = await this.getPreferences(userId);
      if (!preferences) {
        throw new Error('Preferences not found after update');
      }

      return preferences;

    } catch (error) {
      console.error('Update preferences error:', error);
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const db = getDatabase();
      
      // Delete user (preferences will be deleted by cascade)
      await db
        .deleteFrom('users')
        .where('id', '=', userId)
        .execute();

    } catch (error) {
      console.error('Delete user error:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Map database user result to User type
   */
  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      password_hash: dbUser.password_hash,
      created_at: new Date(dbUser.created_at),
      updated_at: new Date(dbUser.updated_at),
      last_login: dbUser.last_login ? new Date(dbUser.last_login) : null,
      is_active: Boolean(dbUser.is_active),
      email_verified: Boolean(dbUser.email_verified),
      preferences: this.mapDbPreferencesToUserPreferences({
        id: dbUser.id || generateId(),
        user_id: dbUser.user_id || dbUser.id,
        font_size: dbUser.font_size || 'medium',
        language: dbUser.language || 'en',
        high_contrast: Boolean(dbUser.high_contrast),
        reduce_motion: Boolean(dbUser.reduce_motion),
        dark_mode: Boolean(dbUser.dark_mode),
        tts_enabled: Boolean(dbUser.tts_enabled),
        tts_speed: dbUser.tts_speed || 1.0,
        tts_voice: dbUser.tts_voice,
        auto_simplify: Boolean(dbUser.auto_simplify),
        reading_level_preference: dbUser.reading_level_preference || 'auto',
        notification_preferences: dbUser.notification_preferences || '{}',
        created_at: dbUser.created_at || new Date().toISOString(),
        updated_at: dbUser.updated_at || new Date().toISOString()
      })
    };
  }

  /**
   * Map database preferences to UserPreferences type
   */
  private mapDbPreferencesToUserPreferences(dbPrefs: any): UserPreferences {
    let notificationPreferences;
    try {
      notificationPreferences = typeof dbPrefs.notification_preferences === 'string'
        ? JSON.parse(dbPrefs.notification_preferences)
        : dbPrefs.notification_preferences || {};
    } catch {
      notificationPreferences = {
        email_notifications: true,
        reading_reminders: false,
        progress_updates: true,
        new_features: false
      };
    }

    return {
      id: dbPrefs.id,
      user_id: dbPrefs.user_id,
      font_size: dbPrefs.font_size || 'medium',
      language: dbPrefs.language || 'en',
      high_contrast: Boolean(dbPrefs.high_contrast),
      reduce_motion: Boolean(dbPrefs.reduce_motion),
      dark_mode: Boolean(dbPrefs.dark_mode),
      tts_enabled: dbPrefs.tts_enabled !== false,
      tts_speed: dbPrefs.tts_speed || 1.0,
      tts_voice: dbPrefs.tts_voice,
      auto_simplify: Boolean(dbPrefs.auto_simplify),
      reading_level_preference: dbPrefs.reading_level_preference || 'auto',
      notification_preferences: notificationPreferences,
      created_at: new Date(dbPrefs.created_at),
      updated_at: new Date(dbPrefs.updated_at)
    };
  }
}

export const userService = new UserService();