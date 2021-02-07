import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import client from './client'
import { ME } from './graphql'
import { SEARCH_REPOSITORY } from './graphql'

const VARIABLES = {
  first: 5,
  after: null,
  last: null,
  before: null,
  query: "Hello"
}

function App() {
  const { first, after, last, before, query } = VARIABLES
  return (
    <ApolloProvider client={client}>
      <div className="App">
        Hello,Graphql
      </div>
      <Query 
        query={SEARCH_REPOSITORY}
        variables={{first,after,last,before,query}}>
        {
          ({ loading , error , data}) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`
            
            console.log({data})
            return <div></div>
          }
        }
      </Query>
    </ApolloProvider>
  );
}

export default App;
