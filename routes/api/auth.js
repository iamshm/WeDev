const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bycrpt = require('bcryptjs');

// @route  GET api/auth
// @desc   Auth route (Resgistration middleware)
// @access Protected
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.log(err.message);
		res.status(500);
	}
});

// @route  POST api/auth
// @desc   Authenticate User and get token(Login middleaware)
// @access Public
router.post(
	'/',
	[
		check('email', 'Not a valid Email').isEmail(),
		check('password', 'Password is Required').exists(),
	],
	async (req, res) => {
		//checking errors in body
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			//Check if user exists
			let user = await User.findOne({ email: email });
			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] });
			}
			//checking if password is correct
			const isMatch = await bycrpt.compare(password, user.password);
			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] });
			}
			//Return JWT token
			const payload = {
				user: {
					id: user.id,
				},
			};
			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);

			//res.send(`User Registered`);
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
