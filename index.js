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

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.number || !body.name) {
        return response.status(400).json({
            error: 'need name or number'
        })
    }
    
    // const existPerson = persons.find((person)=> person.name === body.name)
    // if (existPerson){
    //     return response.status(400).json({
    //         error: 'the name already existed'
    //     })
    // }
    const person = new Phonebook({
        name: body.name,
        number: body.number,
    })
    
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

// app.delete('/api/persons/:id', (request, response)=>{
//     const id = Number(request.params.id)
//     persons = persons.filter(person => person.id !== id)

//     response.status(204).end()
// })





// app.get('/info', (request, response) => {
//     response.send(
//         `<p>Phone book has info for ${persons.length} people </p>
//         <p>${new Date()}</p>`
//     );
// })


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})