const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

module.exports.user = {
  getUsers: async (req, res) => {
    const user = await User.find().populate('like');
    res.json(user);
  },

  login: async (req, res) => {
    try {
      const { login, password, mail } = req.body;
      const candidate = await User.findOne({ mail, login });

      if (!candidate) {
        return res.status(401).json("User not find");
      }

      const valid = await bcrypt.compare(password, candidate.password);

      if (!valid) {
        return res.status(401).json("password wrong");
      }
      const payload = {
        id: candidate._id,
      };
      const token = await jwt.sign(payload, process.env.SECRET_JWT, {
        expiresIn: "95h",
      });
      res.json({
        token,
        id: candidate._id,
      });
    } catch (error) {
      res.json({ error: e });
    }
  },

  registr: async (req, res) => {
    try {
      const { login, password, mail } = req.body;
      const hash = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_ROUNDS)
      );
      const user = await User.create({
        comment: req.body.comment,
        mail: req.body.mail,
        login: login,
        password: hash,
      });
      res.json(user);
    } catch (e) {
      res.json({ error: e });
    }
  },
  addAvatar: async (req, res) => {
    try {
      const file = req.files.file;
      let path = `public\\avatar\\${file.name}`;
      const user = await User.findByIdAndUpdate(req.params.id, {
        avatar: file.name,
      });

      if (fs.existsSync(path)) {
        return res.status(400).json("File already exist");
      }
      file.mv(path);
      res.json(user);
    } catch (e) {
      res.json(e);
    }
  },
  addLike: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.body.userId, {
        $addToSet: { like: req.body.dinerId },
      }).populate("like");
      res.json(user);
    } catch (e) {
      res.json(e);
    }
  },
};
