const axios = require('axios');
const { config } = require('../config');

const fetchImage = async (lat, lon) => {
    const url = `https://dev.virtualearth.net/REST/v1/Imagery/Map/AerialWithLabels/${lat},${lon}/8?mapSize=2000,1000&pp=${lat},${lon};47&key=${config.BING_API_KEY}`;
    console.log(url, config.BING_API_KEY);

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        return base64Image;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
};

const generateLandCoordinate = async () => {
    while (true) {
        const lat = (Math.random() * 180 - 90).toFixed(6);
        const lon = (Math.random() * 360 - 180).toFixed(6);

        const country = await isLand(lat, lon);
        if (country) {
            return { lat, lon, country };
        }
    }
};

module.exports = {
    fetchImage,
    generateLandCoordinate
};
