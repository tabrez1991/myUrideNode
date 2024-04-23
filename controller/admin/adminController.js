const userModel = require('../../models/users.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');
const verifyToken = require("../../middleware/authentication.js");
const multer = require('multer');
const path = require('path');

const ACTIVE = 'ACTIVE';
const INACTIVE = 'INACTIVE';

const isSuperAdmin = (req, res, next) => {
  const userRole = req.user.roles;
  if (!userRole.includes('super_admin')) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  const userRole = req.user.roles;
  if (!userRole.includes('admin')) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  next();
};

// Middleware function to check if user has user role
const isUser = (req, res, next) => {
  const userRole = req.user.roles;
  if (!userRole.includes('user')) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  next();
};

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('file', file.fieldname);
    if (file.fieldname === 'profile_picture') {
      cb(null, 'profileUploads/');

    }
  },
  filename: function (req, file, cb) {
    if (file.fieldname === 'profile_picture') {
      console.log('file', file.originalname);
      cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }

  }


});

const uploadImg1 = multer({
  storage: storage1,
}).fields(
  [{
    name: 'profile_picture',
    maxCount: 1
  }])

module.exports = {
  verifyToken,
  uploadImg1,
  isAdmin,
  isUser,
  isSuperAdmin,
  create: async function (req, res) {
    try {
      const { email, password, mobile, name, middleName, lastName, roles, status } = req.body;

      const existingUser = await userModel.findOne({ $or: [{ email: email }, { mobile: mobile }] });

      if (existingUser) {
        return res.status(400).send('User already exists');
      }

      const newUser = new userModel({
        email: email,
        username: email.split('@')[0],
        password: await hashPassword(password),
        mobile: mobile,
        name: name,
        email_verified: 0,
        profile_picture: "",
        roles: roles,
        status: status,
        jwttoken: "",
        refreshToken: "",
        last_login: "",
        creation_date: new Date(),
        updated_date: new Date(),
        lastName: lastName,
        middleName: middleName,
      });
      const createdUser = await newUser.save();

      const sanitized = createdUser.toObject();
      delete sanitized.password;

      return res.status(201).json(sanitized);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  },

  login: async function (req, res) {
    try {
      const { email, password } = req.body;

      const user = await findByLogin(email, password);

      const payload = {
        email: user.email,
        name: user.name,
        roles: user.roles,
        status: user.status,
      };

      const token = await signPayload(payload);

      const updateUserDetails = await updateToken({
        email: user.email,
        token: token,
      });

      res.status(HttpStatus.OK).json(updateUserDetails);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  },

  resetPassword: async function (req, res) {
    try {
      const { email, password } = req.body;
      let user = await userModel.findOne({
        email,
        status: ACTIVE,
      });

      if (!user) {
        throw new Error('User does not exist');
      }

      const hashed = await bcrypt.hash(password, 10);

      const updatePassword = await userModel.updateOne(
        { _id: user._id },
        { jwttoken: null, refreshToken: null, password: hashed },
      );
      if (updatePassword?.acknowledged) {
        user = await userModel.findOne({ email });
      }

      res.status(HttpStatus.OK).json(sanitizeUser(user));
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  },

  getUserById: async function (req, res) {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id).exec();
      if (!user) {
        return res.status(HttpStatus.CONFLICT).json({ message: 'User not found' });
        // Add return statement to exit the function after sending response
      }
      res.status(HttpStatus.OK).json(sanitizeUser(user));
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  },

  getUsers: async function (req, res) {
    try {
      const { page = 1, limit = 10, searchQuery } = req.query;

      const skip = (page - 1) * limit;

      // Build the base query
      const query = userModel.find();

      // Apply search filter if provided
      if (searchQuery) {
        console.log(searchQuery)
        query.or([
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { middleName: { $regex: new RegExp(searchQuery, 'i') } },
          { lastName: { $regex: new RegExp(searchQuery, 'i') } },
          { email: { $regex: new RegExp(searchQuery, 'i') } },
          { mobile: { $regex: new RegExp(searchQuery, 'i') } },
        ]);
      }

      // Apply pagination
      const users = await query.skip(skip).limit(limit).exec();

      // Modify each user object
      const sanitizedUsers = users.map((user) => {
        const tempUser = user.toObject();
        delete tempUser['password'];
        return tempUser;
      });

      // Send response with the modified array of users
      res.status(HttpStatus.OK).json(sanitizedUsers);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  },

  addUser: async function (req, res) {
    const { email, name, middleName, lastName, mobile, password, roles } = req.body;

    try {
      let user = await userModel.findOne({ email });

      if (user) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'User already exists' });
        return; // Exit early if user already exists
      }

      // Extract the profile picture file from the request
      let profilePicture;
      if (req.files.profile_picture) {
        profilePicture = req.files.profile_picture[0].destination + req.files.profile_picture[0].filename
      } else {
        profilePicture = '';
      }

      const addUserDetails = new userModel({
        email: email,
        username: email.split('@')[0],
        password: await hashPassword(password),
        mobile: mobile,
        name: name,
        email_verified: 0,
        profile_picture: profilePicture, // Set the profile picture path in the database
        roles: roles,
        status: ACTIVE,
        jwttoken: "",
        refreshToken: "",
        last_login: "",
        creation_date: new Date(),
        updated_date: new Date(),
        lastName: lastName,
        middleName: middleName,
      });

      await addUserDetails.save();
      res.status(HttpStatus.OK).json(sanitizeUser(addUserDetails));
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  },

  updateUser: async function (req, res) {
    try {

      const { email, name, middleName, lastName, mobile, password, roles } =
        req.body;
      let user = await userModel.findOne({ email });
      if (!user) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'User doesnt exists' });
        return; // Exit early if user already exists
      }

      let profilePicture;
      if (req.files.profile_picture) {
        profilePicture = req.files.profile_picture[0].destination + req.files.profile_picture[0].filename
      } else {
        profilePicture = '';
      }

      const updateUserDetails = await userModel.updateOne(
        { _id: user._id },
        {
          name: name,
          middleName: middleName,
          lastName: lastName,
          mobile: mobile,
          profile_picture: profilePicture,
          roles: roles,
          password: await hashPassword(password),
        },
      );
      if (updateUserDetails) {
        user = await userModel.findOne({ email });
      }
      res.status(HttpStatus.OK).json(sanitizeUser(user));
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  },

  deleteUser: async function (req, res) {
    try {
      const { email } = req.body;
      let user = await userModel.findOne({ email });
      if (!user) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'User doesnt exists' });
        return; // Exit early if user already exists
      }

      const updateUserDetails = await userModel.updateOne(
        { _id: user._id },
        {
          status: INACTIVE,
          jwttoken: null,
          refreshToken: null,
        },
      );
      if (updateUserDetails) {
        user = await userModel.findOne({ email });
      }
      res.status(HttpStatus.OK).json(sanitizeUser(user));
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  },

  activateUser: async function (req, res) {
    try {
      const { email } = req.body;
      let user = await userModel.findOne({ email });
      if (!user) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'User doesnt exists' });
        return; // Exit early if user already exists
      }

      const updateUserDetails = await userModel.updateOne(
        { _id: user._id },
        {
          status: ACTIVE,
          jwttoken: null,
          refreshToken: null,
        },
      );
      if (updateUserDetails) {
        user = await userModel.findOne({ email });
      }
      res.status(HttpStatus.OK).json(sanitizeUser(user));
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  },

  logoutUser: async function (req, res) {
    try {
      const { email } = req.body;
      let user = await userModel.findOne({ email });
      if (!user) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'User doesnt exists' });
        return; // Exit early if user already exists
      }

      const updateUserDetails = await userModel.updateOne(
        { _id: user._id },
        {
          jwttoken: null,
          refreshToken: null,
        },
      );
      if (updateUserDetails) {
        user = await userModel.findOne({ email });
      }
      res.status(HttpStatus.OK).json(sanitizeUser(user));
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
};

async function findByLogin(email, password) {
  const user = await userModel.findOne({ email, status: ACTIVE });
  if (!user) {
    throw new Error('User does not exist');
  }
  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  return user;
}

async function signPayload(payload) {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 86400 });
}

async function updateToken(TokenUpdateDTO) {
  const { email, token } = TokenUpdateDTO;
  let user = await userModel.findOne({ email, status: ACTIVE });
  if (!user) {
    throw new Error('User does not exist');
  }
  const updateTokenDetails = await userModel.updateOne(
    { _id: user._id },
    { jwttoken: token, refreshToken: token, last_login: Date.now() }
  );
  if (updateTokenDetails) {
    user = await userModel.findOne({ email });
  }
  return user;
}

async function hashPassword(password) {
  try {
    const saltRounds = 10; // Number of salt rounds to use (recommended: 10)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Password hashing failed');
  }
}

function sanitizeUser(user) {
  const sanitized = user.toObject();
  delete sanitized['password'];
  return sanitized;
}