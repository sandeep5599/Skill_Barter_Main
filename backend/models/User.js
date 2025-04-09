const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  country: { type: String, required: false }, // Optional for existing users
  securityQuestions: [{
    question: { type: String, required: false },
    answer: { type: String, required: false } // Will store hashed answers
  }],
  resetPasswordToken: { type: String },
  resetPasswordVerified: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Hash security question answers before saving
userSchema.methods.setSecurityQuestions = async function(questions) {
  const securityQuestions = [];
  
  for (const q of questions) {
    const hashedAnswer = await bcrypt.hash(q.answer, 10);
    securityQuestions.push({
      question: q.question,
      answer: hashedAnswer
    });
  }
  
  this.securityQuestions = securityQuestions;
  return this;
};

// Verify a security answer
userSchema.methods.verifySecurityAnswer = async function(questionIndex, answer) {
  if (!this.securityQuestions || !this.securityQuestions[questionIndex]) {
    return false;
  }
  
  return bcrypt.compare(answer, this.securityQuestions[questionIndex].answer);
};

// Add this to your User model file
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;