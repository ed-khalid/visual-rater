import { useState } from 'react';
import './App.css';
import './components/common/Panel.css'
import { RaterIconGridSvg } from './components/svg/RaterIconGridSvg';
import { RaterIconListSvg } from './components/svg/RaterIconListSvg';
import { RaterIconCartesianSvg } from './components/svg/RaterIconCartesianSvg';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlusIconSvg } from './components/svg/PlusIconSvg';
import { SpotifyIconSvg } from './components/svg/SpotifyIconSvg';
import { RaterStyle } from './models/RaterModels';
import { AddSection } from './components/newalbum/AddSection';


interface Props {}

export const App = () => {
  const [raterStyle, setRaterStyle] = useState<RaterStyle>(RaterStyle.PLAYLIST)  
  const [showAddNewAlbumPanel, setShowAddNewAlbumPanel] = useState<boolean>(false)

  return (
    <div className="App" >
      <div id='header'>
        <div id="add-panel-buttons">
            <div  className="add-panel-option">
                <PlusIconSvg onClick={() => { setShowAddNewAlbumPanel(true) }} />
            </div>
            <div className="add-panel-option">
                <SpotifyIconSvg onClick={() => { setShowAddNewAlbumPanel((prev) => !prev)}} />
            </div>
        </div>
        <div id="title">VisRater</div>
        <div className="rater-style">
        <RaterIconGridSvg onClick={() => setRaterStyle(RaterStyle.GRID)  }/>
        <RaterIconCartesianSvg onClick={() => setRaterStyle(RaterStyle.PLAYLIST) }/>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<HomePage raterStyle={raterStyle}/>} />
        <Route path="*" element={<NotFoundPage/>} /> 
      </Routes>
      { showAddNewAlbumPanel && <AddSection />}
    </div>
  );
}

export default App;
