import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useEffect } from 'react';

const ContextConnector = () => {
  const { setDataInitializer } = useAuth();
  const { initializeUserData } = useData();

  useEffect(() => {
    // Connect the DataContext's initializeUserData function to AuthContext
    if (setDataInitializer && initializeUserData) {
      setDataInitializer(initializeUserData);
    }
  }, [setDataInitializer, initializeUserData]);

  return null; // This component doesn't render anything
};

export default ContextConnector; 