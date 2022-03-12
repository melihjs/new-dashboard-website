const router = require('express').Router();

router.get('/', async (req, res) => {
  res.json({ message: "404: Not Found", code: 0 });  
});

router.get('/discord', async (req, res) => {
  res.redirect('https://discord.gg/developers');
});

module.exports = router;