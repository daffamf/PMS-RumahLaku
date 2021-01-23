var express = require('express');
var router = express.Router();
const Swal = require('sweetalert2');
var session = require('express-session');
var moment = require('moment');

/* GET home page. */
const isLoggedin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/signin')
  }else{
    next();
  }
  // res.redirect('/')
}


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
      title: 'Express',
    });
  });
  return router
}
router.get('/compare',isLoggedin, function (req, res, next) {
  res.render('compare', {
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
    // user: req.session.user,
    // isLogin: req.session.loggedIn
  });
});

router.get('/logout', function (req, res, next) {
  req.session.destroy(function(err) {
    res.redirect('/signin')
  })
})
// router.get('/add_iklan', isLoggedin, (req, res) => {
//   res.render('add_iklan', {
//     title: 'Tambah Iklan',
//     user: req.session.user,
//     isLogin: req.session.loggedIn
//   });
// });

// router.get('/profil', isLoggedin, function (req, res, next) {
//   res.render('profil', {
//     title: 'Profil',
//     user: req.session.user,
//     isLogin: req.session.loggedIn

//   });
// });

// router.get('/details/:id', function (req, res, next) {
//   const id = req.params.id
//   res.render('detail', {
//     title: 'Properties Details',
//     user: req.session.user,
//     isLogin: req.session.loggedIn,
//     id: id
//   })
// })

// return router
