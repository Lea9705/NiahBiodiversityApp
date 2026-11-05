// The bottom bar for everyone: Home, Scan, Map, Explore.
// Visitors and staff see the same bar. Only the Home button goes to a different
// page (the visitor home or the staff home).
//
// Moving between these four pages REPLACES the page you leave (with the home
// page kept underneath, so the Android back button goes Home). The page you
// left is destroyed, so its camera or map is not kept running in the
// background.
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import BottomNav from './BottomNav';
import { useUser } from '../context/UserContext';

const ITEMS = [
  { key: 'home', icon: 'home-outline', label: 'Home' },
  { key: 'scan', icon: 'scan-outline', label: 'Scan', route: 'ScanQR' },
  { key: 'map', icon: 'map-outline', label: 'Map', route: 'Map' },
  { key: 'explore', icon: 'compass-outline', label: 'Explore', route: 'Explore' },
];

export default function AppBottomNav({ active }) {
  const navigation = useNavigation();
  const { isLoggedIn } = useUser();

  const found = ITEMS.findIndex((item) => item.key === active);
  const activeIndex = found === -1 ? 0 : found;

  const handlePress = (index) => {
    const target = ITEMS[index];

    if (!target || index === activeIndex) return;

    const homeRoute = isLoggedIn ? 'BotanistHome' : 'VisitorHome';

    if (target.key === 'home') {
      navigation.reset({ index: 0, routes: [{ name: homeRoute }] });
      return;
    }

    navigation.reset({
      index: 1,
      routes: [{ name: homeRoute }, { name: target.route }],
    });
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
