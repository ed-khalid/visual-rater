import React  from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {  ApolloProvider } from '@apollo/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { client } from './setupApollo';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReducerProvider } from './providers/ReducerProvider';
import { HierarchyMaker } from './components/HierarchyMaker';

const router = createBrowserRouter([{ path: '/', element: <ReducerProvider /> }, { path: '/new', element: <HierarchyMaker/> }])  


// app is inside ReducerProvider
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container) 
  root.render(
    <React.StrictMode>
      <ApolloProvider client={client}>
      <DndProvider backend={HTML5Backend}>
        <RouterProvider router={router} />
        </DndProvider>
      </ApolloProvider>
    </React.StrictMode>
  )

}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
