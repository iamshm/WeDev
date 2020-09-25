# WeDev

1. First install all the packages, set up MongoDB and the environment.
2. Configure scripts to run server using nodemon
3. Create routes using express-router
4. Folder 'routes' has all routes
5. Create 'User' model using mongoose and mongoDB Schema
6. Use the User model in user route and register new User
7. For registerising User we have to check if user already exists
8. if new user we will encrypt password using bcrypt and then save it to mongoDB
9. Then provide a token to the user(It can be a new user or existing user)
   a. We will then use user-id to provide token \
   b. To create a token which can be then send to a authorized route, we have to create it usinq `jwt.sign()` we will send
   `user.id` as payload \
   c. Then we use that token for our middleware(in middleware we are just decrypting the token and assigning `req.user` to \
    the user in database) which will provide access to authorized routes \
10. After using that token for our middleware we can use the middleware as a 2nd Parameter to our auth-route, \
    which will make the auth route a procted/authorized route.
11. Then that route can display all user data.
