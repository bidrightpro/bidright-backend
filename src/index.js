// src/index.js

const express = require('express');
const {
  addContractor,
  findContractorByEmail
} = require('./users');

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Contractor signup route
app.post('/auth/signup-contractor', (req, res) => {
  const { email, password, businessName } = req.body;

  if (!email || !password || !businessName) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (findContractorByEmail(email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const contractorData = {
    email,
    password,
    businessName
  };

  const newContractor = addContractor(contractorData);

  res.status(201).json({
    message: 'Contractor signed up!',
    contractor: newContractor
  });
});

// Contractor login route
app.post('/auth/login-contractor', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const user = findContractorByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = `token-${user.id}`;

  res.json({
    message: 'Logged in successfully!',
    contractor: {
      id: user.id,
      email: user.email,
      businessName: user.businessName
    },
    token
  });
});

// Temporary in-memory jobs list
const jobs = [
  {
    id: 1,
    title: 'Exterior repaint – 2 story home',
    description: 'Full exterior repaint including fascia, soffits, trim, and doors.',
    category: 'Painting',
    budgetMin: 5000,
    budgetMax: 8000,
    location: 'Lahaina, HI',
    deadline: '2026-02-15'
  },
  {
    id: 2,
    title: 'Interior repaint – 3 bed condo',
    description: 'Walls and trim only, no ceilings. Tenant occupied.',
    category: 'Painting',
    budgetMin: 2500,
    budgetMax: 4000,
    location: 'Kihei, HI',
    deadline: '2026-02-10'
  }
];

// Get all jobs
app.get('/jobs', (req, res) => {
  res.json(jobs);
});

// Temporary in-memory bids storage
const bids = [];

// Place a bid on a job
app.post('/jobs/:id/bids', (req, res) => {
  const jobId = Number(req.params.id);
  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const { contractorId, amount, message } = req.body;

  if (!contractorId || !amount) {
    return res.status(400).json({ error: 'Missing contractorId or amount' });
  }

  const newBid = {
    id: Date.now(),
    jobId,
    contractorId,
    amount,
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  bids.push(newBid);

  res.status(201).json({
    message: 'Bid placed successfully!',
    bid: newBid
  });
});

// Get all bids for a specific contractor
app.get('/contractors/:id/bids', (req, res) => {
  const contractorId = req.params.id;

  const contractorBids = bids.filter(b => b.contractorId === contractorId);

  res.json(contractorBids);
});


// Get a single job by id
app.get('/jobs/:id', (req, res) => {
  const jobId = Number(req.params.id);
  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
