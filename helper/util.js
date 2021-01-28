const isLoggedin = (req, res, next) => {
    if (!req.session.user) {
      res.redirect('/signin')
    } else {
      next();
    }
    res.redirect('/')
  }
 module.exports = { isLoggedin }  