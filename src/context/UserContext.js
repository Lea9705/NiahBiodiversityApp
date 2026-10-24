// Remembers the name of the logged-in botanist while the app is open.
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext({
  userName: '',
  setUserName: () => {},
});

export function UserProvider({ children }) {
  const [userName, setUserName] = useState('');

  return (
    <UserContext.Provider value={{ userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

// "aleeya.batrisya@mail.com" becomes "Aleeya Batrisya".
export function nameFromEmail(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const base = raw.includes('@') ? raw.split('@')[0] : raw;

  return base
    .replace(/[._-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}