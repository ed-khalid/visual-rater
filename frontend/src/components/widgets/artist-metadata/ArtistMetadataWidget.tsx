import './ArtistMetadataWidget.css'
import { ArtistMetadata } from '../../../generated/graphql';
import { SONG_SCORE_DICTIONARY } from '../../../models/ScoreModels';
import { HorizontalBarChart } from './HorizontalBarChart';

interface Props {
    metadata: ArtistMetadata
}

export const ArtistMetadataWidget = ({metadata}: Props) => {
    const cat1 = [
        {label: 'classic', value: metadata.songs.classic, color: SONG_SCORE_DICTIONARY.get('CLASSIC')!.color },
        {label: 'great', value: metadata.songs.great, color: SONG_SCORE_DICTIONARY.get('GREAT')!.color },
        {label: 'verygood', value: metadata.songs.verygood, color: SONG_SCORE_DICTIONARY.get('VERY GOOD')!.color },
        {label: 'good', value: metadata.songs.good, color: SONG_SCORE_DICTIONARY.get('GOOD')!.color },
    ] 
    const cat2 = [
        {label: 'pleasant', value: metadata.songs.pleasant, color: SONG_SCORE_DICTIONARY.get('PLEASANT')!.color },
        {label: 'decent', value: metadata.songs.decent, color: SONG_SCORE_DICTIONARY.get('DECENT')!.color },
        {label: 'interesting', value: metadata.songs.interesting, color: SONG_SCORE_DICTIONARY.get('INTERESTING')!.color },
        {label: 'meh', value: metadata.songs.meh, color: SONG_SCORE_DICTIONARY.get('MEH')!.color  },
    ]
    const cat3 = [
        {label: 'ok', value: metadata.songs.ok, color: SONG_SCORE_DICTIONARY.get('OK')!.color },
        {label: 'average', value: metadata.songs.average, color: SONG_SCORE_DICTIONARY.get('AVERAGE')!.color },
        {label: 'boring', value: metadata.songs.boring, color: SONG_SCORE_DICTIONARY.get('BORING')!.color },
        {label: 'poor', value: metadata.songs.poor, color: SONG_SCORE_DICTIONARY.get('POOR')!.color },
    ]
    const cat4 = [
        {label: 'bad', value: metadata.songs.bad, color: SONG_SCORE_DICTIONARY.get('BAD')!.color },
        {label: 'offensive', value: metadata.songs.offensive, color:SONG_SCORE_DICTIONARY.get('OFFENSIVE')!.color },
    ]
    const allCats = [...cat1, ...cat2, ...cat3, ...cat4] 
    const maxValue = Math.max(...allCats.map(d => d.value));
  
    return (
      <div className="metadata-charts">
        <HorizontalBarChart maxValue={maxValue} items={cat1} />
        <HorizontalBarChart maxValue={maxValue} items={cat2} />
        <HorizontalBarChart maxValue={maxValue} items={cat3} />
        <HorizontalBarChart maxValue={maxValue} items={cat4} />
      </div>
    );
  };