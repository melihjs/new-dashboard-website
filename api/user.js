const router = require('express').Router();
const db = require('quick.db');

router.get('/:id', async (req, res) => {
  const data = req.params.id;
  if (!Number(data)) return res.json({ message: "404: Not Found", code: 0 });
  const user = {
    threads_count: db.get(`threadss_${data}`)
  };
  return res.json({ user: { id: data, threads_count: user.threads_count || 0 }, code: 0 });
});

router.get('/', async (req, res) => {
  return res.json({ message: "404: Not Found", code: 0 });
});

module.exports = router;