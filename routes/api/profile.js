const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult, body } = require('express-validator');
const request = require('request');
const config = require('config');

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate('user', ['name', 'avatar']);
		if (!profile) {
			res.status(400).send({ msg: 'User has No Profile' });
		}
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});
// dhbdbhc
// @route  POST api/profile
// @desc   Create or Update User Profile
// @access Private
router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is Required').not().isEmpty(),
			check('skills', 'Skills is Required').not().isEmpty(),
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
			youtube,
			facebook,
			linkedin,
			twitter,
			instagram,
		} = req.body;
		//Build Profile Object
		//We have to check which data is filled by user and which isnt
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (bio) profileFields.bio = bio;
		if (location) profileFields.location = location;
		if (status) profileFields.status = status;
		if (githubUserName) profileFields.githubUserName = githubUserName;
		if (skills) {
			profileFields.skills = skills
				.split(',')
				.map((skill) => skill.trim());
		}
		//Build Social fields as they are also objects
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (instagram) profileFields.social.instagram = instagram;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		try {
			let profile = await Profile.findOne({ user: req.user.id });
			if (profile) {
				//Update Profile
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.json(profile);
			}
			//New Profile
			profile = new Profile(profileFields);
			await profile.save();
			return res.json(profile);
		} catch (err) {
			console.log(err.message);
			return res.status(500).send('Server Error');
		}
	}
);

// @route  GET api/profile
// @desc   Get all Profile
// @access Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', [
			'name',
			'avatar',
		]);
		return res.json(profiles);
	} catch (err) {
		console.log(err.msg);
		res.status(500).send('Server error');
	}
});

// @route  GET api/profile/user/:user_id
// @desc   Get Profile by user id
// @access Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar']);
		if (!profile) {
			return res.status(500).json({ msg: 'Profile not found' });
		}
		return res.json(profile);
	} catch (err) {
		console.log(err.msg);
		if (err.kind == 'ObjectId')
			return res.status(500).json({ msg: 'Profile not found' });
		res.status(500).send('Server error');
	}
});

// @route  DELETE api/profile
// @desc   Delete profile,user and posts
// @access Private
router.delete('/', auth, async (req, res) => {
	try {
		// Removing Profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Removing User
		await User.findOneAndRemove({ _id: req.user.id });
		return res.json({ msg: 'User deleted' });
	} catch (err) {
		console.log(err.msg);
		if (err.kind == 'ObjectId')
			return res.status(500).json({ msg: 'Profile not found' });
		res.status(500).send('Server error');
	}
});

// @route  PUT api/profile/experience
// @desc    Add experience to profile
// @access Private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is Required').not().isEmpty(),
			check('company', 'Company is Required').not().isEmpty(),
			check('from', 'From Date is Required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errorsFromValidator = validationResult(req);
		if (!errorsFromValidator) {
			return res
				.status(400)
				.json({ errors: errorsFromValidator.array() });
		}
		const {
			company,
			title,
			location,
			from,
			to,
			current,
			description,
		} = req.body;
		const newExp = {
			company,
			title,
			location,
			from,
			to,
			current,
			description,
		};
		try {
			let profile = await Profile.findOne({ user: req.user.id });
			profile.experience.unshift(newExp);
			await profile.save();
			return res.status(200).json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500);
		}
	}
);

// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete experience from profile
// @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		let profile = await Profile.findOne({ user: req.user.id });
		const removeIndex = profile.experience
			.map((item) => item.id)
			.indexOf(req.params.exp_id);
		profile.experience.splice(removeIndex, 1);
		await profile.save();
		res.status(200).json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route  PUT api/profile/education
// @desc    Add education to profile
// @access Private
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is Required').not().isEmpty(),
			check('degree', 'Degree is Required').not().isEmpty(),
			check('fieldOfStudy', 'Field of Study is Required').not().isEmpty(),
			check('from', 'From Date is Required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errorsFromValidator = validationResult(req);
		if (!errorsFromValidator) {
			return res
				.status(400)
				.json({ errors: errorsFromValidator.array() });
		}
		const {
			school,
			degree,
			fieldOfStudy,
			from,
			to,
			current,
			description,
		} = req.body;
		const newEdu = {
			school,
			degree,
			fieldOfStudy,
			from,
			to,
			current,
			description,
		};
		try {
			let profile = await Profile.findOne({ user: req.user.id });
			profile.education.unshift(newEdu);
			await profile.save();
			return res.status(200).json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500);
		}
	}
);

// @route  DELETE api/profile/education/:edu_id
// @desc   Deletd education from profile
// @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		let profile = await Profile.findOne({ user: req.user.id });
		const removeIndex = profile.education
			.map((item) => item.id)
			.indexOf(req.params.edu_id);
		profile.experience.splice(removeIndex, 1);
		await profile.save();
		res.status(200).json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route  GET api/profile//github/:username
// @desc   Get reposiritories from Github
// @access Public
router.get('/github/:username', async (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				'githubClientId'
			)}&client_secret=${config.get('githubClientSecret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' },
		};
		request(options, (error, response, body) => {
			if (error) {
				return console.error(error.message);
			}
			if (response.statusCode !== 200)
				return res.status(404).json({
					msg: 'No Github Profile Found with this username',
				});
			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
