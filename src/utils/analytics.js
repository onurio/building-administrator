import { db } from './dbRequests/dbutils';
import { collection, addDoc, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';

class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackUserLogin(user) {
    try {
      // Just update user's last activity, no need for separate login event
      await this.updateUserActivity(user);
    } catch (error) {
      console.error('Error tracking user login:', error);
    }
  }

  async updateUserActivity(user) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      
      // Use user ID as document ID to avoid duplicates
      const userDocRef = doc(db, 'user_activity', user.uid);
      
      const activityData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        lastActive: Timestamp.now(),
        platform: navigator.platform || 'Unknown',
      };

      // Use setDoc to update or create the document
      await setDoc(userDocRef, activityData, { merge: true });
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }

  async trackPageView(pageName, user) {
    try {
      const eventData = {
        type: 'page_view',
        page: pageName,
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        sessionId: this.sessionId,
        timestamp: Timestamp.now(),
        referrer: document.referrer,
        url: window.location.href,
      };

      await addDoc(collection(db, 'analytics'), eventData);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  async trackUserAction(action, details, user) {
    try {
      const eventData = {
        type: 'user_action',
        action: action,
        details: details,
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        sessionId: this.sessionId,
        timestamp: Timestamp.now(),
        page: window.location.pathname,
      };

      await addDoc(collection(db, 'analytics'), eventData);
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }

  async trackSessionEnd(user) {
    // No longer tracking session end separately - last activity is enough
    try {
      if (user) {
        await this.updateUserActivity(user);
      }
    } catch (error) {
      console.error('Error tracking session end:', error);
    }
  }

  // Analytics data retrieval methods
  async getRecentUserActivity(days = 30) {
    try {
      const q = query(
        collection(db, 'user_activity'),
        orderBy('lastActive', 'desc')
      );

      const snapshot = await getDocs(q);
      const now = new Date();
      const daysAgo = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      
      // Group by userEmail to ensure unique users
      const userMap = new Map();
      
      snapshot.docs.forEach(doc => {
        const activity = {
          id: doc.id,
          ...doc.data(),
          lastActive: doc.data().lastActive?.toDate()
        };
        
        if (activity.lastActive && activity.lastActive >= daysAgo) {
          const userEmail = activity.userEmail;
          
          // Keep only the most recent activity for each user
          if (!userMap.has(userEmail) || 
              activity.lastActive > userMap.get(userEmail).lastActive) {
            userMap.set(userEmail, activity);
          }
        }
      });
      
      // Convert map back to array and sort by lastActive
      return Array.from(userMap.values())
        .sort((a, b) => (b.lastActive?.getTime() || 0) - (a.lastActive?.getTime() || 0));
        
    } catch (error) {
      console.error('Error getting recent user activity:', error);
      return [];
    }
  }

  async getAnalyticsData(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, 'analytics'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return [];
    }
  }

  async getUserStats() {
    try {
      const [recentActivity, analytics] = await Promise.all([
        this.getRecentUserActivity(30),
        this.getAnalyticsData(30)
      ]);

      // Since we're using user ID as doc ID, recentActivity already has unique users
      // Count unique platforms from user activity
      const allPlatforms = new Set();
      const pageViews = {};

      recentActivity.forEach(activity => {
        if (activity.platform) {
          allPlatforms.add(activity.platform);
        }
      });

      analytics.forEach(event => {
        if (event.type === 'page_view') {
          pageViews[event.page] = (pageViews[event.page] || 0) + 1;
        }
      });

      // Sort recent activity by last active time
      const sortedActivity = recentActivity.sort((a, b) => 
        (b.lastActive?.getTime() || 0) - (a.lastActive?.getTime() || 0)
      );

      return {
        totalActiveUsers: recentActivity.length,
        uniquePlatforms: Array.from(allPlatforms),
        pageViews,
        recentActivity: sortedActivity,
        totalEvents: analytics.length
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalActiveUsers: 0,
        uniquePlatforms: [],
        pageViews: {},
        recentActivity: [],
        totalEvents: 0
      };
    }
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;