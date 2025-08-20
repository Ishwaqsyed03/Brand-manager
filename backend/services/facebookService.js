const axios = require('axios');

exports.postToFacebook = async ({ text, media, user }) => {
  try {
    // Check if user has Facebook connected
    if (!user.socialConnections.facebook.connected) {
      return { success: false, error: 'Facebook not connected' };
    }

    const accessToken = user.socialConnections.facebook.accessToken;
    const userId = user.socialConnections.facebook.userId;

    // Facebook API endpoint
    const url = `https://graph.facebook.com/v18.0/${userId}/feed`;

    const postData = {
      message: text,
      access_token: accessToken
    };

    // Add media if provided
    if (media && media.length > 0) {
      postData.link = media[0].url;
    }

    const response = await axios.post(url, postData);

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Facebook post error:', error.message);
    return { success: false, error: error.message };
  }
};
