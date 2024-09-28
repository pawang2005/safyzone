<documents>
<document index="1">
<source>README.md</source>
<document_content>
# Safy Zone 🚨

Safy Zone is a crowdsourced safety map for urban areas, designed to enhance public safety by providing real-time data on incidents and area security. Users can report incidents, view heatmaps of unsafe areas, and evaluate routes based on AI-generated safety scores. The platform also automates the escalation of critical reports to regional police stations, ensuring a swift response to public safety concerns.

## Table of Contents 📖
- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [APIs Used](#apis-used)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Contact](#contact)

## About the Project 📋
Urban safety is a growing concern, particularly for vulnerable communities. Safy Zone aims to empower citizens by providing a platform to report incidents, assess the safety of routes, and view past incident trends. By using crowdsourced data and integrating it with AI-powered safety scoring and real-time updates, the platform offers actionable insights and safer travel options for city dwellers.

The project also supports law enforcement by automatically sending detailed reports to police stations for critical incidents, ensuring timely interventions.

## Key Features ✨
- *Incident Report*: Users can report real-time incidents (e.g., harassment, accidents).
- *Heat Map*: Visual representation of area safety based on incident frequency and severity.
- *Route Safety Score*: AI-generated scores for travel routes based on real-time and past data.
- *Incident History & Trends*: Overview of past incidents and safety trends over a period of time.
- *Incident Support*: Users can validate reports, improving the accuracy of incidents.
- *Escalation to Police*: Critical reports are automatically sent to regional police stations for immediate action.

## Tech Stack 🛠
- *Backend*: 
  - Node.js
  - Express.js
  - Passport.js (for authentication)
  
- *Database*: 
  - MongoDB (NoSQL database)

- *Frontend*: 
  - HTML
  - CSS
  - JavaScript
  - Google Maps API (for map integration)

- *APIs*: 
  - Google Maps API (for heatmaps and route safety scores)
  - Gemini (for AI-driven incident analysis)

## Installation 🚀
Clone the repository:

```bash
git clone https://github.com/your-username/safy-zone.git
cd safy-zone
```

Install dependencies:

```bash
npm install
```

Set up environment variables: Create a .env file and add the following:

```bash
MONGO_URI=<Your MongoDB URI>
GOOGLE_MAPS_API_KEY=<Your Google Maps API Key>
GEMINI_API_KEY=<Your Gemini API Key>
SESSION_SECRET=<Your session secret>
```

Run the application:

```bash
npm start
```

## Usage 📱
Once the app is running, you can:

1. Register or log in using Passport.js.
2. Report incidents by filling out a form with details and location.
3. View a heatmap of your area to understand current safety conditions.
4. Check route safety scores for your commute.
5. Monitor incident trends through a dynamic chart.
6. Support other users' reports, increasing their credibility.
7. Receive automatic police alerts for critical incidents.

## Folder Structure 🗂
```
safy-zone/
│
├── controllers/         # Request handlers and business logic
│   ├── complain.js
│   └── usersController.js
│
├── models/              # MongoDB models (Mongoose schema)
│   ├── complaint.js
│   └── user.js
│
├── public/              # Static assets
│   ├── css/
│   │   └── style1.css
│   ├── js/
│   │   └── city.js
│
├── routes/              # API endpoints
│   ├── complain.js
│   └── users.js
│
├── utils/               # Utility functions
│   ├── ExpressError.js
│   └── wrapAsync.js
│
├── views/               # EJS templates
│   ├── emails/
│   │   └── emailTemplate.ejs
│   ├── includes/
│   ├── layouts/
│   ├── listings/
│   │   ├── new.ejs
│   │   ├── show.ejs
│   │   ├── heatmaps.ejs
│   │   └── trends.ejs
│   ├── users/
│   │   ├── login.ejs
│   │   └── signup.ejs
│
├── .env                 # Environment variables
├── app.js               # Main application file
├── cloudConfig.js       # Cloud-based config (if applicable)
├── middleware.js        # Middleware functions
├── package.json         # Project metadata and dependencies
└── server.js            # Server entry point
```

## APIs Used 🌐
- Google Maps API: Used for generating heatmaps, route safety scores, and displaying maps.
- Gemini API: Integrated for AI-based analysis of incidents, trends, and safety scoring.

## Future Improvements 📈
- Mobile App Integration: Develop a Flutter-based mobile app for wider accessibility.
- Live Alerts: Push notifications for nearby incidents.
- Multi-Language Support: Expand to include multiple languages to cater to diverse user bases.
- Enhanced AI: Use machine learning to predict potential safety risks in real-time based on historical data.

## Contributing 🤝
Contributions are welcome! Please feel free to submit a Pull Request or open an issue if you have suggestions for new features or bug fixes.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## Contact 📧
If you have any questions or feedback, feel free to reach out at sachin.apwig@gmail.com.
</document_content>
</document>
</documents>
