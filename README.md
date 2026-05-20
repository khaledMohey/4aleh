# Chalet Management System | نظام إدارة الشاليهات

نظام Full Stack متكامل لإدارة وتأجير الشاليهات — الحجوزات، المصروفات، الأرباح، التقارير، والتقويم.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15+, TypeScript, Tailwind CSS, Shadcn/UI, React Query, Recharts, TanStack Table |
| Backend | Django 5, Django REST Framework, PostgreSQL |
| Features | RTL Arabic, Dark/Light Mode, Swagger API Docs |

## Project Structure

```
4aleh/
├── backend/          # Django API
│   ├── apps/
│   │   ├── chalets/
│   │   ├── owners/
│   │   ├── bookings/
│   │   ├── expenses/
│   │   ├── notifications/
│   │   └── core/
│   ├── config/
│   └── scripts/seed_data.py
├── frontend/         # Next.js App
│   └── src/
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

## Database Setup

```sql
CREATE DATABASE chalet_management;
-- User: postgres (or update backend/.env)
```

## Backend Setup

```bash
cd backend

# Virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

# Environment
copy .env.example .env
# Edit .env with your PostgreSQL password

# Migrations
python manage.py migrate
python manage.py createsuperuser

# Seed sample data
python manage.py seed

# Run server
python manage.py runserver
```

API: http://localhost:8000/api/v1/  
Swagger Docs: http://localhost:8000/api/docs/  
Admin: http://localhost:8000/admin/

## Frontend Setup

```bash
cd frontend

npm install

copy .env.local.example .env.local

npm run dev
```

App: http://localhost:3000

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/dashboard/` | Dashboard statistics |
| `GET/POST /api/v1/chalets/` | Chalets CRUD |
| `GET/POST /api/v1/owners/contracts/` | Owner rental contracts |
| `GET/POST /api/v1/bookings/` | Customer bookings |
| `GET/POST /api/v1/expenses/` | Expenses |
| `GET /api/v1/bookings/calendar/` | Calendar events |
| `GET /api/v1/reports/` | Reports (PDF/Excel export) |
| `GET /api/v1/notifications/` | Notifications |
| `GET /api/v1/search/` | Global search |

## Features

- **Dashboard**: Stats, charts, latest bookings, top chalets
- **Chalets**: Full CRUD, features, images, status
- **Owner Rentals**: Auto-calculate days & total cost
- **Bookings**: Overlap prevention, auto profit calculation
- **Expenses**: 7 expense types
- **Profit System**: Per-chalet and system-wide
- **Reports**: Profit, bookings, expenses, occupancy + PDF/Excel/Print
- **Calendar**: Bookings & owner contracts view
- **Notifications**: Contract expiry, payments, upcoming bookings

## Environment Variables

### Backend (`backend/.env`)

```
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=chalet_management
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Production Notes

- Set `DEBUG=False` and strong `SECRET_KEY`
- Configure `ALLOWED_HOSTS`
- Use gunicorn/uvicorn for Django
- Build frontend: `npm run build && npm start`
- Collect static: `python manage.py collectstatic`

## License

MIT
