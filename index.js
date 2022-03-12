const { Client } = require('discord.js');
const client = new Client({ 
  intents: [
		1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
	]
});
const express = require('express');
const fetch = require('node-fetch');
const passport = require('passport');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const Strategy = require('passport-discord').Strategy;
const url = require('url');
const data = require('quick.db');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.engine('ejs', ejs.__express);
app.use('/api/v1', require('./api/index'));
app.use('/api/v1/threads', require('./api/threads'));
app.use('/api/threads', require('./api/threads'));
app.use('/api/user', require('./api/user'));
app.use('/api/v1/user', require('./api/user'));
app.use('/api/v1/github', require('./api/github'));
app.use('/api/github', require('./api/github'));
const admins = ['id', 'id']

app.listen(3000, () => {
  console.log('site hazır.');
});

client.on('ready', async () => {
  console.log('bot hazır.');
  if (!Array.isArray(data.get(`aallz`))) {
    data.set(`aallz`, []);
  } else if (!Array.isArray(data.get(`banned`))) {
    data.set(`banned`, []);
  }
});

client.login('OTUwNzQwNDYxMzA2NDA4OTcw.YidUDQ.0dHlXpcKKaaZJXDf_e4-PblNUho');


passport.serializeUser((user, done) => {
	done(null, user);
});
passport.deserializeUser((obj, done) => {
	done(null, obj);
});

passport.use(new Strategy({
	clientID: 'id',
	clientSecret: 'secret',
	callbackURL: 'domain/auth', 
	scope: ['identify', 'guilds'] 
},
(accessToken, refreshToken, profile, done) => {
	process.nextTick(() => done(null, profile));
}));
app.use(session({
	store: new MemoryStore({
		checkPeriod: 86400000
	}),
	secret: 'qwerz', 
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.locals.domain = 'domain';

function checkAuth(req, res, next) {
	if (req.isAuthenticated()) return next();
	req.session.backURL = req.url;
	res.redirect('/login');
}

app.get('/login', (req, res, next) => {
	if (req.session.backURL) {
		req.session.backURL = 'domain/auth';
	} else if (req.headers.referer) {
		const parsed = url.parse(req.headers.referer);
		if (parsed.hostname === app.locals.domain) {
			req.session.backURL = parsed.path;
		}
	} else {
		req.session.backURL = '/';
	}
	next();
},

passport.authenticate('discord'));
app.get('/auth', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
	const banned = data.get(`ban_${req.user.id}`);
  if (!banned) {
    return res.redirect('/');
  } else if (banned == 'yes') {
    req.session.destroy(() => {
      req.logout();
      res.render('404', {
        member: {},
        error_msg: 'Sen siteden yasaklanmışsın!',
        admins: admins
      })
    });
  }
});

app.get("/logout", function(req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/"); 
    });
  });

app.get('/', async (req,res) => {
  res.render('index', {
    member: req.user, admins: admins
  });
});


app.get('/devs', async (req,res) => {
  res.render('devs', {
    member: req.user, 
    bot: client.user,
    admins: admins,
    avatar_melih: client.users.cache.get('id').displayAvatarURL({ dynamic: true }),
    avatar_kaan: client.users.cache.get('id').displayAvatarURL({ dynamic: true })
  });
});
 
app.get('/create-thread', async (req, res) => {
  if (req.user) {
    res.render('create-thread', { member: req.user, admins: admins });
  } else {
    res.redirect('/login');
  }
});

app.get('/redeem', async (req, res) => {
  res.render('redeem', { member: req.user, admins: admins, alert: null, msg_type: null, msg_content: null });
});

app.post('/redeem', bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const body = req.body;
  const code = data.get(`redeemc_${client.user.id}`);
  if (req.user) {
    if (code == body.code) {
      const used = data.get(`used_${code}`);
      if (used == 'yes') {
        res.render('redeem', {
          member: req.user,
          admins: admins, 
          alert: 'yes', 
          msg_type: 'alert', 
          msg_content: 'Bu kodu zaten kullanmışsın!'
        });
      } else {
        data.set(`üyelik_${req.user.id}`, 'pro');
        data.set(`used_${code}`, 'yes');
        res.render('redeem', {
          member: req.user,
          admins: admins, 
          alert: 'yes', 
          msg_type: 'success', 
          msg_content: 'Kodu başarıyla kullandın, üyeliğin aktif edildi!'
        });
      }
    } else {
      res.render('redeem', {
        member: req.user,
        admins: admins, 
        alert: 'yes', 
        msg_type: 'alert', 
        msg_content: 'Kod yanlış veya geçersiz!'
      });
    }
  } else {
    return res.redirect('/login');
  }
});

app.post('/create-thread', bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const body = req.body;
  const uss = `${req.user.username}#${req.user.discriminator}`;
  const dataq = data.get(`aallz`);
  data.set(`thread_${encodeURIComponent(body.title)}`, 'yes');
  data.set(`desc_${encodeURIComponent(body.title)}`, body.desc);
  data.set(`dc_${encodeURIComponent(body.title)}`, uss);
  data.set(`title_${encodeURIComponent(body.title)}`, body.title);
  data.set(`url_${encodeURIComponent(body.title)}`, `/${encodeURIComponent(body.title)}`);
  data.set(`sira_${encodeURIComponent(body.title)}`, dataq.length || 1);
  data.add(`threadss_${req.user.id}`, 1);
  data.push('aallz', 'created');
  data.push(`alls_${client.user.id}`, {
    title: body.title,
    desc: body.desc,
    discord: uss,
    url: `/${encodeURIComponent(body.title)}.${dataq.length || 1}`
  });
  data.push(`alls_${req.user.id}`, {
    title: body.title,
    desc: body.desc,
    discord: uss,
    url: `/${encodeURIComponent(body.title)}.${dataq.length || 1}`
  });
  return res.redirect(`/${encodeURIComponent(body.title)}.${dataq.length || 1}`);
});

app.get('/threads', async (req, res) => {
  const allq = data.get(`alls_${client.user.id}`);
  const divs = [];
  if (!allq) {
    res.render('threads', {
      member: req.user,
      divlersite: `<h1 class="mb-5 text-3xl">Hiç konu oluşturulmamış!</h1>`,
      sites: 'h1',
      admins: admins
    });
  } else {
    const title = allq.reverse();
    allq.length = 20;
    title.join('')
    title.forEach(async (option) => {
      divs.push(`
        <div class="takolya">
          <div class="card">
            <div class="imgBx">
              <img src="https://media.discordapp.net/attachments/943521027705671700/950062401989013574/20220306_190843.png">
            </div>
            <div class="contentBx">
              <h2>${option.title}</h2>
              <br>
              <div class="size">
                <h3 style="font-size: 13px;">${option.desc}</h3>
              </div>
              <br>
              <a href="${option.url}">Göz At</a>
            </div>
          </div>
        </div>
      `);
    });
    res.render('threads', {
      member: req.user,
      divlersite: divs.join('&nbsp;&nbsp;&nbsp;&nbsp;'),
      sites: 'div',
      admins: admins
    });
  }
});

app.get('/admin', async (req, res) => {
  if (req.user) {
    if (!admins.includes(req.user.id)) {
      return res.render('404', {
        member: req.user,
        error_msg: 'Bir hata ile karşılaştık, buraya erişimin yok.',
        admins: admins
      });
    } else {
      return res.render('admin', {
        member: req.user,
        admins: admins,
        alert: null,
        msg_type: null,
        msg_content: null,
      });
    }
  } else {
    return res.render('404', {
      member: req.user,
      error_msg: 'Bir hata ile karşılaştık, buraya erişimin yok.',
      admins: admins
    });
  }
});

app.post('/admin', bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const body = req.body;
  if (body.code) {
    data.set(`redeemc_${client.user.id}`, body.code);
    res.render('admin', {
      member: req.user,
      admins: admins,
      alert: 'yes',
      msg_type: 'success',
      msg_content: 'Kod başarıyla oluşturuldu!'
    });
  } else { return; }
});

app.get('/user', async (req, res) => {
  if (req.user) {
    const allq = data.get(`alls_${req.user.id}`);
    const üye = data.get(`üyelik_${req.user.id}`);
    const divs = [];
    if (!allq) {
      res.render('profile', {
        member: req.user,
        divlersite: `<h1 class="mb-5 text-3xl">Hiç konu oluşturmamışsın!</h1>`,
        sites: 'h1',
        topkonu: data.get(`threadss_${req.user.id}`),
        avatar: (i, a) => {
          return `https://cdn.discordapp.com/avatars/${i}/${a}` || "https://cdn.discordapp.com/embed/avatars/5.png";
        },
        banner: (i, a) => {
          return `https://cdn.discordapp.com/banners/${i}/${a}` || "https://media.discordapp.net/attachments/943521027705671700/951397063571161088/20220306_173834.png?width=759&height=427";
        },
        üye: üye,
        admins: admins
      });
    } else {
      const title = allq.reverse();
      allq.length = 20;
      title.join('')
      title.forEach(async (option) => {
        divs.push(`
          <center><div class="takolya" style="align: left; float: left; display: flex; margin: 0 auto;">
            <div class="card">
              <div class="imgBx">
                <img src="https://media.discordapp.net/attachments/943521027705671700/950062401989013574/20220306_190843.png">
              </div>
              <div class="contentBx">
                <h2>${option.title}</h2>
                <br>
                <div class="size">
                  <h3 style="font-size: 13px;">${option.desc}</h3>
                </div>
                <br>
                <a href="${option.url}">Göz At</a>
              </div>
            </div>
          </div></center>
        `);
      });
      res.render('profile', {
        member: req.user,
        divlersite: divs.join('&nbsp;&nbsp;&nbsp;&nbsp;'),
        sites: 'div',
        topkonu: data.get(`threadss_${req.user.id}`),
        avatar: (i, a) => {
          return `https://cdn.discordapp.com/avatars/${i}/${a}` || "https://cdn.discordapp.com/embed/avatars/5.png";
        },
        banner: (i, a) => {
          return `https://cdn.discordapp.com/banners/${i}/${a}` || "https://media.discordapp.net/attachments/943521027705671700/951397063571161088/20220306_173834.png?width=759&height=427";
        },
        üye: üye,
        admins: admins
      });
    }
  } else {
    res.redirect('/login');
  }
});

app.get('/api', async (req, res) => {
  res.render('api', { member: req.user, admins: admins });
});

app.get('/:title.:sira', async (req, res) => {
  const title = encodeURIComponent(req.params.title);
  const dataq = data.get(`aallz`);
  const dataz = data.get(`thread_${title}`);
  const dataz2 = data.get(`desc_${title}`);
  const dataz4 = data.get(`dc_${title}`);
  const dataz5 = data.get(`title_${title}`);
  const dataz6 = data.get(`sira_${title}`);
  if (dataz == 'yes') {
    res.render('thread', {
      title: title,
      titles: dataz5,
      desc: dataz2,
      discord: dataz4,
      length: dataq.length,
      sira: dataz6,
      member: req.user,
      admins: admins
    });
  } else {
    res.render('404', { 
      error_msg: 'Böyle bir sayfa bulunamadı.',
      member: req.user,
      admins: admins
    });
  }
});

app.use(function(req, res, next) {
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', { 
      error_msg: "Böyle bir sayfa bulunamadı.", 
      member: req.user,
      admins: admins
    });
    return;
  }
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }
  res.type('txt').send('Not found');
});