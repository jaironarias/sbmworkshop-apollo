const { ApolloServer, gql } = require('apollo-server');
const loki = require('lokijs');
const fetch = require('node-fetch');

const sparc_url = 'https://health.data.ny.gov/resource/gnzp-ekau.json';

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

var mybooks = db.addCollection('books');


// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: String
  }
  type Date {
    now: String
    hello: String
  }
  type Record {
    abortion_edit_indicator: String
    age_group: String
    apr_drg_code: String
    apr_drg_description: String
    apr_mdc_code: String
    apr_mdc_description: String
    apr_medical_surgical_description: String
    apr_risk_of_mortality: String
    apr_severity_of_illness_code: String
    apr_severity_of_illness_description: String
    attending_provider_license_number: String
    birth_weight: String
    ccs_diagnosis_code: String
    ccs_diagnosis_description: String
    ccs_procedure_code: String
    ccs_procedure_description: String
    discharge_year: String
    emergency_department_indicator: String
    ethnicity: String
    facility_id: String
    facility_name: String
    gender: String
    health_service_area: String
    hospital_county: String
    length_of_stay: String
    operating_certificate_number: String
    patient_disposition: String
    payment_typology_1: String
    payment_typology_2: String
    race: String
    total_charges: String
    total_costs: String
    type_of_admission: String
    zip_code_3_digits: String
  }
  type Query {
    records: [Record]
    books: [Book]
    date: Date
  }
  type Mutation {
    addBook(title: String, author: String): Book
  }
`;

const resolvers = {
  Query: {
    books: () => {
      return (mybooks.find({}));
    },
    date: () => [{
      now:Date(),
      hello: "hello at "+Date()
    }],
    records: () => {
      return fetch(sparc_url)
      .then(response => response.json());
      //.then(json => console.log(json));
    },
  },
  Mutation: {
    addBook: (root, args) => {
        const items = {
            'title': args.title,
            'author': args.author,
        };
        mybooks.insert(items);
        db.save();
        return items
    }
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
