import React from 'react';
import AdminUserManager from '../components/AdminUserManager';
import { motion } from 'motion/react';

const AdminUsers: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">User Management</h1>
        <p className="text-gray-500">Manage platform users and their subscription statuses.</p>
      </header>
      
      <AdminUserManager />
    </motion.div>
  );
};

export default AdminUsers;
