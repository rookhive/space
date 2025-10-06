import { makePersisted } from '@solid-primitives/storage';
import { createStore } from 'solid-js/store';

export const colors = [
  0x860a30, // red
  0xe23d14, // orange
  0xecf96a, // yellow
  0x10aa86, // green
  0x26b2e9, // light blue
  0x031ae7, // blue
  0x8f12b9, // purple
  0xbb0092, // pink
];

export const preferencesStore = makePersisted(
  createStore({
    color: colors[0],
  }),
  {
    name: 'preferences',
    storage: localStorage,
  }
);
