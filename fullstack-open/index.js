const { ApolloServer, UserInputError, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')

let persons = [
    {
        name: "Arto Hellas",
        phone: "040-123543",
        street: "Tapiolankatu 5 A",
        city: "Espoo",
        id: "3d594650-3436-11e9-bc57-8b80ba54c431"
    },
    {
        name: "Matti Luukkainen",
        phone: "040-432342",
        street: "Malminkaari 10 A",
        city: "Helsinki",
        id: '3d599470-3436-11e9-bc57-8b80ba54c431'
    },
    {
        name: "Venla Ruuska",
        address: {
            street: "Nallemäentie 22 C",
            city: "Helsinki",
        },
        id: '3d599471-3436-11e9-bc57-8b80ba54c431'
    },
]

const typeDefs = gql`
type Address {
    street: String!
    city: String! 
  }
  
  
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    changePerson(name: String!
        street: String
        phone: String
        city: String) : Person
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }
  
  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  }
  enum YesNo {
    YES
    NO
  }
  `


const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: (root, args) => {
            if (!args.phone) {
                return persons
            }
            const byPhone = (person) =>
                args.phone === 'YES' ? person.phone : !person.phone
            return persons.filter(byPhone)
        },
        findPerson: (root, args) =>
            persons.find(p => p.name === args.name)
    },
    Person: {
        address: (root) => {
            console.log("root", root)
            return {
                street: root.street,
                city: root.city
            }
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            if (persons.find(p => p.name === args.name)) {
                throw new UserInputError('Name must be unique', {
                    invalidArgs: args.name,
                })
            }
            const person = { ...args, id: uuid() }
            persons = persons.concat(person)
            return person
        },
        changePerson: (root, args) => {
            console.log("Args", args)
            persons = persons.map(p => {
                if (p.name === args.name) {
                    if (args.street) p.street = args.street;
                    if (args.city) p.city = args.city;
                    if (args.phone) p.phone = args.phone;
                }
                return p
            })
            const person = persons.find(p => p.name === args.name)
            return person
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})