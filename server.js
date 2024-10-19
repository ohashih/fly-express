const { execSync } = require('node:child_process')
const { PrismaClient } = require('@prisma/client')
const express = require('express')
const bodyParser = require('body-parser')

// set up express web server
const app = express();

// open database
const prisma = new PrismaClient();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/api/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json(locations);
  } catch (error) {
    console.error('Error fetch locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

app.post('/api/locations', async (req, res) => {
  const body = req.body;

  const latitude = parseFloat(body.latitude);
  const longitude = parseFloat(body.longitude);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  try {
    const location = await prisma.location.create({
      data: {
        point_name: body.point_name,
        description: body.description,
        latitude: latitude,
        longitude: longitude,
      }
    });
    res.json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

app.delete('/api/locations/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid location id' });
  }
  try {
    const location = await prisma.location.delete({
      where: { id: id }
    });
    res.json(location);
  } catch (e) {
    console.error('Error delete location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

if (process.env.NODE_ENV === 'production') {
  // データベースのマイグレーションを実行
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error migrating database:', error);
    process.exit(1);
  }
  // 静的コンテンツを配信
  app.use(express.static('dist'));
}

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
})
