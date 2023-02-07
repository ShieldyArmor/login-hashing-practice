module.exports.home_get = (req, res) => {
    res.render('index');
}

module.exports.forgot_get = (req, res) => {
    res.render('forgot');
}

module.exports.logged_get = (req, res) => {
    res.render('logged');
}

module.exports.create_get = (req, res) => {
    res.render('create');
}

module.exports.reset_get = (req, res) => {
    res.render('reset');
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', "", {maxAge: 1});
    res.redirect("/")
}

