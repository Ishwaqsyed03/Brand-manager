const axios = require("axios");

exports.postToTwitter = async ({ text, media }) => {
  try {
    const url = "https://api.twitter.com/2/tweets";
    const accessToken = "ACCESS_TOKEN_FROM_DB";

    const response = await axios.post(
      url,
      { text },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return { success: true, data: response.data };
  } catch (err) {
    console.error("Twitter post error:", err.message);
    return { success: false, error: err.message };
  }
};
