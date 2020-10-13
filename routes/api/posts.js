const express = require('express');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const router = express.Router();

// @route  POST api/posts
// @desc   Test route
// @access Public
router.post(
	'/',
	[auth, [check('text', 'Text is Required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}
		const user = await User.findById(req.user.id).select('-password');
		try {
			const newPost = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};
			const post = await newPost.save();
			return res.json(post);
		} catch (err) {
			console.log(err.message);
			return res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
