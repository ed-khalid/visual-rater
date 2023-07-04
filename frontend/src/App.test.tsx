import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import App from './App';
import { GetArtistsDocument } from './generated/graphql';

test('renders app and sees eminem', async () => {
  const { findByText } = render(<MockedProvider mocks={mocks} addTypename={false}><App/></MockedProvider>);
  // await wait(undefined, {timeout: 7000})
  const linkElement = await findByText(/Eminem/i);
  expect(linkElement).toBeInTheDocument();
});


const mocks:MockedResponse<Record<string,any>>[] = [
  {
    request: {
      query: GetArtistsDocument 
    },
    result: {
      data: {
        artists: [{
          id: 'eminem-id',
          thumbnail: '', 
          name:  'Eminem',
          vendorId: 'spotify-eminem',
          albums: [{
            id: 'marshall-id',
            name: 'The Marshall Mathers LP',
            thumbnail: '',
            year: 2000,
            songs:[{
              id: '1' 
              ,vendorId:'spotify-id-kill-you'
              ,name: 'Kill You'
              ,number: 1
              ,discNumber: 1
              ,score: 4.5 
            }]
          }]
        }]
        
      }
    }
  }
]  
