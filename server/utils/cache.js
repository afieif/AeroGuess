const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

module.exports = {
    cache
};
