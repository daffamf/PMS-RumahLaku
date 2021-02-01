const isLoggedin = (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/signin')
    }
    // res.redirect('/')
  }
 module.exports = { isLoggedin }  