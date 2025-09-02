# Vegan Action Hub

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-purple?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-orange)](https://github.com/pmndrs/zustand)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-yellowgreen?logo=vitest)](https://vitest.dev/)

Vegan Action Hub is a comprehensive, feature-rich platform designed to empower vegan activists and organizers. It provides a centralized hub for managing chapters, organizing events ("Cubes of Truth"), tracking outreach impact, and fostering a global community dedicated to animal advocacy.

The application is built with a modern, brutalist design aesthetic and features a robust set of tools for both individual activists and chapter organizers, including detailed analytics, role-based access control, and a sophisticated mock data generation pipeline for development and testing.

**[Live Demo (Placeholder)](#)**

![Vegan Action Hub Screenshot (Placeholder)](https://via.placeholder.com/800x450.png?text=Vegan+Action+Hub+Dashboard)

## ✨ Key Features

### For All Users

- **Event Discovery:** Find "Cube of Truth" events via an interactive list, map, or calendar view.
- **Personalized Dashboard:** A central hub to view upcoming events, stats, and pending tasks.
- **Profile Management:** Users can manage their profile, including a custom avatar upload feature.
- **Outreach Logging:** Log conversation outcomes from events to track personal impact.
- **Leaderboards:** See how you and your chapter rank in hours contributed and conversations held.
- **Resource Center:** Access a library of documents, guides, and videos.
- **Announcements:** Stay informed with global, regional, and chapter-specific news.
- **Rewards System:** Earn discount tiers based on your activism stats.
- **Notifications:** Receive alerts for event updates, requests, and badge awards.

### For Organizers (Role-Based)

- **Comprehensive Management Dashboard:** A central panel to manage members, chapters, and onboarding.
- **Onboarding Pipeline:** Review and approve new applicants through a multi-stage process.
- **Member Directory:** A searchable directory of all members within your scope of management.
- **User Profile Management:** View detailed stats, add private notes, and manage roles for activists.
- **Event Management:** Create, edit, cancel, and log post-event reports to update activist stats.
- **Chapter Administration:** Create and edit chapter details.
- **Inventory Tracking:** Manage chapter-specific inventory like masks, TVs, and signs.
- **Powerful Analytics:** A dedicated dashboard with filterable stats on members, events, and chapter health.

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with persistence)
- **Routing:** [React Router](https://reactrouter.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom "Modern Brutalism" design system
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
- **Charts & Maps:** [Recharts](https://recharts.org/) for analytics & [Leaflet](https://leafletjs.com/) with OpenStreetMap for maps
- **UI Components:** [FullCalendar](https://fullcalendar.io/), [Sonner](https://sonner.emilkowal.ski/) (for toasts)
- **Testing:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
- **Linting & Formatting:** [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)
- **Mock Data:** TypeScript-based generation using [@faker-js/faker](https://fakerjs.dev/)

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/vegan-action-hub.git
    cd vegan-action-hub
    ```

2.  **Install frontend dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Maps use free OpenStreetMap tiles via Leaflet - no API keys required!

4.  **Generate mock data:**
    - The application relies on a generated TypeScript file for all its data. Run the TypeScript script to create it.

    ```bash
    npm run generate-data
    ```

    This will create `src/data/mockData.ts` which is imported by the application's state management.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## ⚙️ Available Scripts

- `npm run dev`: Starts the development server with Hot Module Replacement.
- `npm run build`: Builds the app for production.
- `npm run preview`: Serves the production build locally.
- `npm run test`: Runs the test suite using Vitest.
- `npm run coverage`: Runs tests and generates a coverage report.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run format`: Formats all files using Prettier.
- `npm run generate-data`: Generates mock data using the TypeScript script.

## 📊 Mock Data Generation

This project includes a sophisticated TypeScript script (`scripts/generate-mock-data.ts`) to create realistic and deeply interconnected mock data using `@faker-js/faker`.

**Key Features:**

- **Realistic Data:** Generates users with varied activity levels, roles, and chapter affiliations.
- **Data Relationships:** Creates logical connections between users, events, and chapters.
- **TypeScript Native:** Runs directly within your Node.js environment without needing Python.
- **Typed Output:** Generates a fully typed `mockData.ts` file, ensuring type safety throughout the application.

For more details, see the [Mock Data Documentation](./README_MOCK_DATA.md).

## 🎨 Design System

The application features a "Modern Brutalism" design system implemented with Tailwind CSS. Key characteristics include:

- Sharp corners (no border-radius).
- Strong, 2px black borders on most elements.
- Bold typography using the "Libre Franklin" font.
- A high-contrast, limited color palette with semantic color names (`primary`, `success`, `danger`).
- Brutal-style box shadows (`4px 4px 0 #000`).
- A library of reusable UI components in `src/components/ui`.

For more details on its implementation, see the [Design System Updates Summary](./DESIGN_SYSTEM_UPDATES.md).

## ☁️ Deployment

The project is configured for deployment on [Vercel](https://vercel.com/). The `vercel.json` file includes:

- Build configurations for a standard Vite/React project.
- Robust security headers, including a Content Security Policy (CSP), to enhance application security.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
