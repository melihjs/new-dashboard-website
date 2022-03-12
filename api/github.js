const router = require('express').Router();
const request = require('request');

router.get('/repos/:username/:reponame', async (req, res) => {
  const username = req.params.username;
  const reponame = req.params.reponame;
  request({
    url: `https://api.github.com/repos/${username}/${reponame}`,
    headers: { 'User-Agent': 'takolya' }
  }, async (error, response, body) => {
    if (error) res.json({ error: error });
    if (!error && response.statusCode == 200) {
      const info = JSON.parse(body);
      const json = {
        id: info.id,
        name: info.name,
        description: info.description,
        full_url: info.svn_url,
        full_name: info.full_name,
        stars: info.stargazers_count.toLocaleString(),
        forks: info.forks_count.toLocaleString(),
        fork: info.fork,
        private: info.private,
        owner: { name: info.owner.login, url: info.owner.html_url, avatar_url: info.owner.avatar_url },
      };
      res.json(json);
    }
  });
});

router.get('/repos', async (req, res) => {
  res.json({ message: "404: Not Found", code: 0 });
});

router.get('/users', async (req, res) => {
  res.json({ message: "404: Not Found", code: 0 });
});

router.get('/users/:username', async (req, res) => {
  const username = req.params.username;
  request({
    url: `https://api.github.com/users/${username}`,
    headers: { 'User-Agent': 'takolya' }
  }, async (error, response, body) => {
    if (error) res.json({error:error});
    if (!error && response.statusCode == 200) {
      const info = JSON.parse(body);
      const json = {
        id: info.id,
        name: info.login,
        avatar_url: info.avatar_url,
        url: info.html_url,
        type: info.type,
        followers: info.followers,
        following: info.following,
        location: info.location,
        blog: info.blog,
        bio: info.bio
      };
      res.json(json);
    }
  })
});

router.get('/', async (req, res) => {
  res.json({ message: "404: Not Found", code: 0 });
});

module.exports = router;