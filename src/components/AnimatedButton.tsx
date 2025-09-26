import React, { useRef } from 'react';
import { Button as ShadcnButton, ButtonProps } from '@/components/ui/button';
import { AnimationController } from '@/utils/animations';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'hover' | 'pulse' | 'bounce' | 'glow';
  onAnimatedClick?: (e: React.MouseEvent) => void;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, animationType = 'hover', onAnimatedClick, children, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      
      const target = buttonRef.current || (ref as React.RefObject<HTMLButtonElement>)?.current;
      
      if (target) {
        AnimationController.respectMotionPreference(() => {
          switch (animationType) {
            case 'pulse':
              AnimationController.mobileOptimizedAnimation(target, {
                scale: [1, 1.1, 1],
                duration: 300,
                easing: 'easeOutBack'
              });
              break;
            case 'bounce':
              AnimationController.mobileOptimizedAnimation(target, {
                translateY: [0, -5, 0],
                scale: [1, 1.05, 1],
                duration: 400,
                easing: 'easeOutBounce'
              });
              break;
            case 'glow':
              AnimationController.mobileOptimizedAnimation(target, {
                boxShadow: [
                  '0 0 0 rgba(245, 158, 11, 0)',
                  '0 0 20px rgba(245, 158, 11, 0.4)',
                  '0 0 0 rgba(245, 158, 11, 0)'
                ],
                duration: 600,
                easing: 'easeOutQuart'
              });
              break;
            default:
              AnimationController.mobileOptimizedAnimation(target, {
                scale: [1, 0.95, 1],
                duration: 150,
                easing: 'easeOutQuart'
              });
          }
        });
      }

      // Call the custom click handler
      if (onAnimatedClick) {
        onAnimatedClick(e);
      }
      
      // Call the original onClick if provided
      if (props.onClick) {
        props.onClick(e);
      }
    };

    const handleMouseEnter = () => {
      const target = buttonRef.current || (ref as React.RefObject<HTMLButtonElement>)?.current;
      
      if (target && animationType === 'hover') {
        AnimationController.respectMotionPreference(() => {
          AnimationController.buttonHover(target);
        });
      }
    };

    const handleMouseLeave = () => {
      const target = buttonRef.current || (ref as React.RefObject<HTMLButtonElement>)?.current;
      
      if (target && animationType === 'hover') {
        AnimationController.respectMotionPreference(() => {
          AnimationController.buttonHoverOut(target);
        });
      }
    };

    return (
      <ShadcnButton
        ref={ref || buttonRef}
        className={cn('transition-all duration-300', className)}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </ShadcnButton>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;