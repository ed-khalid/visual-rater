import { useState } from 'react';
import './App.css';
import './components/common/Panel.css'
import { RaterIconGridSvg } from './components/svg/RaterIconGridSvg';
import { RaterIconListSvg } from './components/svg/RaterIconListSvg';
import { RaterIconCartesianSvg } from './components/svg/RaterIconCartesianSvg';
import { Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnratedPage } from './pages/UnratedPage';
import { PlusIconSvg } from './components/svg/PlusIconSvg';
import { SpotifyIconSvg } from './components/svg/SpotifyIconSvg';
import { RaterContextPanel } from './components/panels/rater-context/RaterContextPanel';

export enum RaterStyle {
  GRID, LIST, CARTESIAN
}

interface Props {}

export const App = () => {
  const [newAlbumName, setNewAlbumName] =useState<string|undefined>() 
  const [raterStyle, setRaterStyle] = useState<RaterStyle>(RaterStyle.GRID)  

  const onCreateAlbum = (artistName:string, albumName:string) => {
    setNewAlbumName(albumName)
  }

  return (
    <div className="App" >
      <div id='header'>
        <div id="add-panel-buttons">
            <div  className="add-panel-option">
                <PlusIconSvg onClick={() => {}} />
            </div>
            <div className="add-panel-option">
                <SpotifyIconSvg onClick={() => {}} />
            </div>
        </div>
        <div id="title">VisRater</div>
        <div className="rater-style">
        <RaterIconGridSvg onClick={() => setRaterStyle(RaterStyle.GRID)  }/>
        <RaterIconListSvg onClick={() => setRaterStyle(RaterStyle.LIST) }/>
        <RaterIconCartesianSvg onClick={() => setRaterStyle(RaterStyle.CARTESIAN) }/>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<HomePage raterStyle={raterStyle}/>} />
        <Route path="/unrated" element={<UnratedPage />} />
        <Route path="*" element={<NotFoundPage/>} /> 
      </Routes>
    </div>
  );
}

export default App;
