const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(400).send({ msg: "User has No Profile" });
      res.json(profile);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route  POST api/profile
// @desc   Create or Update User Profile
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is Required").not().isEmpty(),
      check("skills", "Skills is Required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errorsFromValidator = validationResult(req);
    if (!errorsFromValidator.isEmpty()) {
      res.status(400).json({
        errors: errorsFromValidator.array(),
      });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubUserName,
      experience,
      youtube,
      facebook,
      linkedin,
      twitter,
      instagram,
    } = req.body;
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (bio) profileFields.bio = bio;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (githubUserName) profileField.githubUserName = githubUserName;
  }
);
module.exports = router;
