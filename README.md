# ChemManagement

A web application for managing chemical inventory in laboratory settings. Track chemicals, storage locations, NFPA ratings, SDS documentation, and individual bottle inventory with unique IDs.

## Features

- **Chemical Catalog Management**
  - Add chemicals manually or lookup via CAS number
  - Automatic data import from PubChem and supplier websites
  - Store NFPA 704 diamond ratings (Health, Fire, Reactivity, Special)
  - Link to Safety Data Sheets (SDS)

- **Inventory Tracking**
  - Unique bottle ID system with parent-child numbering (e.g., CHEM0001-1, CHEM0001-2)
  - Track order date, received date, and expiration date
  - Monitor bottle status (active, empty, disposed)
  - Quantity tracking with various units

- **Location Management**
  - Define storage locations (cabinets, refrigerators, shelves, etc.)
  - Organize by room and building
  - Track bottle count per location

- **Dashboard**
  - Overview of inventory statistics
  - Expired chemical alerts
  - NFPA diamond legend

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite with Prisma ORM
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ChemManagement
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start the backend server:
```bash
npm run dev
```

5. In a new terminal, install frontend dependencies:
```bash
cd frontend
npm install
```

6. Start the frontend development server:
```bash
npm run dev
```

7. Open http://localhost:3000 in your browser

## Project Structure

```
ChemManagement/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── src/
│       ├── index.ts           # Express server entry
│       └── routes/
│           ├── bottles.ts     # Bottle CRUD operations
│           ├── chemicals.ts   # Chemical CRUD operations
│           ├── locations.ts   # Location CRUD operations
│           └── lookup.ts      # CAS/chemical lookup APIs
├── frontend/
│   └── src/
│       ├── api/               # API client functions
│       ├── components/        # Reusable React components
│       ├── pages/             # Page components
│       └── types/             # TypeScript types
└── README.md
```

## API Endpoints

### Chemicals
- `GET /api/chemicals` - List chemicals (with search)
- `GET /api/chemicals/:id` - Get chemical details
- `POST /api/chemicals` - Create chemical
- `PUT /api/chemicals/:id` - Update chemical
- `DELETE /api/chemicals/:id` - Delete chemical

### Bottles
- `GET /api/bottles` - List bottles (with filters)
- `GET /api/bottles/:id` - Get bottle details
- `POST /api/bottles` - Create bottles (batch)
- `PUT /api/bottles/:id` - Update bottle
- `DELETE /api/bottles/:id` - Delete bottle

### Locations
- `GET /api/locations` - List locations
- `GET /api/locations/:id` - Get location with bottles
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Lookup
- `GET /api/lookup/cas/:casNumber` - Lookup chemical by CAS number
- `GET /api/lookup/search?q=` - Search chemicals by name
- `GET /api/lookup/sds/:casNumber` - Get SDS URLs for suppliers

## Unique Bottle ID System

When bottles are added:
1. If it's a new chemical type, a new parent ID is generated (e.g., CHEM0001)
2. Each bottle gets a child number appended (CHEM0001-1, CHEM0001-2, etc.)
3. If more bottles of the same chemical are added later, numbering continues (CHEM0001-6, CHEM0001-7, etc.)

This allows easy tracking of bottles while maintaining the relationship to the chemical type.

## License

MIT
