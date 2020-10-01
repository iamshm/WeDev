const express = require('express');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
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
	}
);

module.exports = router;
