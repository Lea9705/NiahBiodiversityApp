// The bottom bar for everyone.
// Staff see Home, Scan, IoT, Explore. Visitors see Home, Scan, Explore (no IoT).
// The Home button goes to the visitor home or the staff home.
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import BottomNav from './BottomNav';
import { useUser } from '../context/UserContext';

const HOME = { key: 'home', icon: 'home-outline', label: 'Home' };
const SCAN = { key: 'scan', icon: 'scan-outline', label: 'Scan' };
const IOT = { key: 'iot', icon: 'hardware-chip-outline', label: 'IoT' };
const EXPLORE = { key: 'explore', icon: 'compass-outline', label: 'Explore' };

const STAFF_ITEMS = [HOME, SCAN, IOT, EXPLORE];
const VISITOR_ITEMS = [HOME, SCAN, EXPLORE];

export default function AppBottomNav({ active }) {
  const navigation = useNavigation();
  const { isLoggedIn } = useUser();

  const items = isLoggedIn ? STAFF_ITEMS : VISITOR_ITEMS;
  const found = items.findIndex((item) => item.key === active);
  const activeIndex = found === -1 ? 0 : found;

  const handlePress = (index) => {
    const target = items[index];

    if (!target || index === activeIndex) return;

    if (target.key === 'home') {
      navigation.navigate(isLoggedIn ? 'BotanistHome' : 'VisitorHome');
    }
    if (target.key === 'scan') navigation.navigate('ScanQR');
    if (target.key === 'iot') navigation.navigate('Iot');
    if (target.key === 'explore') navigation.navigate('Explore');
  };

  return (
    <BottomNav
      variant="botanist"
      activeIndex={activeIndex}
      items={items.map(({ icon, label }) => ({ icon, label }))}
      onPress={handlePress}
    />
  );
}
