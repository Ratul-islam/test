"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface StepGuide {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  mobilePosition?: 'top' | 'bottom' | 'left' | 'right'; 
}

interface TattooGuidanceSystemProps {
  onComplete: () => void;
  isFirstVisit: boolean;
}

const TattooGuidanceSystem: React.FC<TattooGuidanceSystemProps> = ({ onComplete, isFirstVisit }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true); 
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const steps: StepGuide[] = useMemo(() => [
    {
      target: 'guidance-upload-box',
      title: 'Upload Your Designs',
      content: 'Start by uploading your tattoo designs here. Click this area or drag your image files to upload.',
      position: 'bottom',
      mobilePosition: 'top' 
    },
    {
      target: 'guidance-designs-gallery',
      title: 'Select Your Design',
      content: 'Browse your uploaded tattoo designs here. Click on any design to select it for placement on the 3D model.',
      position: 'top',
      mobilePosition: 'top' 
    },
    {
      target: 'guidance-design-controls',
      title: 'Adjust Your Tattoo',
      content: 'After selecting a design, use these controls to adjust the size and rotation of your tattoo for perfect placement.',
      position: 'right',
      mobilePosition: 'top' 
    },
    {
      target: 'guidance-size-control',
      title: 'Resize Tattoo',
      content: 'Drag this slider to make your tattoo design larger or smaller. Adjust it until the size feels right for your placement.',
      position: 'right',
      mobilePosition: 'top' 
    },
    {
      target: 'guidance-rotation-control',
      title: 'Rotate Tattoo',
      content: 'Use this slider to rotate your tattoo design from 0° to 360°. Find the perfect angle for your placement.',
      position: 'right',
      mobilePosition: 'top' 
    },
    {
      target: 'guidance-description',
      title: 'Add Description',
      content: 'Provide details about your tattoo request here. Be specific about style, colors, and any special instructions.',
      position: 'top',
      mobilePosition: 'top' 
    },
    {
      target: 'tattooStyle',
      title: 'Select Tattoo Style',
      content: 'Choose a tattoo style from the dropdown menu. This will help filter artists who specialize in your preferred style.',
      position: 'right',
      mobilePosition: 'top' 
    },
    {
      target: 'tattooArtist',
      title: 'Choose Your Artist',
      content: 'Select an artist who specializes in your chosen style. Each artist has their own pricing and availability.',
      position: 'right',
      mobilePosition: 'top' 
    },
    {
      target: 'guidance-price-estimate',
      title: 'Price Estimation',
      content: 'After providing all the details, click here to calculate the estimated price based on the size and complexity of your design.',
      position: 'right',
      mobilePosition: 'bottom'
    }
  ], []);

  const positionTooltip = useCallback(() => {
    setCurrentStep(prev => prev);
  }, []);

  const highlightElement = useCallback((targetId: string) => {
    document.querySelectorAll('.guidance-highlight').forEach(el => {
      el.classList.remove('guidance-highlight', 'ring-4', 'ring-blue-500', 'ring-opacity-70', 'z-20');
      (el as HTMLElement).style.backgroundColor = '';
    });
  
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.classList.add('guidance-highlight', 'ring-4', 'ring-blue-500', 'ring-opacity-70', 'z-20');
      targetElement.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
      
      const rect = targetElement.getBoundingClientRect();
      const extraPadding = isMobile ? 180 : 100; 
      
      const isInViewport = (
        rect.top >= extraPadding && 
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight - extraPadding) && 
        rect.right <= window.innerWidth
      );
      
      if (!isInViewport) {
        const scrollOptions: ScrollIntoViewOptions = { 
          behavior: 'smooth', 
          block: isMobile ? 'start' : 'center', 
          inline: 'center' 
        };
        
        targetElement.scrollIntoView(scrollOptions);
        
        setTimeout(() => {
          positionTooltip();
        }, 500);
      } else {
        positionTooltip();
      }
    }
  }, [positionTooltip, isMobile]);

  // Memoized function to complete the guide.
  const completeGuide = useCallback(() => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-5 right-5 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-fadeIn max-w-xs';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="text-sm">Tour completed! You can restart it anytime using the help button.</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
    
    // Clean up highlight effects
    document.querySelectorAll('.guidance-highlight').forEach(el => {
      el.classList.remove('guidance-highlight', 'ring-4', 'ring-blue-500', 'ring-opacity-70', 'z-20');
      (el as HTMLElement).style.backgroundColor = '';
    });
    
    setIsVisible(false);
    onComplete();
  }, [onComplete]);

  const handleNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      highlightElement(steps[currentStep + 1].target);
    } else {
      completeGuide();
    }
  }, [currentStep, steps, highlightElement, completeGuide]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      highlightElement(steps[currentStep - 1].target);
    }
  }, [currentStep, steps, highlightElement]);

  useEffect(() => {
    setPortalContainer(document.body);
    setCurrentStep(0);
    
    if (!isFirstVisit && steps.length > 0) {
      setTimeout(() => {
        highlightElement(steps[0].target);
      }, 100);
    }
  }, [isFirstVisit, steps, highlightElement]);

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  useEffect(() => {
    const checkElementsExist = () => {
      // Skip design control steps if design has not been selected
      const designControlsExist = document.getElementById('guidance-design-controls');
      
      if (!designControlsExist && (currentStep === 2 || currentStep === 3 || currentStep === 4)) {
        // Skip to description step
        setCurrentStep(5);
        highlightElement('guidance-description');
      }
      
      // If price estimate button doesn't exist, complete the guide
      if (currentStep === 8 && !document.getElementById('guidance-price-estimate')) {
        completeGuide();
      }
    };
    
    checkElementsExist();
  }, [currentStep, highlightElement, completeGuide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      if (e.key === 'Escape') {
        completeGuide();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNextStep();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStep();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNextStep, handlePrevStep, completeGuide]);

  useEffect(() => {
    if (isVisible && steps.length > 0) {
      highlightElement(steps[0].target);
    }
    
    return () => {
      document.querySelectorAll('.guidance-highlight').forEach(el => {
        el.classList.remove('guidance-highlight', 'ring-4', 'ring-blue-500', 'ring-opacity-70', 'z-20');
        (el as HTMLElement).style.backgroundColor = '';
      });
    };
  }, [isVisible, steps, highlightElement]);

  if (!isVisible || !portalContainer) return null;

  const currentGuide = steps[currentStep];
  const targetElement = document.getElementById(currentGuide.target);
  
  if (!targetElement) return null;
  
  const targetRect = targetElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50
  };
  
  const tooltipWidth = isMobile ? Math.min(viewportWidth - 40, 280) : 250;
  const tooltipHeight = isMobile ? 160 : 150;
  const spacing = isMobile ? 15 : 15;
  
  const position = (isMobile && currentGuide.mobilePosition) ? currentGuide.mobilePosition : currentGuide.position;
  
  const safeAreaTop = isMobile ? 70 : 20;
  const safeAreaBottom = isMobile ? 120 : 80;
  const safeAreaSides = isMobile ? 20 : 10;
  
  switch (position) {
    case 'top':
      tooltipStyle.bottom = `${viewportHeight - targetRect.top + spacing}px`;
      tooltipStyle.left = `${Math.min(Math.max(targetRect.left + targetRect.width / 2, tooltipWidth/2 + safeAreaSides), viewportWidth - tooltipWidth/2 - safeAreaSides)}px`;
      tooltipStyle.transform = 'translateX(-50%)';
      
      // Ensure tooltip is not too high
      if (viewportHeight - targetRect.top + spacing + tooltipHeight > viewportHeight - safeAreaTop) {
        tooltipStyle.bottom = `${safeAreaTop}px`;
      }
      break;
      
    case 'bottom':
      const initialTopPos = targetRect.bottom + spacing;
      
      if (initialTopPos + tooltipHeight > viewportHeight - safeAreaBottom) {
        tooltipStyle.bottom = `${viewportHeight - targetRect.top + spacing}px`;
        tooltipStyle.top = undefined;
      } else {
        tooltipStyle.top = `${initialTopPos}px`;
      }
      
      tooltipStyle.left = `${Math.min(Math.max(targetRect.left + targetRect.width / 2, tooltipWidth/2 + safeAreaSides), viewportWidth - tooltipWidth/2 - safeAreaSides)}px`;
      tooltipStyle.transform = 'translateX(-50%)';
      break;
      
    case 'left':
      tooltipStyle.top = `${Math.min(Math.max(targetRect.top + targetRect.height / 2, tooltipHeight/2 + safeAreaTop), viewportHeight - tooltipHeight/2 - safeAreaBottom)}px`;
      tooltipStyle.right = `${viewportWidth - targetRect.left + spacing}px`;
      tooltipStyle.transform = 'translateY(-50%)';
      
      if (viewportWidth - targetRect.left + spacing + tooltipWidth > viewportWidth - safeAreaSides) {
        tooltipStyle.right = `${safeAreaSides}px`;
      }
      break;
      
    case 'right':
      // Special handling for price estimation step
      if (currentGuide.target === 'guidance-price-estimate') {
        tooltipStyle.top = `${Math.min(targetRect.top, viewportHeight - tooltipHeight - safeAreaBottom)}px`;
        tooltipStyle.left = `${targetRect.right + spacing}px`;
        tooltipStyle.transform = 'none';
        
        // If tooltip would go off-screen to the right
        if (targetRect.right + spacing + tooltipWidth > viewportWidth - safeAreaSides) {
          tooltipStyle.left = `${targetRect.left - tooltipWidth - spacing}px`;
        }
        
        // If tooltip would be too low
        if (parseFloat(tooltipStyle.top as string) + tooltipHeight > viewportHeight - safeAreaBottom) {
          tooltipStyle.top = `${viewportHeight - tooltipHeight - safeAreaBottom}px`;
        }
        
        break;
      }
      
      // Original right position logic for other steps
      tooltipStyle.top = `${Math.min(Math.max(targetRect.top + targetRect.height / 2, tooltipHeight/2 + safeAreaTop), viewportHeight - tooltipHeight/2 - safeAreaBottom)}px`;
      tooltipStyle.left = `${targetRect.right + spacing}px`;
      tooltipStyle.transform = 'translateY(-50%)';
      
      if (targetRect.right + spacing + tooltipWidth > viewportWidth - safeAreaSides) {
        tooltipStyle.left = undefined;
        tooltipStyle.right = `${safeAreaSides}px`;
      }
      break;
  }

  if (isMobile && targetRect.bottom > viewportHeight - 250) {
    tooltipStyle.top = undefined;
    tooltipStyle.bottom = `${viewportHeight - targetRect.top + spacing}px`;
    
    const estimatedTopPosition = viewportHeight - (parseFloat(tooltipStyle.bottom as string) + tooltipHeight);
    if (estimatedTopPosition < safeAreaTop) {
      tooltipStyle.bottom = `${viewportHeight - safeAreaTop - tooltipHeight}px`;
    }
  }

  if (tooltipStyle.bottom !== undefined && !tooltipStyle.top) {
    const estimatedTopPosition = viewportHeight - (parseFloat(tooltipStyle.bottom as string) + tooltipHeight);
    if (estimatedTopPosition < safeAreaTop) {
      tooltipStyle.bottom = `${viewportHeight - safeAreaTop - tooltipHeight}px`;
    }
  }

  const tooltipMaxWidth = isMobile ? 'calc(100vw - 30px)' : '320px';

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300"
        onClick={completeGuide}
      />

      {/* Guide Tooltip */}
      <div 
        style={{
          ...tooltipStyle,
          maxWidth: tooltipMaxWidth,
          width: isMobile ? 'auto' : undefined
        }}
        className="bg-white rounded-lg shadow-xl p-4 z-50 border-l-4 border-blue-500 animate-fadeIn"
      >
        <h3 className="text-lg font-bold mb-2 text-blue-800">{currentGuide.title}</h3>
        <p className="text-gray-700 mb-4 leading-relaxed text-sm">{currentGuide.content}</p>
        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'}`}>
          <button
            onClick={completeGuide}
            className="text-gray-500 hover:text-gray-900 text-xs"
          >
            Skip tour
          </button>
          <div className={`flex space-x-3 ${isMobile ? 'self-end' : ''}`}>
            {currentStep > 0 && (
              <button
                onClick={handlePrevStep}
                className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNextStep}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
      
      <div className={`fixed ${isMobile ? 'bottom-16' : 'bottom-6'} left-1/2 transform -translate-x-1/2 ${isMobile ? 'w-40' : 'w-64'} bg-gray-200 rounded-full h-2.5 z-50`}>
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </>,
    portalContainer
  );
};

export default TattooGuidanceSystem;