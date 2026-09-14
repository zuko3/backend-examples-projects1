const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_KEY = "secrete";
const admin = require("../models/admin");
const mongoose = require("mongoose");
const users = require("../models/users");

exports.doLogin = (req, res, next) => {
  admin
    .find({ email: req.body.email })
    .exec()
    .then(result => {
      if (result.length == 0) {
        return res.status(401).json({
          message: "Unauthorized user"
        });
      }
      bcrypt.compare(
        req.body.password,
        result[0].password,
        (err, success) => {
          if (err) {
            return res.status(401).json({
              message: "Unauthorized user"
            });
          }
          if (success) {
            const token = jwt.sign(
              {
                email: result[0].email,
                userId: result[0]._id
              },
              JWT_KEY,
              { expiresIn: "1h" }
            );

            res.status(200).json({
              message: "Authentication Successfull",
              token,
              name: result[0].name,
              id: result[0]._id,
              email: result[0].email
            });
          } else {
            res.status(401).json({
              message: "Unauthorized user"
            });
          }
        }
      );
    })
    .catch(error => {
      res.status(500).json(error);
    });
};

exports.updateAdmin = (req, res, next) => {
  const { id, name, password, email } = req.body;
  admin.find({ _id: id }).exec().then(([adminuser]) => {
    if (!adminuser) {
      return res.status(404).json({
        message: "user not found"
      });
    }
    if (name.trim() !== "") {
      adminuser.name = name;
    }
    if (password.trim() !== "") {
      adminuser.password = bcrypt.hashSync(password, 10);
    }
    if (email.trim() !== "") {
      adminuser.email = email;
    }
    adminuser.save();
    return res.status(200).json({
      message: "admin profile succesfully updated",
      adminInfo: {
        name, email
      }
    });
  }).catch(err => {
    return res.status(500).json({
      message: "Internal server error"
    });
  })
}



exports.doUserLogin = (req, res, next) => {
  users
    .find({ email: req.body.email })
    .exec()
    .then(([result]) => {
      if (!result) {
        return res.status(401).json({
          message: "Unauthorized user"
        });
      }
      bcrypt.compare(
        req.body.password,
        result.password,
        (err, success) => {
          if (err) {
            return res.status(401).json({
              message: "Unauthorized user"
            });
          }
          if (success) {
            const token = jwt.sign(
              {
                email: result.email,
                userId: result._id
              },
              JWT_KEY,
              { expiresIn: "1h" }
            );

            res.status(200).json({
              message: "Authentication Successfull",
              token,
              name: result.name,
              id: result._id,
              email: result.email,
              tags: result.tags
            });
          } else {
            res.status(401).json({
              message: "Unauthorized user"
            });
          }
        }
      );
    })
    .catch(error => {
      res.status(500).json(error);
    });
};


exports.createUser = (req, res, next) => {
  users.find({ email: req.body.email }).exec()
    .then(userres => {
      if (userres.length > 0) {
        return res.status(422).json({
          message: "User Email already exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
              message: "Internal server error"
            });
          } else {
            const userobj = new users({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              name: req.body.name,
              tags: req.body.tags
            });

            userobj
              .save()
              .then(result => {
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(error => {
                res.status(500).json({
                  error: error,
                  message: 'internal server error'
                });
              });
          }
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        error: error,
        message: 'internal server error'
      });
    });
};

exports.deleteUser = (req, res, next) => {
  const idsToDelete = req.body.id;
  users.remove({ _id: idsToDelete }, function (err) {
    if (err !== null) {
      console.log(err);
      return res.status(500).json(error)
    }
    return res.status(200).json({ message: 'user succesfully deleted' })
  });
}


exports.updateUser = (req, res, next) => {
  const { id, name, tags, password, email } = req.body;
  if (password.trim() === "") {
    users.find({ _id: id }).exec().then(([user]) => {
      if (!user) {
        return res.status(404).json({
          message: "user not found"
        });
      }
      if (user.email === email) {
        user.name = name;
        user.tags = tags;
        user.save();
        return res.status(200).json({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            tags: user.tags
          },
          message: "profile successfully updated"
        });
      } else {
        users.find({ email: email }).exec().then(([existinguser]) => {
          if (existinguser) {
            return res.status(500).json({
              message: "A user with same email id exists"
            });
          }
          user.name = name;
          user.tags = tags;
          user.email = email;
          user.save();
          return res.status(200).json({
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              tags: user.tags
            },
            message: "profile successfully updated"
          });
        }).catch(err => {
          res.status(500).json({
            error: error,
            message: 'internal server error'
          });
        })
      }
    }).catch(err => {
      res.status(500).json({
        error: error,
        message: 'internal server error'
      });
    })
  } else {
    users.find({ _id: id }).exec().then(([user]) => {
      if (!user) {
        return res.status(404).json({
          message: "user not found"
        });
      }
      if (user.email === email) {
        user.name = name;
        user.tags = tags;
        user.password = bcrypt.hashSync(password, 10);
        user.save();
        return res.status(200).json({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            tags: user.tags
          },
          message: "profile successfully updated"
        });
      } else {
        users.find({ email: email }).exec().then(([existinguser]) => {
          if (existinguser) {
            return res.status(500).json({
              message: "A user with same email id exists"
            });
          }
          user.name = name;
          user.tags = tags;
          user.email = email;
          user.password = bcrypt.hashSync(password, 10);
          user.save();
          return res.status(200).json({
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              tags: user.tags
            },
            message: "profile successfully updated"
          });
        }).catch(err => {
          res.status(500).json({
            error: error,
            message: 'internal server error'
          });
        })
      }
    }).catch(err => {
      res.status(500).json({
        error: error,
        message: 'internal server error'
      });
    });
  }
}


exports.getAllUsers = function (req, res, next) {
  users.find().then(users => res.status(200).json({ users })).catch(error => res.status(500).json(error));
}