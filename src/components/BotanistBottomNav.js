// The botanist's bottom bar: Home, Scan, Explore.
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import BottomNav from './BottomNav';

const ITEMS = [
  { icon: 'home-outline', label: 'Home' },
  { icon: 'scan-outline', label: 'Scan' },
  { icon: 'compass-outline', label: 'Explore' },
];

const INDEX = { home: 0, scan: 1, explore: 2 };

export default function BotanistBottomNav({ active }) {
  const navigation = useNavigation();
  const activeIndex = INDEX[active] ?? 0;

  const handlePress = (index) => {
    if (index === activeIndex) return;

    if (index === 0) navigation.navigate('BotanistHome');
    if (index === 1) navigation.navigate('ScanQR', { mode: 'botanist' });
    if (index === 2) navigation.navigate('Explore');
  };

  return (
    <BottomNav
      variant="botanist"
      activeIndex={activeIndex}
      items={ITEMS}
      onPress={handlePress}
    />
  );
}