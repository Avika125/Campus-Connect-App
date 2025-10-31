-- Campus Connect
Campus Connect is a beginner-friendly React Native app designed for students to discover and register for various campus events. The app provides a seamless experience to browse, search, register, and manage event participation with persistent storage and live API integration.

-- Features
Browse and search events by name or category.

View detailed event information including description, date, location, category, and organizer.

Register/unregister for events with saved registration state using AsyncStorage.

View all registered events in a dedicated "My Registrations" screen.

Share event details via native sharing options.

Responsive, attractive UI with floating action button for easy access to registrations.

Fetches event data dynamically from a MockAPI endpoint to simulate real-world scenarios.

Proper error handling and loading indicators for smooth user experience.

-- Project Structure

CampusConnectApp/
├── src/
│   ├── screens/               # Screen components (Home, Details, My Registrations)
│   ├── components/            # Reusable UI components (EventCard, SearchBar)
│   ├── utils/                 # Utilities (API calls, AsyncStorage helpers)
│   ├── constants/             # Common constants (colors, styles)
├── App.js                     # Navigation setup and app entry point
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation
Installation & Running
Clone the repository:

bash
git clone <repository-url>
cd CampusConnectApp
Install dependencies:

bash
npm install
# or
yarn install
Start the Expo development server:

bash
npx expo start
Run on device or simulator:

Press a for Android emulator

Press i for iOS simulator (Mac only)

Or scan the QR code with Expo Go app on actual device

-- API Integration
Events are fetched from a MockAPI endpoint to allow dynamic data:

https://6904c0616b8dabde4964fc0f.mockapi.io/api/cc/CampusConnect

Event data includes: id, name, description, date, location, category, organizer.

-- Technologies Used
React Native with Expo managed workflow.

React Navigation v6 for app navigation.

AsyncStorage for persistent event registration storage.

Fetch API for data retrieval.

Custom modular components and utilities.

-- Known Limitations
Registrations are stored locally and not synced between devices.

No user authentication implemented.

Push notifications are not implemented.

Limited offline support.

UI optimized for phones; tablet and desktop views not supported.

-- Future Improvements
Add user authentication and remote syncing of registrations.

Implement push notifications for event reminders.

Improve UI responsiveness and add theming options.

Include event creation and management features.

Add calendar integration and offline caching.

-- Contribution
Contributions, bug reports, and feature requests are welcome. Please open an issue or pull request on the repo.

-- License
This project is open source for educational and competency purposes.
