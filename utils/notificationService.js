// utils/notificationService.js
import { supabase } from './supabaseClient';

export const notificationService = {
  // Create a single notification
  async create(userId, notification) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error('Error creating notification:', err);
      return null;
    }
  },

  // Create bulk notifications for multiple users
  async createBulk(userIds, notification) {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating bulk notifications:', err);
      return [];
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error marking all as read:', err);
      return false;
    }
  },

  // Dismiss/delete notification
  async dismiss(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          dismissed: true, 
          dismissed_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error dismissing notification:', err);
      return false;
    }
  },

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
        .eq('dismissed', false);

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error('Error getting unread count:', err);
      return 0;
    }
  },

  // Get user notifications with pagination
  async getUserNotifications(userId, page = 1, limit = 50) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data, count, page, limit };
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return { data: [], count: 0, page, limit };
    }
  }
};

// Predefined notification templates
export const notificationTemplates = {
  welcome: (name) => ({
    type: 'alert',
    title: 'Welcome to the Platform! 🎉',
    message: `Welcome ${name || 'Fan'}! Start exploring candidates and cast your votes.`,
    data: { action: 'explore' }
  }),

  walletFunded: (amount) => ({
    type: 'promo',
    title: 'Wallet Funded Successfully! 💰',
    message: `Your wallet has been funded with ₦${amount?.toLocaleString() || '0'}`,
    data: { action: 'view_wallet' }
  }),

  voteCast: (candidateName, votes) => ({
    type: 'event',
    title: 'Vote Cast Successfully! 🗳️',
    message: `You've successfully cast ${votes} vote${votes > 1 ? 's' : ''} for ${candidateName || 'a candidate'}`,
    data: { action: 'view_results' }
  }),

  giftSent: (candidateName, amount) => ({
    type: 'event',
    title: 'Gift Sent! 🎁',
    message: `You sent a gift worth ₦${amount?.toLocaleString() || '0'} to ${candidateName || 'a candidate'}`,
    data: { action: 'view_gifts' }
  }),

  profileUpdated: () => ({
    type: 'alert',
    title: 'Profile Updated',
    message: 'Your profile has been successfully updated!',
    data: { action: 'view_profile' }
  }),

  rankChanged: (newRank, oldRank) => ({
    type: 'alert',
    title: 'Rank Update! 📈',
    message: `Your rank has changed from #${oldRank} to #${newRank}`,
    data: { action: 'view_rank' }
  }),

  votingRoundStarted: (roundNumber) => ({
    type: 'event',
    title: `Voting Round ${roundNumber} Started!`,
    message: `Voting round ${roundNumber} is now open. Cast your votes now!`,
    data: { action: 'vote_now' }
  }),

  votingRoundEnded: (roundNumber) => ({
    type: 'event',
    title: `Voting Round ${roundNumber} Ended`,
    message: `Voting round ${roundNumber} has ended. Check out the results!`,
    data: { action: 'view_results' }
  }),

  liveShowReminder: (showTime) => ({
    type: 'alert',
    title: 'Live Show Tonight! 🎤',
    message: `Don't miss the live show ${showTime ? 'at ' + showTime : 'tonight'}`,
    data: { action: 'watch_live' }
  })
};