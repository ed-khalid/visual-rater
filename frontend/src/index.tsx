import React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {  ApolloProvider } from '@apollo/client';
import { client } from './setupApollo';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

ReactDOM.render(
    <React.StrictMode>
      <ApolloProvider client={client}>
      <DndProvider backend={HTML5Backend}>
        <App />
        </DndProvider>
      </ApolloProvider>
    </React.StrictMode>, document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
