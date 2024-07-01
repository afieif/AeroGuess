const express = require('express');
const router = express.Router();

router.head('/', (req, res) => {
    res.status(200).send('');
});

router.get('/', (req, res) => {
    res.status(200).send('github.com/afieif');
});

module.exports = router;
