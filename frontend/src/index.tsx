import React  from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {  ApolloProvider } from '@apollo/client';
import { client } from './setupApollo';
import { MusicReducerProvider } from './providers/MusicReducerProvider';
import { BrowserRouter } from 'react-router-dom';
import App from './App';


// app is inside ReducerProvider
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container) 
  root.render(
    <React.StrictMode>
      <ApolloProvider client={client}>
        <BrowserRouter>
            <MusicReducerProvider>
              <App/>
            </MusicReducerProvider>
        </BrowserRouter>
      </ApolloProvider>
    </React.StrictMode>
  )

}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
