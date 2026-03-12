import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';

export const signupStudent = async (req, res) => {
  const { name, email, password, department, year, interests, interestedDomains } = req.body;

  if (!name || !email || !password || !department || !year) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already exists.' });

  const user = await User.create({
    name,
    email,
    password,
    department,
    year,
    interests: Array.isArray(interests) ? interests : [],
    interestedDomains: Array.isArray(interestedDomains) ? interestedDomains : [],
    role: 'student'
  });

  const token = signToken({ id: user._id, role: user.role });
  return res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      interests: user.interests,
      interestedDomains: user.interestedDomains,
      department: user.department,
      year: user.year
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

  const token = signToken({ id: user._id, role: user.role });
  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      interests: user.interests,
      interestedDomains: user.interestedDomains,
      department: user.department,
      year: user.year
    }
  });
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
