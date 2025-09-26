import anime from 'animejs';

// Animation utility functions using Anime.js
export class AnimationController {
  
  // Hero section entrance animation
  static heroEntrance() {
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      duration: 1200
    });

    timeline
      .add({
        targets: '.hero-badge',
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.8, 1],
        duration: 800
      })
      .add({
        targets: '.hero-title-line',
        opacity: [0, 1],
        translateX: [-50, 0],
        duration: 600,
        delay: anime.stagger(200)
      }, '-=600')
      .add({
        targets: '.hero-subtitle',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600
      }, '-=400')
      .add({
        targets: '.hero-buttons',
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.9, 1],
        duration: 800
      }, '-=200')
      .add({
        targets: '.floating-fruit',
        opacity: [0, 0.8],
        translateY: [50, 0],
        rotate: [0, 360],
        duration: 1000,
        delay: anime.stagger(150)
      }, '-=800');
  }

  // Floating fruits continuous animation
  static floatingFruits() {
    anime({
      targets: '.floating-fruit',
      translateY: [
        { value: -20, duration: 3000 },
        { value: 20, duration: 3000 }
      ],
      rotate: [
        { value: 10, duration: 2000 },
        { value: -10, duration: 2000 }
      ],
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine',
      delay: anime.stagger(200)
    });
  }

  // Product cards scroll animation
  static productCardsOnScroll(elements: NodeListOf<Element>) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.9, 1],
            duration: 800,
            easing: 'easeOutBack',
            delay: anime.stagger(100)
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  // Button hover animations
  static buttonHover(element: HTMLElement) {
    anime({
      targets: element,
      scale: [1, 1.05],
      backgroundColor: ['#f59e0b', '#d97706'],
      duration: 300,
      easing: 'easeOutQuart'
    });
  }

  static buttonHoverOut(element: HTMLElement) {
    anime({
      targets: element,
      scale: [1.05, 1],
      backgroundColor: ['#d97706', '#f59e0b'],
      duration: 300,
      easing: 'easeOutQuart'
    });
  }

  // Add to cart animation
  static addToCart(button: HTMLElement) {
    const timeline = anime.timeline({
      easing: 'easeOutBack'
    });

    timeline
      .add({
        targets: button,
        scale: [1, 1.2],
        rotate: [0, 15],
        duration: 200
      })
      .add({
        targets: button,
        scale: [1.2, 1],
        rotate: [15, 0],
        backgroundColor: ['#10b981', '#059669'],
        duration: 400
      })
      .add({
        targets: button.querySelector('.cart-icon'),
        translateX: [0, 10, 0],
        duration: 300
      }, '-=200');
  }

  // Page transition animation
  static pageTransition(entering: boolean = true) {
    if (entering) {
      anime({
        targets: '.page-content',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        easing: 'easeOutExpo'
      });
    } else {
      return anime({
        targets: '.page-content',
        opacity: [1, 0],
        translateY: [0, -30],
        duration: 400,
        easing: 'easeInExpo'
      }).finished;
    }
  }

  // Fruit selection animation
  static fruitSelection(selectedElement: HTMLElement, allElements: NodeListOf<Element>) {
    // Animate out all elements
    anime({
      targets: allElements,
      scale: [1, 0.9],
      opacity: [1, 0.6],
      duration: 200,
      easing: 'easeOutQuart'
    });

    // Animate in selected element
    anime({
      targets: selectedElement,
      scale: [0.9, 1.1],
      opacity: [0.6, 1],
      duration: 400,
      easing: 'easeOutBack',
      complete: () => {
        anime({
          targets: selectedElement,
          scale: [1.1, 1],
          duration: 200,
          easing: 'easeOutQuart'
        });
      }
    });
  }

  // Loading animation
  static loading(element: HTMLElement) {
    anime({
      targets: element,
      rotate: '1turn',
      duration: 1000,
      loop: true,
      easing: 'linear'
    });
  }

  // Stagger animation for lists
  static staggerIn(elements: NodeListOf<Element> | Element[]) {
    anime({
      targets: elements,
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      delay: anime.stagger(100),
      easing: 'easeOutExpo'
    });
  }

  // Cart item animation
  static cartItemAdd() {
    anime({
      targets: '.cart-notification',
      opacity: [0, 1],
      scale: [0.3, 1],
      translateY: [-20, 0],
      duration: 400,
      easing: 'easeOutBack'
    });
  }

  // Mobile-optimized animations
  static isMobile() {
    return window.innerWidth < 768;
  }

  static mobileOptimizedAnimation(targets: any, desktopProps: any, mobileProps?: any) {
    const props = this.isMobile() && mobileProps ? mobileProps : desktopProps;
    return anime({
      targets,
      ...props
    });
  }

  // Respect prefers-reduced-motion
  static shouldAnimate() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static respectMotionPreference(animationFn: () => void, fallbackFn?: () => void) {
    if (this.shouldAnimate()) {
      animationFn();
    } else if (fallbackFn) {
      fallbackFn();
    }
  }
}

// Export individual functions for convenience
export const {
  heroEntrance,
  floatingFruits,
  productCardsOnScroll,
  buttonHover,
  buttonHoverOut,
  addToCart,
  pageTransition,
  fruitSelection,
  loading,
  staggerIn,
  cartItemAdd,
  mobileOptimizedAnimation,
  respectMotionPreference
} = AnimationController;