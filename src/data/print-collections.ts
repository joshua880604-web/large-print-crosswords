import {christmasPuzzles} from './christmas';
import {thanksgivingPuzzles,winterPuzzles} from './seasonal';

// Collection membership includes cross-theme games, just like the topic pages.
export const printCollections=[
 {id:'christmas',name:'Christmas',puzzles:christmasPuzzles},
 {id:'thanksgiving',name:'Thanksgiving',puzzles:thanksgivingPuzzles},
 {id:'winter',name:'Winter',puzzles:winterPuzzles}
];
