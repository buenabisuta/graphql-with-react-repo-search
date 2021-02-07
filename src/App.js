import { Component } from 'react'
import { ApolloProvider , Mutation , Query } from 'react-apollo'
import client from './client'
import { ME } from './graphql'
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORY } from './graphql'
import React from 'react'

const StarButton = props => {
  const {node, first, after, last, before, query} = props
  const totalCount = node.stargazers.totalCount
  const starCount = totalCount === 1 ? '1 star' : `${totalCount} stars`
  const viewerHasStarred = node.viewerHasStarred ? 'starred' : '-'

  const StarStatus = ({addOrRemoveStar}) => {
    return (
      <button onClick={
        () => addOrRemoveStar({
            variables: { input: { starrableId: node.id }},
            update: (store, { data: {addStar, removeStar}}) => {
              const { starrable } = addStar || removeStar
              const data = store.readQuery({
                query: SEARCH_REPOSITORY,
                variables: {first, after, last, before, query}
              })
              const edges = data.search.edges
              const newEdges = edges.map(edge => {
                if (edge.node.id === node.id){
                  const totalCount = edge.node.stargazers.totalCount
                  const diff = starrable.viewerHasStarred ? 1 : -1
                  edge.node.stargazers.totalCount = totalCount + diff
                }
                return edge
              })
              data.search.edges = newEdges
              store.writeQuery({ query: SEARCH_REPOSITORY, data})
            }
        })
      }>
      {starCount} | {viewerHasStarred}</button> 
    )  
  }
  return (
    <Mutation 
      mutation={node.viewerHasStarred ? REMOVE_STAR : ADD_STAR}>
      {
        addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar}/>
      }
    </Mutation>
  )
}

const PER_PAGE = 5
const DEFALUT_STATE = {
  first: PER_PAGE,
  after: null,
  last: null,
  before: null,
  query: ""
}

class App extends Component {
  constructor(props){
    super(props)
    this.state = DEFALUT_STATE
    this.myRef = React.createRef()
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  
  handleSubmit(event) {
    event.preventDefault()
    this.setState({
      query: this.myRef.current.value
    })
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
          <input ref={this.myRef} />
          <input type="submit" value="Submit" />
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
                            <StarButton node={node} {...{first,after,last,before,query}}/>
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
