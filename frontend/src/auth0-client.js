const debug = require("debug")("spa_react_javascript_hello-world");
const rp = require("request-promise-native");

class Auth0Client {
  constructor() {
    this.mgmtApiToken = "";
  }

  async getToken() {
    if (this.mgmtApiToken) return this.mgmtApiToken;
    const opts = {
      method: "POST",
      uri: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`,
      json: {
        client_id: process.env.REACT_APP_AUTH0_USER_MGMT_CLIENT_ID,
        client_secret: process.env.REACT_APP_AUTH0_USER_MGMT_SECRET,
        grant_type: "client_credentials",
        audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`,
      },
    };    
    const { access_token } = await rp(opts);
    
    this.mgmtApiToken = access_token;
    return this.mgmtApiToken;
  }

  async request(options) {
    const token = await this.getToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const opts = { ...options, headers };
    const body = await rp(opts);
    try {
      return JSON.parse(body);
    } catch (err) {
      debug("body parsing failed, returning unparsed body %o", body);
      return body;
    }
  }

  async getUser(userId) {
    console.log("getting user profile for *%s* from mgmt api...", userId);
    return await this.request({
      url: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${userId}`,
    });
  }

  async updateUser(userId, payload) {
    debug("updating %s with payload %o...", userId, payload);
    return await this.request({
      method: "PATCH",
      url: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${userId}`,
      json: payload,
    });
  }

  async getUsersWithSameVerifiedEmail({ sub, email }) {
    debug("searching maching users with email *%s* ...", email);
    return await this.request({
      url: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users`,
      qs: {
        search_engine: "v3",
        q: `email:"${email}" AND email_verified:true -user_id:"${sub}"`,
      },
    });
  }

  async linkAccounts(rootUserId, targetUserIdToken) {
    debug("linking...");
    return await this.request({
      url: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${rootUserId}/identities`,
      method: "POST",
      json: {
        link_with: targetUserIdToken,
      },
    });
  }

  /*
   * Unlinks Accounts
   * Unlinks targetUserId account from rootUserId account
   *
   * Example:
   *
   *  await auth0Client.unlinkAccounts('google-oauth2%7C115015401343387192604','sms','560ebaeef609ee1adaa7c551')
   *
   * @param {String} rootUserId
   * @param {String} targetUserProvider
   * @param {String} targetUserId
   * @api public
   */
  async unlinkAccounts(rootUserId, targetUserProvider, targetUserId) {
    debug("Unlinking %s from %s ...", targetUserId, rootUserId);
    return await this.request({
      method: "DELETE",
      url: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${rootUserId}/identities/${targetUserProvider}/${targetUserId}`,
    });
  }
}

module.exports = new Auth0Client();