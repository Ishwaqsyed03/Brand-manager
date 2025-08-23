const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

// Simple in-memory store for PKCE code_verifiers, keyed by state
const pkceStore = new Map(); // state -> { codeVerifier, createdAt }
const PKCE_TTL_MS = 5 * 60 * 1000;

const toBase64Url = (buffer) => buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const createPkcePair = () => {
  const codeVerifier = toBase64Url(crypto.randomBytes(32));
  const codeChallenge = toBase64Url(crypto.createHash('sha256').update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
};

// Twitter OAuth 2.0 (PKCE) - start
router.get('/oauth/twitter', async (req, res) => {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = process.env.TWITTER_REDIRECT_URI || 'http://localhost:5000/oauth/twitter/callback';
    if (!clientId) {
      return res.status(500).send('TWITTER_CLIENT_ID not configured');
    }

    const { codeVerifier, codeChallenge } = createPkcePair();
    const state = toBase64Url(crypto.randomBytes(16));
    pkceStore.set(state, { codeVerifier, createdAt: Date.now() });

    const scope = [
      'tweet.read',
      'tweet.write',
      'users.read',
      'offline.access'
    ].join(' ');

    const url = new URL('https://twitter.com/i/oauth2/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', scope);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    res.redirect(url.toString());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Twitter OAuth 2.0 callback
router.get('/oauth/twitter/callback', async (req, res) => {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = process.env.TWITTER_REDIRECT_URI || 'http://localhost:5000/oauth/twitter/callback';
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code or state');

    const entry = pkceStore.get(state);
    pkceStore.delete(state);
    if (!entry || (Date.now() - entry.createdAt) > PKCE_TTL_MS) {
      return res.status(400).send('Invalid or expired state');
    }

    const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    const form = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code: code,
      code_verifier: entry.codeVerifier,
    });

    const tokenResp = await axios.post(tokenUrl, form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token: accessToken, refresh_token: refreshToken, token_type: tokenType } = tokenResp.data || {};
    if (!accessToken) return res.status(502).send('Failed to obtain Twitter access token');

    // Fetch user info
    const meResp = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const userId = meResp.data?.data?.id;
    const username = meResp.data?.data?.username;

    // No-auth mode: return JSON with instructions. In real mode, persist to DB for req.user.
    res.send(`Twitter connected. User: @${username}. You can now close this window.`);

    // TODO: If you enable auth, persist tokens for the logged-in user here.
    // Example:
    // const user = await User.findById(req.user._id);
    // user.socialConnections.twitter = { connected: true, accessToken, refreshToken, userId, username };
    // await user.save();
  } catch (err) {
    const msg = err?.response?.data?.error || err?.response?.data || err.message;
    res.status(500).send(`Twitter OAuth failed: ${msg}`);
  }
});

// Instagram (via Facebook Login) - start
router.get('/oauth/instagram', async (req, res) => {
  try {
    const fbAppId = process.env.FB_APP_ID;
    const redirectUri = process.env.FB_REDIRECT_URI || 'http://localhost:5000/oauth/instagram/callback';
    if (!fbAppId) return res.status(500).send('FB_APP_ID not configured');

    const state = toBase64Url(crypto.randomBytes(16));

    const scope = [
      'public_profile',
      'email',
      'pages_show_list',
      'pages_read_engagement',
      'instagram_basic',
      'instagram_content_publish'
    ].join(',');

    const url = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    url.searchParams.set('client_id', fbAppId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope);

    res.redirect(url.toString());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Instagram callback: exchange code -> user access token -> page -> ig business account
router.get('/oauth/instagram/callback', async (req, res) => {
  try {
    const fbAppId = process.env.FB_APP_ID;
    const fbAppSecret = process.env.FB_APP_SECRET;
    const redirectUri = process.env.FB_REDIRECT_URI || 'http://localhost:5000/oauth/instagram/callback';
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing code');

    // Exchange code for user access token
    const tokenResp = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: fbAppId,
        client_secret: fbAppSecret,
        redirect_uri: redirectUri,
        code
      }
    });

    const userAccessToken = tokenResp.data?.access_token;
    if (!userAccessToken) return res.status(502).send('Failed to obtain Facebook user access token');

    // Get pages
    const pagesResp = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: { access_token: userAccessToken }
    });
    const firstPage = pagesResp.data?.data?.[0];
    if (!firstPage) return res.status(400).send('No Facebook pages found');

    // Get Instagram business account id from page
    const pageDetails = await axios.get(`https://graph.facebook.com/v18.0/${firstPage.id}`, {
      params: {
        fields: 'instagram_business_account{name,username,id}',
        access_token: firstPage.access_token
      }
    });

    const ig = pageDetails.data?.instagram_business_account;
    if (!ig?.id) return res.status(400).send('No Instagram business account connected to the page');

    // Return a simple success message
    res.send(`Instagram connected. IG Business Account: @${ig.username} (${ig.id}). You can now close this window.`);

    // TODO: If you enable auth, persist tokens for the logged-in user here.
    // Example:
    // const user = await User.findById(req.user._id);
    // user.socialConnections.instagram = {
    //   connected: true,
    //   accessToken: firstPage.access_token, // Page token is used for publishing
    //   userId: ig.id,
    //   username: ig.username
    // };
    // await user.save();
  } catch (err) {
    const msg = err?.response?.data?.error?.message || err?.message;
    res.status(500).send(`Instagram OAuth failed: ${msg}`);
  }
});

module.exports = router;


