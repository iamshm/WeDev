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
	[auth,
		[check('text', 'Text is Required').not().isEmpty()]
	],
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

// @route  PUT api/posts/like/:post_id
// @desc  like a post
// @access Private
router.put('/like/:id',
	auth,
	async (req, res) => {
		try {
			const post = await Post.findById(req.params.id);

			//check if this post is already liked
			if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
				return res.status(400).json({ msg: 'Post already liked' });
			}
			post.likes.unshift({ user: req.user.id });
			await post.save();

			return res.json(post.likes);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	});

// @route  PUT api/posts/unlike/:post_id
// @desc  like a post
// @access Private
router.put('/unlike/:id',
	auth,
	async (req, res) => {
		try {
			const post = await Post.findById(req.params.id);

			//check if this post is already liked
			if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
				return res.status(400).json({ msg: 'Post not liked yet' });
			}

			// remove index
			const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

			post.likes.splice(removeIndex, 1);
			await post.save();

			return res.json(post.likes);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	});

// @route  POST api/posts/comment/:post_id
// @desc  Post a comment
// @access Private
router.post(
	'/comment/:id',
	[auth,
		[check('text', 'Text is Required').not().isEmpty()]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}
		const user = await User.findById(req.user.id).select('-password');
		const post = await Post.findById(req.params.id);

		try {
			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};
			post.comments.unshift(newComment);

			await post.save();
			return res.json(post);
		} catch (err) {
			console.log(err.message);
			return res.status(500).send('Server Error');

		}
	}
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc  Delete a comment
// @access Private
router.delete('/comment/:id/:comment_id',
	auth,
	async (req, res) => {
		try {
			const post = await Post.findById(req.params.id);

			// pull comment from post
			const comment = post.comments.find(comment => comment.id === req.params.comment_id);
			if (!comment) {
				return res.status(404).json({ msg: 'Comment doesn\'t exist' });
			}

			//check user is valid
			if (comment.user.toString() !== req.user.id) {
				return res.status(401).json({ msg: 'Unauthorized user' });
			}

			// remove index
			const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

			post.comments.splice(removeIndex, 1);
			await post.save();

			return res.status(200).json(post.comments);

		} catch (err) {
			console.error(err.message);
			return res.status(500).send('Server Error');
		}
	}
);



module.exports = router;
