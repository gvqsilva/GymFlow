// constants/iconList.ts

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export interface IconInfo {
    name: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
    library: 'Ionicons' | 'MaterialCommunityIcons';
}

export const availableIcons: IconInfo[] = [
    { name: 'american-football-outline', library: 'Ionicons' },
    { name: 'barbell-outline', library: 'Ionicons' },
    { name: 'basketball-outline', library: 'Ionicons' },
    { name: 'bicycle-outline', library: 'Ionicons' },
    { name: 'body-outline', library: 'Ionicons' },
    { name: 'walk-outline', library: 'Ionicons' },
    { name: 'tennisball-outline', library: 'Ionicons' },
    { name: 'football-outline', library: 'Ionicons' },
    { name: 'water-outline', library: 'Ionicons' },
    { name: 'sunny-outline', library: 'Ionicons' },
    { name: 'boxing-glove', library: 'MaterialCommunityIcons' },
    { name: 'volleyball', library: 'MaterialCommunityIcons' },
    { name: 'weight-lifter', library: 'MaterialCommunityIcons' },
    { name: 'swim', library: 'MaterialCommunityIcons' },
    { name: 'run', library: 'MaterialCommunityIcons' },
    { name: 'karate', library: 'MaterialCommunityIcons' },
    { name: 'handball', library: 'MaterialCommunityIcons' },
    { name: 'hiking', library: 'MaterialCommunityIcons' },
    { name: 'rowing', library: 'MaterialCommunityIcons' },
    { name: 'snowboard', library: 'MaterialCommunityIcons' },
    { name: 'soccer', library: 'MaterialCommunityIcons' },
    { name: 'surfing', library: 'MaterialCommunityIcons' },
];