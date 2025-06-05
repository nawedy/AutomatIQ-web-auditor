// components/ui/rolling-carousel.tsx
// A responsive carousel component that rolls through cards with customizable colors

import React from 'react';
import styled from 'styled-components';

interface CarouselItem {
  id: string | number;
  color?: string;
  imageUrl?: string;
}

interface RollingCarouselProps {
  items?: CarouselItem[];
  autoRotate?: boolean;
  rotationSpeed?: number;
}

const RollingCarousel: React.FC<RollingCarouselProps> = ({ 
  items = [], 
  autoRotate = true,
  rotationSpeed = 5000
}) => {
  // Default colors if none provided
  const defaultColors = [
    '142, 249, 252', '142, 252, 204', '142, 252, 157', '215, 252, 142',
    '252, 252, 142', '252, 208, 142', '252, 142, 142', '252, 142, 239',
    '204, 142, 252', '142, 145, 252'
  ];

  // Use provided items or create default items
  const carouselItems: CarouselItem[] = items.length > 0 ? items : Array.from({ length: 10 }, (_, i) => ({
    id: i,
    color: defaultColors[i],
    imageUrl: undefined
  }));

  // Auto-rotation effect
  React.useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      const wrapper = document.querySelector('.wrapper') as HTMLElement;
      if (wrapper) {
        wrapper.style.setProperty('--offset', (parseInt(wrapper.style.getPropertyValue('--offset') || '0') + 1) % carouselItems.length + '');
      }
    }, rotationSpeed);
    
    return () => clearInterval(interval);
  }, [autoRotate, rotationSpeed, carouselItems.length]);

  return (
    <StyledWrapper>
      <div className="wrapper">
        <div className="inner" style={{"--quantity": carouselItems.length} as React.CSSProperties}>
          {carouselItems.map((item, index) => (
            <div 
              key={item.id} 
              className="card" 
              style={{
                "--index": index, 
                "--colorCard": item.color || defaultColors[index % defaultColors.length]
              } as React.CSSProperties}
            >
              <div 
                className="img" 
                style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined} 
              />
            </div>
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-style: preserve-3d;
    perspective: 500px;
    --offset: 0;
  }
  
  .inner {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: translateZ(-30vw) rotateY(calc(var(--offset) * (360deg / var(--quantity))));
    transition: transform 0.5s ease-in-out;
  }

  .card {
    position: absolute;
    top: 0;
    left: 0;
    width: 25vw;
    height: 80%;
    max-width: 300px;
    max-height: 400px;
    border-radius: 1rem;
    transform-style: preserve-3d;
    transform: 
      rotateY(calc(var(--index) * (360deg / var(--quantity))))
      translateZ(30vw);
    filter: drop-shadow(0 20px 25px rgb(0 0 0 / 0.15));
    background: rgba(var(--colorCard), 0.8);
    transition: all 0.3s ease;
    overflow: hidden;
    
    &:hover {
      transform: 
        rotateY(calc(var(--index) * (360deg / var(--quantity))))
        translateZ(32vw);
      background: rgba(var(--colorCard), 1);
    }
    
    .img {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
    }
  }
  
  @media (max-width: 768px) {
    height: 200px;
    
    .card {
      width: 40vw;
      height: 70%;
    }
  }
`;


export default RollingCarousel;

