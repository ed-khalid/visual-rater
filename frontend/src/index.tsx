import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, StoreEnhancerStoreCreator } from 'redux'
import  reducers  from './reducers'
import  restService  from './services/restService'

const createStoreWithMiddleware:StoreEnhancerStoreCreator<any> = applyMiddleware(restService)(createStore); 

ReactDOM.render( 
<Provider store={createStoreWithMiddleware(reducers)}>
  <App />
</Provider>
, document.getElementById('root'));
registerServiceWorker();
