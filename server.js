const { execSync } = require('node:child_process')
const { PrismaClient } = require('@prisma/client')
const express = require('express')
const bodyParser = require('body-parser')

// set up express web server
const app = express()

// open database
const prisma = new PrismaClient();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// set up static content
app.use(express.static('public'))

app.get('/locations', async (req, res) => {
  const locations = await prisma.location.findMany();
  res.json(locations);
})

app.post('/locations', async (req, res) => {
  const body = req.body;

  const latitude = parseFloat(body.latitude);
  const longitude = parseFloat(body.longitude);

  const location = await prisma.location.create({
    data: {
      point_name: body.point_name,
      description: body.description,
      latitude: latitude,
      longitude: longitude,
    }
  });
  res.json(location);
})

// run migrations
if (process.env.NODE_ENV === 'production') {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}

// Start web server on port 3000
app.listen(3000, () => {
  console.log('Server is listening on port 3000')
})
