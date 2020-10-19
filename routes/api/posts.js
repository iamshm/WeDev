const express = require('express');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Post = require('../../models/Post');
const router = express.Router();

// @route  POST api/posts
// @desc  Create a Post
// @access Private
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
			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});
			const post = await newPost.save();
			return res.json(post);
		} catch (err) {
			console.log(err.message);
			return res.status(500).send('Server Error');
		}
	}
);

// @route  GET api/posts
// @desc  Get all Posts
// @access Private
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.json(posts);
	} catch (err) {
		console.log(err.message);
		return res.status(500).send('Server Error');
	}
});

// @route  GET api/posts/:post_id
// @desc  Get post by id
// @access Private
router.get('/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);
		if (!post) {
			return res.status(400).json({ msg: 'Post not found' });
		}
		res.json(post);
	} catch (err) {
		console.log(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(400).json({ msg: 'Post not found' });
		}
		return res.status(500).send('Server Error');
	}
});

// @route  DELETE api/posts/:post_id
// @desc  Delete post
// @access Private
router.delete('/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);
		if (!post) {
			return res.status(400).json({ msg: 'Post not found' });
		}
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not Authorized' });
		} else {
			await post.remove();
			return res.json({ msg: 'Post deleted' });
		}
	} catch (err) {
		console.log(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(400).json({ msg: 'Post not found' });
		}
		return res.status(500).send('Server Error');
	}
});
module.exports = router;
