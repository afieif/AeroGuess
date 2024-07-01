require('dotenv').config();

module.exports.config = {
    PORT: process.env.PORT || 5000,
    BING_API_KEY: process.env.BING_API_KEY
};
