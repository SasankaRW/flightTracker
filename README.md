# Aircraft Tracker App

This is a React Native app that allows users to track aircraft information using the ADS-B database API. The app displays a list of aircraft with their details and allows users to click on each card to see more detailed information in a modal.

## Folder Structure
```markdown
├── assets/               # Images and other static files
├── context/              # Context for managing app state
│   └── AuthContext.js    # Context for user authentication
├── screens/              # Screen components
│   ├── HomeScreen.js     # Main screen displaying aircraft list
│   ├── LoginScreen.js    # Login screen
│   └── RegisterScreen.js # Registration screen
├── App.js                # Entry point of the app
├── index.js              # App entry for expo
```

## Features

- **Aircraft Tracker**: Displays a list of aircraft with thumbnails and details like manufacturer, owner, and country.
- **Click to View Details**: Users can click on an aircraft card to open a modal with more detailed information.
- **User Authentication**: Login and registration screens are provided for user authentication.

## Getting Started

### Prerequisites

- Node.js and npm (or yarn) installed on your system.
- Expo CLI installed globally. If not, install it with:

  ```bash
  npm install -g expo-cli
  ```

### Installation

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the app in development mode:

   ```bash
   expo start
   ```

   This will start the development server and open the app in your browser. You can also use the Expo Go app on your mobile device to scan the QR code and view the app on your phone.

## Usage

- **Login**: Users can log in with their credentials.
- **Registration**: New users can register with their details.
- **Aircraft List**: The home screen will show a list of aircraft retrieved from the API, and users can click to view more details.

## Contributing

Contributions are welcome! If you want to contribute to this project, please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.

