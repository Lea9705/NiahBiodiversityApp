// A simple 4-icon bottom nav bar. This is purely visual for now - it does
// NOT switch screens yet. Wiring it up properly means either:
//   a) converting these Stack screens into a Bottom Tab Navigator, or
//   b) passing an onPress handler that calls navigation.navigate(...)
// left as a TODO since it depends on which screens you build next.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function BottomNav({ items, activeIndex, onPress }) {
  return (
    <View style={styles.nav}>
      {items.map((item, i) => {
        const active = i === activeIndex;
        const color = active ? colors.accentText : colors.textMuted;
        return (
          <TouchableOpacity key={item.label} style={styles.item} onPress={() => onPress && onPress(i)}>
            <Ionicons name={item.icon} size={20} color={color} />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderSubtle,
  },
  item: { alignItems: 'center', gap: 2 },
  label: { fontSize: 11 },
});
