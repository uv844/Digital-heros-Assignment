import React from 'react';
import AdminDrawManager from '../components/AdminDrawManager';
import { motion } from 'motion/react';

const AdminDraws: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Draw Management</h1>
        <p className="text-gray-500">Configure and execute monthly draws, manage winning numbers.</p>
      </header>
      
      <AdminDrawManager />
    </motion.div>
  );
};

export default AdminDraws;
