# Niah Biodiversity – Mobile App

React Native (Expo) app for Objective 1: Smart Digital Ground-Truthing Platform.
Covers the botanist and visitor sides of the mobile client.

## Folder structure

```
NiahBiodiversityApp/
├── App.js                     entry point, wraps the app in the navigator
├── app.json                   Expo config (name, icons, dark mode)
├── package.json
├── assets/                    placeholder icons — replace with your own branding
└── src/
    ├── theme/
    │   └── colors.js          all colors in one place — edit here to re-theme
    ├── navigation/
    │   └── AppNavigator.js    the stack of all screens
    ├── components/            reusable pieces shared across screens
    │   ├── PrimaryButton.js
    │   ├── OutlineButton.js
    │   ├── StyledInput.js
    │   ├── RecordListItem.js
    │   └── BottomNav.js
    └── screens/
        ├── RoleSelectScreen.js       "I'm a botanist" / "I'm a visitor"
        ├── BotanistLoginScreen.js    login only, no signup
        ├── VisitorAuthScreen.js      login + signup, tab toggle
        ├── BotanistHomeScreen.js     scan/register actions + recent records
        ├── VisitorHomeScreen.js      scan action + featured species
        └── NewPlantRecordScreen.js   the registration form (camera + GPS wired up)
```

## What's already working

- Full navigation flow: role select → login/signup → home → registration form
- Dark theme matching the approved mockups
- Visitor signup validation reused from your Lab8 pattern (email regex, password
  strength regex, repeat-password check)
- Real camera capture (`expo-image-picker`) and real GPS capture (`expo-location`)
  on the registration form — these ask for permission and use the actual device
  hardware, not placeholders

## What's still a TODO (search the code for "TODO")

- **Auth API calls** — login/signup currently just navigate straight to the home
  screen. Replace the TODO blocks in `BotanistLoginScreen.js` and
  `VisitorAuthScreen.js` with real `fetch`/`axios` calls to your backend
  teammate's endpoints, and store the returned JWT with `expo-secure-store`
  (not plain state — that's not secure).
- **Local offline storage** — `NewPlantRecordScreen.js` currently just
  `console.log`s the record on save. Replace with writing to SQLite or
  WatermelonDB, so it survives app restarts while offline.
- **Sync engine** — nothing currently pushes saved records to the server.
  This needs connectivity detection (`@react-native-community/netinfo`) plus
  a batched sync call to the backend.
- **QR scanning + generation** — not built yet. Suggested libraries:
  `react-native-vision-camera` (scanning) and `react-native-qrcode-svg`
  (generation).
- **Bottom nav routing** — `BottomNav.js` is currently visual only, it
  doesn't switch screens yet.
- **Real app icons** — `assets/` currently has simple placeholder icons
  generated for this scaffold. Swap them for your actual branding before
  a real build.

## Where your lab code was reused

- Login form layout → your `Lab7App.js` / `LoginPage.js`
- Signup validation logic → your `Lab8App.js` / `SignUpPage.js`
- List → detail navigation pattern → your `contact_list.js` / `display_contact.js`
- Stack Navigator setup → your `App.js` from the navigation lab
