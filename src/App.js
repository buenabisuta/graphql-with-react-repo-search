import { Component } from 'react'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import client from './client'
import { ME } from './graphql'
import { SEARCH_REPOSITORY } from './graphql'
import React from 'react'

const DEFALUT_STATE = {
  first: 5,
  after: null,
  last: null,
  before: null,
  query: "フロントエンドエンジニア"
}

class App extends Component {
  constructor(props){
    super(props)
    this.state = DEFALUT_STATE
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  
  handleChange(event) {
    this.setState({
      ...DEFALUT_STATE,
      query: event.target.value
    });
    console.log(event.target.value)
  };

  handleSubmit(event) {
    event.preventDefault()
  }

  render(){
    const { first,after,last,before,query } = this.state
    return (
      <ApolloProvider client={client}>
        <form onSubmit={this.handleSubmit}>
          <input value={query} onChange={this.handleChange} />
        </form>
        <Query 
          query={SEARCH_REPOSITORY}
          variables={{first,after,last,before,query}}>
          {
            ({ loading , error , data}) => {
              if (loading) return 'Loading...'
              if (error) return `Error! ${error.message}`
              
              const repositoryUnit = data.search.repositoryCount === 1 ? 'Repository' : 'Repositories'
              const title = `Github Repositories Search Results - ${data.search.repositoryCount} ${repositoryUnit}`
              
              return (
                <React.Fragment>
                  <h2>{title}</h2>
                  <ul>
                    {
                      data.search.edges.map(edge => {
                        const node = edge.node

                        return (
                          <li key={node.id}>
                            <a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>
                          </li>
                        )
                      })
                    }
                  </ul>
                </React.Fragment>
              )
            }
          }
        </Query>
      </ApolloProvider>
    );  
  }
}

export default App;
