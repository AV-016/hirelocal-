# HireLocal 

**HireLocal** is a modern, hyperlocal service booking platform designed to connect homeowners with verified local experts (Plumbers, Electricians, Painters, etc.) in minutes.


##  Live Demo
- **Frontend**: [Deployed on Vercel](https://hirelocal-gilt.vercel.app/)
- **Backend**: [Deployed on Render](https://hirelocal-api.onrender.com)
- **Database**: Hosted on Supabase (PostgreSQL)

---

##  Key Features
- **Smart Search**: Find experts by Pincode and Service Category (Electrician, Plumber, etc.).
- **Dual Dashboards**: Dedicated interfaces for Customers (to manage bookings) and Workers (to manage jobs and earnings).
- **Real-time Stats**: Track total earnings, average ratings, and active job counts.
- **Premium UI/UX**: Modern dark/light mode support, smooth animations, and glassmorphism design.
- **Verified Profiles**: Professional bios, hourly rates, and verified experience years.
- **Review System**: Customers can leave feedback and star ratings after job completion.

---

##  Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Lucide Icons, Shadcn/UI.
- **Backend**: Node.js, Express.js, PostgreSQL (pg).
- **Database**: Supabase (Managed PostgreSQL).
- **Auth**: JSON Web Tokens (JWT) & Bcrypt for secure password hashing.
- **State Management**: React Context API (Auth & Theme).

---

##  Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/AV-016/hirelocal-.git
cd hirelocal-
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_random_secret_key
```
Run the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env.local` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Run the application:
```bash
npm run dev
```

---

##  Deployment

### Backend (Render/Railway)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add `DATABASE_URL` and `JWT_SECRET` to environment variables.

### Frontend (Vercel)
- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Add `NEXT_PUBLIC_API_URL` (pointing to your live backend) to environment variables.

---

##  License
This project is licensed under the MIT License.

