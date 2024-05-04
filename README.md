
# Building Administrator

Building Administrator is a comprehensive tool designed to streamline communication and administrative tasks within residential buildings. This application facilitates interactions between tenants and the building administration, simplifies the booking of communal amenities like laundry rooms, automates the generation of receipts, and enhances the overall management of the building community.

## Features

- **Tenant-Administration Communication**: A seamless channel for communication between tenants and the building administration for reporting issues, making requests, and receiving updates.
- **Laundry Day Reservations**: Allows tenants to easily reserve laundry days, ensuring fair access and efficient use of communal laundry facilities.
- **Usage Tracking**: Monitors and records the use of utilities and amenities, aiding in fair billing and resource management.
- **Receipt Generation**: Automates the creation of receipts for various transactions and services within the building, ensuring transparency and accuracy.
- **Email Notifications**: Sends automated emails for reminders, confirmations, and notifications to keep tenants and administration informed and engaged.
- **Firebase Integration**: Utilizes Firebase for robust database management, secure storage solutions, and streamlined authentication processes, ensuring a smooth and secure user experience.

## Getting Started

### Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) installed on your machine to run the project.
- A modern web browser.
- Access to Firebase and familiarity with its setup for databases, storage, and authentication services.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/onurio/building-administrator.git
```

2. Navigate to the project directory:
```bash
cd building-administrator
```

3. Install dependencies:
```bash
npm install
```

4. **Firebase Configuration**:
   - Create a Firebase project in the [Firebase console](https://console.firebase.google.com/).
   - Configure the database, storage, and authentication according to your project's needs.
   - Obtain your Firebase configuration object.
   - Create a `firebaseConfig.js` file in the `src` folder of your project. Paste your Firebase configuration object into this file, exporting it as default:
     ```js
     // src/firebaseConfig.js
     export default {
       apiKey: "your-api-key",
       authDomain: "your-auth-domain",
       projectId: "your-project-id",
       storageBucket: "your-storage-bucket",
       messagingSenderId: "your-messaging-sender-id",
       appId: "your-app-id"
     };
     ```

5. Start the development server:
```bash
npm start
```

The server will start running on `http://localhost:3000` (or another port if configured). Navigate to this URL in your web browser to view the application.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repository and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Omri Nuri - [omrinuri@gmail.com](mailto:omrinuril@gmail.com) 

