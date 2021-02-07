import { Component } from 'react'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import client from './client'
import { ME } from './graphql'
import { SEARCH_REPOSITORY } from './graphql'
import React from 'react'

const StarButton = props => {
  const node = props.node
  const totalCount = node.stargazers.totalCount
  const starCount = totalCount === 1 ? '1 star' : `${totalCount} stars`
  const viewerHasStarred = node.viewerHasStarred ? 'starred' : '-'

  return (
    <button>{starCount} | {viewerHasStarred}</button> 
  )
}

const PER_PAGE = 5
const DEFALUT_STATE = {
  first: PER_PAGE,
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

  goNext(search) {
    this.setState({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      before: null,
      last: null
    })
  }

  goPrevious(search) {
    this.setState({
      first: null,
      after: null,
      before: search.pageInfo.startCursor,
      last: PER_PAGE
    })
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
                            &nbsp;
                            <StarButton node={node} />
                          </li>
                        )
                      })
                    }
                  </ul>
                  {
                    data.search.pageInfo.hasPreviousPage ? 
                    <button onClick={this.goPrevious.bind(this,data.search)}>
                      Previous
                    </button>
                    :
                    null
                  }
                  {                    
                    data.search.pageInfo.hasNextPage ? 
                      <button onClick={this.goNext.bind(this,data.search)}>
                        Next
                      </button>
                      :
                      null
                  }
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
