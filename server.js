const { execSync } = require('node:child_process')
const { PrismaClient } = require('@prisma/client')
const express = require('express')
const fs = require('node:fs')

// set up express web server
const app = express()

// open database
const prisma = new PrismaClient();

// set up static content
app.use(express.static('public'))

app.get('/locations', async (req, res) => {
  const locations = await prisma.location.findMany();
  res.json(locations);
})

// run migrations
if (process.env.NODE_ENV === 'production') {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}

// Start web server on port 3000
app.listen(3000, () => {
  console.log('Server is listening on port 3000')
})
