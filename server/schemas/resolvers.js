const { User, Book } = require('../models');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      console.log(context);
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
      if (context.user) {
        await Book.create({
          authors,
          description,
          title,
          bookId,
          image,
          link,
        });

        const user = await User.findOne(
          { _id: context.user._id }
        );

        return user;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        await Book.deleteOne({
          bookId
        });

        const user = await User.findOne(
          { _id: context.user._id }
        );

        return user;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
