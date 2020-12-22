import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client"

const httpLink = new HttpLink({ uri : 'http://localhost:9000/graphql' }) 
const omit = new ApolloLink((op, forward) => {
  if (op.variables) {
    const omitTypename = (k:string,v:any) => (k === '__typename') ? undefined: v
    op.variables = JSON.parse(JSON.stringify(op.variables), omitTypename) 
  }
  return forward(op).map((data) => data)
})  
const link  = ApolloLink.from([omit, httpLink])  

export const client = new ApolloClient({
  link
  ,cache: new InMemoryCache()
})