const { execSync } = require('node:child_process')
const { PrismaClient } = require('@prisma/client')
const express = require('express')
const fs = require('node:fs')

// set up express web server
const app = express()

// set up static content
app.use(express.static('public'))

// open database
const prisma = new PrismaClient();

// last known count
let count = 0

// Main page
app.get('/', async(_request, response) => {
  // Get current count (may return hull)
  const welcome = await prisma.welcome.findFirst()

  // Increment count, creating table row if necessary
  if (welcome) {
    count = welcome.count + 1
    await prisma.welcome.update({data: { count }, where: {id: welcome.id}})
  } else {
    count = 1
    await prisma.welcome.create({data: { count }})
  }

  // render HTML response
  try {
    const content = fs.readFileSync('views/index.tmpl', 'utf-8')
      .replace('@@COUNT@@', count.toString())
    response.set('Content-Type', 'text/html')
    response.send(content)
  } catch (error) {
    response.send()
  }
})

// run migrations
if (process.env.NODE_ENV === 'production') {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}

// Start web server on port 3000
app.listen(3000, () => {
  console.log('Server is listening on port 3000')
})
