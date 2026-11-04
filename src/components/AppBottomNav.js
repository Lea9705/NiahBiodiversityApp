// The bottom bar for everyone: Home, Scan, Map, Explore.
// Visitors and staff see the same bar. Only the Home button goes to a different
// page (the visitor home or the staff home).
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import BottomNav from './BottomNav';
import { useUser } from '../context/UserContext';

const ITEMS = [
  { key: 'home', icon: 'home-outline', label: 'Home' },
  { key: 'scan', icon: 'scan-outline', label: 'Scan' },
  { key: 'map', icon: 'map-outline', label: 'Map' },
  { key: 'explore', icon: 'compass-outline', label: 'Explore' },
];

export default function AppBottomNav({ active }) {
  const navigation = useNavigation();
  const { isLoggedIn } = useUser();

  const found = ITEMS.findIndex((item) => item.key === active);
  const activeIndex = found === -1 ? 0 : found;

  const handlePress = (index) => {
    const target = ITEMS[index];

    if (!target || index === activeIndex) return;

    if (target.key === 'home') {
      navigation.navigate(isLoggedIn ? 'BotanistHome' : 'VisitorHome');
    }
    if (target.key === 'scan') navigation.navigate('ScanQR');
    if (target.key === 'map') navigation.navigate('Map');
    if (target.key === 'explore') navigation.navigate('Explore');
  };

  return (
    <BottomNav
      variant="botanist"
      activeIndex={activeIndex}
      items={ITEMS.map(({ icon, label }) => ({ icon, label }))}
      onPress={handlePress}
    />
  );
}
