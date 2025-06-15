import axios from "axios";

/**
 * Service for fetching news from the backend API
 * Uses the proper OHack pattern with axios and environment context
 */
export class NewsService {
  constructor(apiServerUrl) {
    this.apiServerUrl = apiServerUrl;
  }

  /**
   * Fetches news from the backend API
   * @param {number} limit - Number of news items to fetch (default: 10)
   * @returns {Promise<Array>} - Array of news items
   */
  async fetchNews(limit = 10) {
    try {
      const config = {
        url: `${this.apiServerUrl}/api/messages/news`,
        method: "GET",
        params: {
          limit: limit
        },
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      };

      const response = await axios(config);
      const data = response.data;
      
      // Handle the actual API response structure: { metadata: {...}, text: [...] }
      const newsItems = data.text || [];
      console.log(`📰 Raw API response contains ${newsItems.length} items`);
      
      const normalizedItems = newsItems.map(this.normalizeNewsItem);
      console.log(`✅ Normalized ${normalizedItems.length} news items`);
      
      return normalizedItems;
    } catch (error) {
      console.error('Error fetching news:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Failed to fetch news: ${error.response.status} ${error.response.statusText}`);
      }
      throw new Error(`Failed to fetch news: ${error.message}`);
    }
  }

  /**
   * Normalizes a news item to ensure consistent structure
   * @param {Object} item - Raw news item from API
   * @returns {Object} - Normalized news item
   */
  normalizeNewsItem(item) {
    return {
      id: item.id || Date.now().toString(),
      title: item.title || 'Untitled',
      content: item.description || '',
      url: item.links && item.links.length > 0 ? item.links[0].url : null,
      publishedAt: item.last_updated || new Date().toISOString(),
      author: 'Opportunity Hack',
      tags: [],
      imageUrl: item.image || null,
      slackPermalink: item.slack_permalink || null,
      // Additional OHack-specific metadata
      slackChannel: item.slack_channel || null,
      slackTs: item.slack_ts || null,
      links: item.links || [],
      // Keep original data for platform-specific needs
      originalData: item
    };
  }

  /**
   * Fetches a specific news item by ID
   * @param {string} newsId - ID of the news item
   * @returns {Promise<Object>} - News item
   */
  async fetchNewsById(newsId) {
    try {
      const config = {
        url: `${this.apiServerUrl}/api/messages/news/${newsId}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      };

      const response = await axios(config);
      const data = response.data;
      return this.normalizeNewsItem(data);
    } catch (error) {
      console.error('Error fetching news item:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Failed to fetch news item: ${error.response.status} ${error.response.statusText}`);
      }
      throw new Error(`Failed to fetch news item: ${error.message}`);
    }
  }

  /**
   * Filters news items based on criteria suitable for social media posting
   * @param {Array} newsItems - Array of news items
   * @param {Object} criteria - Filtering criteria
   * @returns {Array} - Filtered news items
   */
  filterForSocialMedia(newsItems, criteria = {}) {
    const {
      maxAge = 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds (very lenient for OHack news)
      minContentLength = 20, // Reduced from 50 to be more lenient
      requireTitle = true,
      excludeTags = [],
      includeTags = []
    } = criteria;

    const now = new Date().getTime();
    console.log(`🔍 Filtering ${newsItems.length} news items (maxAge: ${Math.round(maxAge / (24 * 60 * 60 * 1000))} days, minContent: ${minContentLength})`);

    return newsItems.filter(item => {
      // Skip age filtering if publishedAt is invalid
      if (item.publishedAt) {
        const itemDate = new Date(item.publishedAt);
        if (!isNaN(itemDate.getTime())) {
          const itemAge = now - itemDate.getTime();
          if (itemAge > maxAge) {
            console.log(`❌ "${item.title}" too old: ${Math.round(itemAge / (24 * 60 * 60 * 1000))} days`);
            return false;
          }
        }
      }

      // Check content length (more lenient)
      if (item.content && item.content.length < minContentLength) {
        console.log(`❌ "${item.title}" content too short: ${item.content.length} chars`);
        return false;
      }

      // Check title requirement
      if (requireTitle && (!item.title || item.title.trim() === '')) {
        console.log(`❌ Item missing title`);
        return false;
      }

      // Check excluded tags
      if (excludeTags.length > 0 && item.tags && item.tags.some(tag => excludeTags.includes(tag.toLowerCase()))) {
        console.log(`❌ "${item.title}" has excluded tag`);
        return false;
      }

      // Check included tags (if specified, at least one must match)
      if (includeTags.length > 0 && (!item.tags || !item.tags.some(tag => includeTags.includes(tag.toLowerCase())))) {
        console.log(`❌ "${item.title}" missing required tag`);
        return false;
      }

      console.log(`✅ "${item.title}" passed filters`);
      return true;
    });
  }

  /**
   * Sorts news items by relevance for social media posting
   * @param {Array} newsItems - Array of news items
   * @returns {Array} - Sorted news items (most relevant first)
   */
  sortByRelevance(newsItems) {
    return newsItems.sort((a, b) => {
      // Prioritize by publish date (newer first)
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      
      if (dateB !== dateA) {
        return dateB - dateA;
      }

      // Secondary sort by content length (longer content often more substantial)
      return b.content.length - a.content.length;
    });
  }

  /**
   * Gets news items ready for social media posting
   * @param {Object} options - Options for fetching and filtering
   * @returns {Promise<Array>} - Ready-to-post news items
   */
  async getNewsForSocialMedia(options = {}) {
    const {
      limit = 10,
      filterCriteria = {},
      sortByRelevance: shouldSort = true
    } = options;

    try {
      const newsItems = await this.fetchNews(limit);
      const filteredItems = this.filterForSocialMedia(newsItems, filterCriteria);
      console.log(`🎯 Final result: ${filteredItems.length} items ready for social media`);
      
      return shouldSort ? this.sortByRelevance(filteredItems) : filteredItems;
    } catch (error) {
      console.error('Error getting news for social media:', error);
      throw error;
    }
  }
}