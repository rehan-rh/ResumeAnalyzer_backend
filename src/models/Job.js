const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  company: { type: String, required: true }, 
  location: { type: String, required: true }, 
  skillsRequired: [String],
  industry: { type: String, required: true }, 
  link: { type: String, required: true },   createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
