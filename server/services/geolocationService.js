const axios = require('axios');
const { cache } = require('../utils/cache');

const isLand = async (lat, lon) => {
    const cacheKey = `${lat},${lon}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult !== undefined) {
        return cachedResult;
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    try {
        const response = await axios.get(url);
        const country = response.data.address?.country_code ? response.data.address.country_code : null;
        cache.set(cacheKey, country);
        return country;
    } catch (error) {
        console.error(error);
        return null;
    }
};

module.exports = {
    isLand
};
