const { ApolloServer, gql } = require('apollo-server');
const loki = require("lokijs");

const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const db = new loki('books.json',{'autosave':true,'autoload':true,'serializationMethod':'pretty'});
var cbooks = db.addCollection("books");

if(cbooks.count() == 0 && cbooks.insert(books)) {
  console.log("Added books")
}


// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: String
  }

  type Date {
    now: String
    allo: String
  }

  type Query {
    books: [Book]
    qbooks(myquery:String): [Book] 
    date: Date
  }

  type Mutation {
    addBook(title: String, author: String): Book
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => {
      return (cbooks.find({}));
    },
    qbooks: (root,args) => {
      mq = JSON.parse(args.myquery)
      return (cbooks.find(mq));
    },
    date: () => (
      {
        now: Date(),
        allo: "Hello, World! "+ Date()
      }
    ),
  },
  Mutation: {
    addBook: (root,args) => {
        item = { 'title': args.title, 'author': args.author };
        cbooks.insert(item);
        db.save();
        return item;
    }
  }
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});