import React from 'react';
import AdminCharityManager from '../components/AdminCharityManager';
import { motion } from 'motion/react';

const AdminCharities: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Charity Partners</h1>
        <p className="text-gray-500">Manage charity organizations, their details, and their impact.</p>
      </header>
      
      <AdminCharityManager />
    </motion.div>
  );
};

export default AdminCharities;
