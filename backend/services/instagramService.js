const axios = require('axios');

exports.postToInstagram = async ({ text, media, user }) => {
  try {
    // Check if user has Instagram connected
    if (!user.socialConnections.instagram.connected) {
      return { success: false, error: 'Instagram not connected' };
    }

    const accessToken = user.socialConnections.instagram.accessToken;
    const userId = user.socialConnections.instagram.userId;

    if (!media || media.length === 0) {
      return { success: false, error: 'Instagram requires media for posts' };
    }

    // Step 1: Create media container
    const containerUrl = `https://graph.facebook.com/v18.0/${userId}/media`;
    const containerData = {
      image_url: media[0].url,
      caption: text,
      access_token: accessToken
    };

    const containerResponse = await axios.post(containerUrl, containerData);
    const creationId = containerResponse.data.id;

    // Step 2: Publish the container
    const publishUrl = `https://graph.facebook.com/v18.0/${userId}/media_publish`;
    const publishData = {
      creation_id: creationId,
      access_token: accessToken
    };

    const publishResponse = await axios.post(publishUrl, publishData);

    return { success: true, data: publishResponse.data };
  } catch (error) {
    console.error('Instagram post error:', error.message);
    return { success: false, error: error.message };
  }
};
