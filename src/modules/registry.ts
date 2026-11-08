import type { ModuleDef } from '../core/types';
import { module as integrals } from './integrals';
import { module as dimensions } from './4d';
import { module as fractals } from './fractals';
import { module as constants } from './constants';
import { module as principles } from './principles';
import { module as probability } from './probability';

/** Navigation order: 01 → 06. */
export const MODULES: ModuleDef[] = [integrals, dimensions, fractals, constants, principles, probability];
