import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import phonebookServices from './services/phonebooks'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newPerson, setNewPerson] = useState({ name: "", number: "" })
  const [filter, setFilter] = useState('')
  const [personsToShow, setPersonsToShow] = useState([]);
  const [message, setMessage] = useState(null)

  useEffect(() => {
    phonebookServices
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
        setPersonsToShow(initialPersons)
      })
  }, [])
  console.log('render', persons.length, 'persons')

  const addPerson = (event) => {
    event.preventDefault()
    const currentName = persons.filter((person) => person.name === newPerson.name)
    const personObject = {
      name: newPerson.name,
      number: newPerson.number,
      date: new Date().toISOString(),
      id: newPerson.name
    };
    if (currentName.length === 0) {
      phonebookServices
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setPersonsToShow(persons.concat(returnedPerson))
          setMessage(
            `Added ${personObject.name}`
          )
          setTimeout(() => {
            setMessage(null)
          }, 3000)
        })
        .catch(error => {
          setMessage(error.response.data.error)
          setTimeout(() => {
            setMessage(null)
          }, 3000)
        })
      
    } else {
      if (window.confirm(`${currentName[0].name} is already added to phonebook, replace the old number with a new one?`)) {
        phonebookServices
          .update(currentName[0].id, personObject)
          .then((returnedPerson) => {
            const updatedPersons = persons.map(person => 
              person.id !== returnedPerson.id ? person : returnedPerson
            )
            setPersons(updatedPersons)
            setPersonsToShow(updatedPersons)
          })
          .catch(error => {
            setMessage(error.response.data.error)
            setTimeout(()=>{
              setMessage(null)
            }, 3000)
          })
      }
    }
    setNewPerson({ name: "", number: "" })
  }

  const handleChange = (event) => {
    // form's name and value
    const { name, value } = event.target;
    // form of newPerson: {name: '', number: ''}
    // when [name] is name is "a" -> add {name: "a"}
    // when [name] is number is "1" -> add {number: "1"}
    setNewPerson({ ...newPerson, [name]: value });
    // see how it works
    console.log(newPerson)
  }

  const filterByName = (event) => {
    const search = event.target.value;
    setFilter(search);
    setPersonsToShow(
      persons.filter((person) => person.name.toLowerCase().includes(search))
    )
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      phonebookServices
        .remove(id)
        .then((response) => {
          const updatedPersons = persons.filter((person) => person.id !== id);
          setPersons(updatedPersons);
          setPersonsToShow(updatedPersons);
        });
    }
  };

  const Notification = ({ message }) => {
    if (message === null) {
      return null
    }

    return (
      <div className='error'>
        {message}
      </div>
    )
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <Filter value={filter} filterByName={filterByName} />
      <h2>add a new</h2>
      <PersonForm
        addPerson={addPerson}
        newPerson={newPerson}
        handleChange={handleChange}
      />
      <h2>Numbers</h2>
      <Persons personsToShow={personsToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App