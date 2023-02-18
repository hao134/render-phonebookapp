require("dotenv").config();
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express();

const Phonebook = require('./models/phonebook');

morgan.token("data", (request, response) => {
    return request.method === "POST" ? JSON.stringify(request.body) : " ";
});

const morganrequest = morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.data(req, res)
    ].join(' ')
  })

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
  
app.use(morganrequest)
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

let persons = [
]


app.get('/api/persons', (request, response) => {
    Phonebook.find({}).then(people => {
        response.json(people)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Phonebook.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.number || !body.name) {
        return response.status(400).json({
            error: 'need name or number'
        })
    }

    const person = new Phonebook({
        name: body.name,
        number: body.number,
    })
    
    person
      .save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
      .catch((error)=>next(error));
})

app.delete('/api/persons/:id', (request, response, next)=>{
    Phonebook.findByIdAndRemove(request.params.id)
       .then(result => {
        response.status(204).end()
       })
       .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Phonebook.findByIdAndUpdate(
      request.params.id, 
      { name, number }, 
      { new: true, runValidators: true, context: 'query' }
    )
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
})



app.get('/info', (request, response, next) => {
    Phonebook.find({})
        .then(people => {
            response.send(
                `<p> Phone book has info for ${people.length} people </p>
                <p>${new Date()}</p>` 
            );
        })
        .catch(error => next(error))
});

app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})