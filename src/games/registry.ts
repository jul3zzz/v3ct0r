// The leçons-jeux, in the order shown in LEARN and placed as stations in the ATLAS.
import type { GameDef } from './types';
import { DUEL } from './duel';
import { EIGEN } from './eigen';
import { FOURIER } from './fourier';
import { PILOT4D } from './pilot4d';
import { MANDEL } from './mandel';
import { BUFFON } from './buffon';
import { PRIMES } from './primes';
import { BABYLON } from './babylon';
import { EUCLID } from './euclid';
import { ERATOSTHENES } from './eratosthenes';
import { ARCHIMEDES } from './archimedes';

export const GAMES: GameDef[] = [DUEL, EIGEN, FOURIER, PILOT4D, MANDEL, BUFFON, PRIMES];

/** period games of the story mode (STORY.md): played from the beacons of LA GRANDE ENTROPIE */
export const STORY_GAMES: GameDef[] = [BABYLON, EUCLID, ERATOSTHENES, ARCHIMEDES];

export const gameById = (id: string): GameDef | undefined => GAMES.find((g) => g.id === id) ?? STORY_GAMES.find((g) => g.id === id);
