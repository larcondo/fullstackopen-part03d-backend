require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')
const app = express()

// Middleware
const requestLogger = (req, res, next) => {
  console.log('Method: ', req.method);
  console.log('Path:   ', req.path);
  console.log('Body:   ', req.body);
  console.log('---');
  next()
}

// Middleware
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())
// app.use(requestLogger)
app.use(cors())
app.use(express.static('dist'))

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (req, res) => {
  Note.find({}).then( notes => {
    res.json(notes)
  })
})

app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id)
  .then( note => {
    if (note) {
      res.json(note)
    } else {
      res.status(404).end()
    }
  })
  .catch( error => next(error))
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id ))
    : 0

  return maxId + 1
}

app.post('/api/notes', (req, res, next) => {
  const body = req.body
  
  if (body.content === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })
  
  note.save()
  .then( savedNote => {
    res.json(savedNote)
  })
  .catch( error => next(error))
})

app.put('/api/notes/:id', (req, res, next) => {
  const { content, important } = req.body
  
  Note.findByIdAndUpdate( 
    req.params.id, 
    { content, important }, 
    { new: true, runValidators: true, context: 'query' }
  )
  .then( updatedNote => {
    res.json(updatedNote)
  })
  .catch( error => next(error))
})

app.delete('/api/notes/:id', (req, res) => {
  Note.findByIdAndRemove(req.params.id)
  .then( result => {
    res.status(204).end()
  })
  .catch( error => next(error))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})