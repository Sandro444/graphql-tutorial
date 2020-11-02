const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = gql`
  type Query {
      getAllAuthors : [Author!]!
      getAllBooks(
          author: String
          genre: String
          ): [Book!]!
      bookCount: Int!
      authorCount: Int!
  }
  type Book {
      title: String!
      published: Int!
      author: String!
      id: ID!
      genres: [String!]!
  }
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Mutation {
      addBook(
          title: String!
          author: String!
          published: Int
          genres: [String!]
      ): Book!
      editAuthorBornYear(
          author: String!
          bornYear: Int!
      ): Author
  }
`

const resolvers = {
  Query: {
      getAllAuthors: () => authors,
      getAllBooks: (root, args) => {
          if(args.author){
              const filteredBooks = books.filter(b=>b.author === args.author)
              return filteredBooks
          }
          if(args.genre){
              const filteredGenres = books.filter(b=>{
                  if(b.genres.indexOf(args.genre) !== -1){
                      return b
                  }
              })
              return filteredGenres
          }
          return books
      },
      bookCount: () => books.length,
      authorCount: () => authors.length
  },
  Author: {
      bookCount: (root) => books.filter(b=>b.author === root.name).length 
  },
  Mutation: {
    addBook: (root, args)=>{
        let book = args
        books = books.concat(book)
        let findAuthor = authors.find(a => a.name === book.author)
        if(!findAuthor){
            authors = authors.concat({
                name: book.author,
                id: uuid()
            })
        }
        return book
    },
    editAuthorBornYear: (root, args)=>{
        let target = authors.find(a => a.name === args.author)
        console.log(target)
        if(target){
            authors.map(author => {
                if(author.name === args.author){
                    author.born = args.bornYear
                }
                return author
            })
            return target
        }
        return null        
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