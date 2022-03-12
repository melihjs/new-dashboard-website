const router = require('express').Router();
const db = require('quick.db');

router.get('/get/:title', async (req, res) => {
  const title = req.params.title;
  const titled = encodeURIComponent(title);
  const data = {
    thread: db.get(`thread_${titled}`)
  };
  if (data.thread == 'yes') {
    const desc = db.get(`desc_${titled}`);
    const discord = db.get(`dc_${titled}`);
    const bench = db.get(`sira_${titled}`);
    return res.json({ thread: { title: title, description: desc, discord: discord, bench: bench }, code: 0 });
  } else {
    return res.json({message: "404: Not Found", code: 0});
  }
});

router.get('/get', async (req, res) => {
  return res.json({ message: "404: Not Found", code: 0 });
});

router.get('/', async (req, res) => {
  return res.json({ message: "404: Not Found", code: 0 });
});

router.get('/:idk', async (req, res) => {
  const c = req.params.idk;
  if (c) return res.json({ message: "404: Not Found", code: 0 });
});

module.exports = router;