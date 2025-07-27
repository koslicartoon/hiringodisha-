const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const DB_URI = process.env.MONGODB_URI;
mongoose.connect(DB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));


// Job Schema and Model
const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  qualification: String,
  experience: String,
  vacancies: { type: Number, required: true },
  age: String,
  salary: String,
  employerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  emailAddress: String,
  telephoneNumber: String,
  websiteName: String,
  locationLink: String,
  district: { type: String, required: true },
  address: { type: String, required: true },
  jobDescription: String,
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Niyukti Odisha Job Posting API!');
});

// Add a new job post
app.post('/jobs', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ message: 'Job Posted successfully!', job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Get jobs by district
app.get('/jobs', async (req, res) => {
  const { district } = req.query;
  const query = district ? { district } : {};
  const jobs = await Job.find(query);  // Fetch jobs based on the query
  
  res.json(jobs);  // Send the jobs as a response
});

// Get job statistics by district along with the total count
app.get('/district-stats', async (req, res) => {
  try {
    const jobs = await Job.find({});
    
    // List of all districts
    const districts = [
      'Anugul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 
      'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 
      'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapada', 'Kendujhar', 'Khordha', 
      'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 
      'Puri', 'Rayagada', 'Sambalpur', 'Sonepur', 'Sundargarh'
    ];

    // Count jobs by district
    const districtCounts = districts.reduce((acc, district) => {
      acc[district] = jobs.filter(job => job.district === district).length;
      return acc;
    }, {});

    // Total number of jobs
    const totalJobs = jobs.length;

    res.json({ districtCounts, totalJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Delete a job post by ID with postID confirmation
app.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params; // Job ID from the route
    const { postID } = req.body; // Post ID provided by the user for confirmation

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job._id.toString() !== postID) {
      return res.status(400).json({ error: 'Post ID does not match the Job ID' });
    }

    await Job.findByIdAndDelete(id);
    res.json({ message: 'Job deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update a job post by ID
app.put('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ message: 'Job updated successfully!', updatedJob });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(5000, () => {
    console.log('Server running at http://localhost:5000');
});
