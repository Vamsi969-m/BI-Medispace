# BI Project

BI Project is a React and TypeScript business application prototype for a pharmaceutical organization. It provides role-based workspaces for doctors, sales representatives, and administrators.

The current version is a frontend prototype. Its data is loaded from local mock data and stored in React context while the app is running. The project includes the Supabase client dependency, but no Supabase client is connected yet.

## Features

- Doctor dashboard with product catalog and product details
- Product favorites, orders, samples, demos, and organizations
- Sales representative dashboard and interaction management
- Administrator dashboard and user management
- Shared notifications, profile, and settings pages
- Role switching between doctor, representative, and administrator views
- Toast notifications and in-memory updates for prototype workflows

## Project Structure

```text
BI_project/
├── index.html                 # HTML entry point
├── package.json               # Scripts and dependencies
├── package-lock.json          # Locked dependency versions
├── vite.config.ts             # Vite configuration and path aliases
├── tsconfig*.json             # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── eslint.config.js           # ESLint configuration
├── src/
│   ├── main.tsx               # React application bootstrap
│   ├── App.tsx                # App shell and page selection
│   ├── index.css              # Global styles and Tailwind layers
│   ├── types.ts               # Shared TypeScript domain types
│   ├── components/
│   │   ├── ui.tsx             # Reusable UI primitives
│   │   ├── Dropdown.tsx       # Dropdown control
│   │   ├── Modal.tsx          # Modal dialog
│   │   ├── ProductCard.tsx    # Product summary card
│   │   ├── Toast.tsx          # Toast notification UI
│   │   └── layout/
│   │       ├── Layout.tsx     # Main application layout
│   │       ├── Sidebar.tsx    # Navigation sidebar
│   │       └── Topbar.tsx     # Header and user actions
│   ├── data/
│   │   └── mockData.ts        # Prototype products and business records
│   ├── lib/
│   │   └── utils.ts           # Shared utility functions
│   ├── store/
│   │   └── AppContext.tsx     # Shared state and application actions
│   └── pages/
│       ├── admin/              # Administrator screens
│       ├── doctor/             # Doctor screens
│       ├── rep/                # Representative screens
│       └── shared/             # Screens used by multiple roles
└── README.md
```

## Application Flow

```text
main.tsx
	-> App
		-> AppProvider
			-> Layout
				-> Router
					-> Role-specific or shared page
```

`AppContext.tsx` owns the active role, selected page, page parameters, products, notifications, demos, samples, orders, interactions, and toast messages. Pages read and update this state through the `useApp()` hook.

The project uses lightweight in-app page selection rather than a URL router. `App.tsx` maps page keys such as `dashboard`, `products`, `orders`, and `settings` to React page components.

## Connections and Data Sources

### Current connections

- **React:** UI rendering and component composition
- **React DOM:** Mounts the app into the `root` element in `index.html`
- **React Context:** Shares application state without a separate backend
- **Vite:** Local development server and production bundling
- **Tailwind CSS/PostCSS:** Styling pipeline
- **Lucide React:** Icons used by the interface
- **External product images:** Product cards currently reference images hosted by Pexels

### Supabase connection status

`@supabase/supabase-js` is present in `package.json`, but there is currently no `createClient` call or Supabase import in `src/`. Therefore, the app does not currently read or write data to Supabase.

When backend persistence is added, the recommended connection is:

```text
Page component
	-> AppContext action
		-> Supabase data service
			-> Supabase Auth / Database / Storage
```

Use environment variables for the connection:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Do not commit real credentials. A future Supabase client can be created in a dedicated module such as `src/lib/supabase.ts`, while database calls should remain outside presentation components.

## Setup and Commands

From the `BI_project` directory:

```powershell
npm install
npm run dev
```

The development app is normally available at `http://localhost:5173/`.

```powershell
npm run typecheck   # Validate TypeScript
npm run lint        # Run ESLint
npm run build       # Create a production build
npm run preview     # Preview the production build locally
```

There is no `npm start` script in this project. Use `npm run dev` for development.

## Prototype Limitations

- Data resets when the page is refreshed because it is held in memory.
- There is no authentication or authorization backend yet.
- The internal page navigation does not create browser URLs for each page.
- Orders, demos, samples, and interactions are simulated locally.
- Supabase persistence and file storage still need to be implemented.
