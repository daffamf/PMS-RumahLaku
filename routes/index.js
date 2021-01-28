var express = require('express');
var {isLoggedin} = require('../helper/util.js')
var router = express.Router();


/* GET home page. */
module.exports = function (pool) {

  router.get('/', function (req, res, next) {
    res.status(200).render('index', {
      user: req.session.user,
      isLogin: req.session.loggedIn
    })
  });

  router.get('/kategori=sewa', function (req, res, next) {
    res.status(200).render('sewa', {
      user: req.session.user,
      isLogin: req.session.loggedIn
    })
  });
  router.get('/kategori=jual', function (req, res, next) {
    res.status(200).render('jual', {
      user: req.session.user,
      isLogin: req.session.loggedIn
    })
  });

  router.get('/detail', function (req, res, next) {
    res.render('detail', {
      user: req.session.user,
      isLogin: req.session.loggedIn,
      title: 'Express',
    });
  });

  router.get('/compare', function (req, res, next) {
    res.render('compare', {
      user: req.session.user,
      isLogin: req.session.loggedIn,
      title: 'Compare Pages'
    })
  })

  router.get('/signup', function (req, res, next) {
    res.render('signup', {
      title: 'Express',
      user: req.session.user,
      isLogin: req.session.loggedIn
    });
  });

  router.get('/signin', function (req, res, next) {
    res.render('signin', {
      title: 'Express',
      user: req.session.user,
      isLogin: req.session.loggedIn
    });
  });

  router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
      res.redirect('/')
    })
  })

  router.get('/upload',isLoggedin, (req, res) => {
    res.render('upload', {
      title: 'Tambah Iklan',
      user: req.session.user,
      isLogin: req.session.loggedIn
    });
  });
  router.get('/iklan?id', (req, res) => {
    res.render('index', {
      title: 'Tambah Iklan',
      user: req.session.user,
      isLogin: req.session.loggedIn
    });
  });
  return router
}
