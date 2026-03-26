# Digital Heroes

Digital Heroes is a modern, full-stack golf-based charity subscription platform. It empowers golfers to track their performance, participate in monthly prize draws, and make a real-world impact by supporting world-class charities.

## 🌟 Key Features

### For Users
- **Performance Tracking**: Log and monitor your latest Stableford scores to track your progress.
- **Monthly Prize Draws**: Automatic entry into monthly draws on the first Friday of every month. Match numbers to win shares of the jackpot.
- **Charity Impact**: Select a partner charity to support. 10% of every subscription is donated directly to your chosen cause.
- **Real-time Dashboard**: Instant access to winnings history, subscription status, and upcoming draw information.

### For Administrators
- **Real-time Analytics**: Monitor total users, active subscriptions, and charity/prize pool distributions.
- **User Management**: Comprehensive tools to manage profiles, roles, and subscription statuses.
- **Draw Control**: Execute and publish monthly draws with built-in simulation and verification tools.
- **Charity Partner Management**: Seed and manage charity data and impact descriptions.
- **System Monitoring**: Live activity feed and platform health status.

## 🚀 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend/Database**: Supabase (PostgreSQL, Auth, Real-time)
- **Notifications**: Sonner

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd digital-heroes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

- `src/components/`: Reusable UI components and layout wrappers.
- `src/context/`: React Context providers (Auth, etc.).
- `src/lib/`: Utility libraries and configurations (Supabase client, date utils).
- `src/pages/`: Main application views (Home, Dashboard, Admin, etc.).
- `src/types/`: TypeScript interfaces and enums.
- `src/constants.ts`: Global application constants and mock data.

## 🔒 Security

The platform implements robust security measures:
- **Role-Based Access Control (RBAC)**: Strict separation between user and administrator routes.
- **Secure Authentication**: Powered by Supabase Auth with session persistence.
- **Database Rules**: Row Level Security (RLS) ensures users can only access their own data.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
