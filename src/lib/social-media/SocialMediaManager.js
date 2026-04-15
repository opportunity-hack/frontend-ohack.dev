import { NewsService } from './NewsService';
import { ThreadsService } from './ThreadsService';
import { SlackService } from './SlackService';

/**
 * Central manager for social media posting operations
 * Handles coordination between news fetching and multiple social media platforms
 */
export class SocialMediaManager {
  constructor(apiServerUrl, userCredentials = null) {
    this.newsService = new NewsService(apiServerUrl);
    this.socialMediaServices = new Map();
    this.postingHistory = [];
    this.userCredentials = userCredentials; // Optional user credentials for API server
  }

  /**
   * Registers a social media service
   * @param {string} platformName - Name of the platform (e.g., 'threads', 'twitter')
   * @param {SocialMediaService} service - Service instance for the platform
   */
  registerService(platformName, service) {
    this.socialMediaServices.set(platformName.toLowerCase(), service);
  }

  /**
   * Unregisters a social media service
   * @param {string} platformName - Name of the platform to remove
   */
  unregisterService(platformName) {
    this.socialMediaServices.delete(platformName.toLowerCase());
  }

  /**
   * Gets all registered platform names
   * @returns {Array<string>} - Array of registered platform names
   */
  getRegisteredPlatforms() {
    return Array.from(this.socialMediaServices.keys());
  }

  /**
   * Gets a specific social media service
   * @param {string} platformName - Name of the platform
   * @returns {SocialMediaService|null} - Service instance or null if not found
   */
  getService(platformName) {
    return this.socialMediaServices.get(platformName.toLowerCase()) || null;
  }

  /**
   * Gets user credentials for the API server
   * @returns {Object|null} - User credentials or null if not set
   */
  getUserCredentials() {
    return this.userCredentials || null;
  }

  /**
   * Validates credentials for all registered services
   * @returns {Promise<Object>} - Validation results for each platform
   */
  async validateAllCredentials() {
    const results = {};

    for (const [platformName, service] of this.socialMediaServices) {
      try {
        results[platformName] = {
          valid: await service.validateCredentials(),
          platform: service.getPlatformName(),
          error: null,
        };
      } catch (error) {
        results[platformName] = {
          valid: false,
          platform: service.getPlatformName(),
          error: error.message,
        };
      }
    }

    return results;
  }

  /**
   * Posts a single news item to specified platforms
   * @param {Object} newsItem - News item to post
   * @param {Array<string>} platforms - Array of platform names to post to
   * @param {Object} options - Additional options like slack channel
   * @returns {Promise<Object>} - Results from each platform
   */
  async postToMultiplePlatforms(newsItem, platforms = [], options = {}) {
    const results = {
      newsItem: {
        id: newsItem.id,
        title: newsItem.title,
        publishedAt: newsItem.publishedAt,
      },
      platforms: {},
      summary: {
        total: platforms.length,
        successful: 0,
        failed: 0,
        errors: [],
      },
    };

    for (const platformName of platforms) {
      const service = this.getService(platformName);

      if (!service) {
        results.platforms[platformName] = {
          success: false,
          error: `Platform '${platformName}' is not registered`,
          platform: platformName,
        };
        results.summary.failed++;
        results.summary.errors.push(`Platform '${platformName}' not found`);
        continue;
      }

      try {
        // Special handling for Slack to include channel
        let result;
        if (platformName === "slack" && options.slackChannel) {
          result = await service.postNews(newsItem, options.slackChannel);
        } else {
          result = await service.postNews(newsItem);
        }
        results.platforms[platformName] = result;

        if (result.success) {
          results.summary.successful++;
        } else {
          results.summary.failed++;
          results.summary.errors.push(
            `${platformName}: ${result.error || "Unknown error"}`
          );
        }
      } catch (error) {
        results.platforms[platformName] = {
          success: false,
          error: error.message,
          platform: service.getPlatformName(),
        };
        results.summary.failed++;
        results.summary.errors.push(`${platformName}: ${error.message}`);
      }
    }

    // Store in posting history
    this.postingHistory.push({
      timestamp: new Date().toISOString(),
      newsItem: newsItem,
      results: results,
      platforms: platforms,
    });

    return results;
  }

  /**
   * Fetches latest news and posts to specified platforms
   * @param {Object} options - Configuration options
   * @returns {Promise<Array>} - Array of posting results
   */
  async postLatestNews(options = {}) {
    const {
      platforms = this.getRegisteredPlatforms(),
      limit = 5,
      newsOptions = {},
      dryRun = false,
    } = options;

    try {
      // Fetch news suitable for social media
      const newsItems = await this.newsService.getNewsForSocialMedia({
        limit,
        ...newsOptions,
      });

      if (newsItems.length === 0) {
        return {
          success: true,
          message: "No news items available for posting",
          results: [],
        };
      }

      const results = [];

      for (const newsItem of newsItems) {
        if (dryRun) {
          // In dry run mode, just format content for each platform
          const dryRunResult = {
            newsItem: {
              id: newsItem.id,
              title: newsItem.title,
              publishedAt: newsItem.publishedAt,
            },
            platforms: {},
            dryRun: true,
          };

          for (const platformName of platforms) {
            const service = this.getService(platformName);
            if (service) {
              const formattedContent = service.formatContent(newsItem);
              dryRunResult.platforms[platformName] = {
                formattedContent: formattedContent,
                characterCount: formattedContent.length,
                withinLimit: formattedContent.length <= service.characterLimit,
              };

              // Add channel info for Slack
              if (platformName === "slack" && options.slackChannel) {
                dryRunResult.platforms[platformName].channel =
                  options.slackChannel;
              }
            }
          }

          results.push(dryRunResult);
        } else {
          const result = await this.postToMultiplePlatforms(
            newsItem,
            platforms,
            options
          );
          results.push(result);
        }
      }

      return {
        success: true,
        message: `${dryRun ? "Dry run completed" : "Posting completed"} for ${results.length} news items`,
        results: results,
      };
    } catch (error) {
      console.error("Error posting latest news:", error);
      return {
        success: false,
        message: `Error posting latest news: ${error.message}`,
        error: error.message,
        results: [],
      };
    }
  }

  /**
   * Gets posting history
   * @param {number} limit - Number of recent posts to return
   * @returns {Array} - Array of posting history entries
   */
  getPostingHistory(limit = 50) {
    return this.postingHistory.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Clears posting history
   */
  clearPostingHistory() {
    this.postingHistory = [];
  }

  /**
   * Gets platform statistics and capabilities
   * @returns {Object} - Statistics for all registered platforms
   */
  getPlatformStats() {
    const stats = {};

    for (const [platformName, service] of this.socialMediaServices) {
      stats[platformName] = {
        name: service.getPlatformName(),
        limits: service.getPlatformLimits(),
        isConfigured: !!service.credentials,
      };
    }

    return stats;
  }

  /**
   * Factory method to create and configure the manager with environment variables
   * @param {Object} env - Environment variables object
   * @param {string} apiServerUrl - API server URL from environment context
   * @param {Object} userCredentials - Optional user credentials for the Backend API server
   * @returns {SocialMediaManager} - Configured manager instance
   */
  static createFromEnvironment(env = process.env, apiServerUrl, userCredentials = null) {
    const manager = new SocialMediaManager(apiServerUrl, userCredentials);

    // Configure Threads if credentials are available
    if (env.THREADS_ACCESS_TOKEN && env.THREADS_USER_ID) {
      try {
        const threadsService = new ThreadsService({
          accessToken: env.THREADS_ACCESS_TOKEN,
          userId: env.THREADS_USER_ID,
          username: env.THREADS_USERNAME || "opportunityhack",
          // Add user credentials for API calls if needed
          ...userCredentials
        });
        manager.registerService("threads", threadsService);
      } catch (error) {
        console.warn("Failed to configure Threads service:", error.message);
      }
    }

    // Configure Slack (always available since it uses our internal API)
    // Pass user credentials for API authentication
    const slackService = new SlackService(userCredentials || {});
    manager.registerService("slack", slackService);

    // Add more platforms here as needed
    // Example for Twitter/X:
    // if (env.TWITTER_API_KEY && env.TWITTER_API_SECRET) {
    //   const twitterService = new TwitterService({...});
    //   manager.registerService('twitter', twitterService);
    // }

    return manager;
  }
}