import React, { useEffect, useRef } from 'react';
import { AnimationController } from '@/utils/animations';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      AnimationController.respectMotionPreference(() => {
        AnimationController.pageTransition(true);
      });
    }
  }, []);

  return (
    <div 
      ref={pageRef}
      className={`page-content opacity-0 ${className}`}
      style={{ transform: 'translateY(30px)' }}
    >
      {children}
    </div>
  );
};

export default PageTransition;