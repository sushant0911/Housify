# Housify

Housify is a modern real estate management platform that allows users to browse, book, and manage properties with ease. The project features a full-stack architecture with a React frontend and a Node.js/Express backend, utilizing Prisma for database management.

## Features

- User authentication and profile management
- Property listing, searching, and filtering
- Property booking and visitor management
- Add, edit, and manage owned properties
- Responsive and modern UI/UX
- Integration with third-party services (e.g., Auth0)

## Tech Stack

- **Frontend:** React, Vite, CSS Modules
- **Backend:** Node.js, Express, Prisma
- **Database:** (Configured via Prisma, e.g., PostgreSQL or SQLite)
- **Authentication:** Auth0

## Folder Structure

```
Housify/
  client/           # Frontend React application
    public/         # Static assets
    src/            # Source code
      components/   # Reusable UI components
      context/      # React context providers
      hooks/        # Custom React hooks
      pages/        # Page components
      utils/        # Utility functions
    index.html      # Main HTML file
    package.json    # Frontend dependencies
    ...
  server/           # Backend Node.js application
    config/         # Configuration files (Auth0, Prisma)
    controllers/    # Express route controllers
    data/           # Static data (e.g., Residency.json)
    prisma/         # Prisma schema and migrations
    routes/         # Express route definitions
    index.js        # Entry point for backend
    package.json    # Backend dependencies
    ...
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Yarn or npm

### Setup Instructions

#### 1. Clone the repository

```bash
git clone <repo-url>
cd Housify
```

#### 2. Install dependencies

- For the frontend:
  ```bash
  cd client
  yarn install # or npm install
  ```
- For the backend:
  ```bash
  cd ../server
  yarn install # or npm install
  ```

#### 3. Configure Environment Variables

- Set up your Auth0 and database credentials in the appropriate config files in `server/config/`.
- (Optional) Create a `.env` file for sensitive variables if needed.

#### 4. Run the development servers

- Start the backend:
  ```bash
  cd server
  yarn start # or npm start
  ```
- Start the frontend:
  ```bash
  cd ../client
  yarn dev # or npm run dev
  ```

#### 5. Open the app

Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view the frontend.

## Deployment

- The project includes `vercel.json` files for both frontend and backend, making it easy to deploy on Vercel.
- Ensure environment variables are set in your deployment environment.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Mantine UI](https://mantine.dev/) for UI components
- [Auth0](https://auth0.com/) for authentication
- [Prisma](https://www.prisma.io/) for ORM

---------------------------------------------------------------------------------------------------------------------------
DO GIVE A STAR ⭐ IF YOU LIKE THE PROJECT
