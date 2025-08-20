const axios = require('axios');

exports.postToLinkedIn = async ({ text, media, user }) => {
  try {
    // Check if user has LinkedIn connected
    if (!user.socialConnections.linkedin.connected) {
      return { success: false, error: 'LinkedIn not connected' };
    }

    const accessToken = user.socialConnections.linkedin.accessToken;
    const userId = user.socialConnections.linkedin.userId;

    // LinkedIn API endpoint
    const url = 'https://api.linkedin.com/v2/ugcPosts';

    const postData = {
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: media && media.length > 0 ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // Add media if provided
    if (media && media.length > 0) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = media.map(m => ({
        status: 'READY',
        media: m.url
      }));
    }

    const response = await axios.post(url, postData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('LinkedIn post error:', error.message);
    return { success: false, error: error.message };
  }
};
