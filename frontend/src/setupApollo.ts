import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, split } from "@apollo/client"
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from "@apollo/client/utilities"
import  { createClient} from 'graphql-ws'

const httpLink = new HttpLink({ uri : 'http://localhost:9000/graphql' }) 
const wsLink = new GraphQLWsLink(createClient({ url: 'ws://localhost:9000/graphql' }))  
const splitLink = split(({query}) => {
   const mainDef = getMainDefinition(query)
   const {kind } = mainDef
   let op 
   if ('operation' in mainDef) {
    op = mainDef.operation
   }
   return kind === 'OperationDefinition' && op === 'subscription' 

}, wsLink, httpLink)  
const omit = new ApolloLink((op, forward) => {
  if (op.variables) {
    const omitTypename = (k:string,v:any) => (k === '__typename') ? undefined: v
    op.variables = JSON.parse(JSON.stringify(op.variables), omitTypename) 
  }
  return forward(op).map((data) => data)
})  
const link  = ApolloLink.from([omit, splitLink])  

export const client = new ApolloClient({
  link
  ,cache: new InMemoryCache()
})