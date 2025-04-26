
import React, { useEffect, useState } from 'react';

interface WaveVisualizerProps {
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const WaveVisualizer: React.FC<WaveVisualizerProps> = ({ 
  isActive, 
  size = 'md' 
}) => {
  const [bars, setBars] = useState<number[]>([]);
  
  useEffect(() => {
    // Create 16 bars with random heights
    const numberOfBars = 16;
    if (isActive) {
      const interval = setInterval(() => {
        const newBars = Array.from({ length: numberOfBars }, () => 
          Math.floor(Math.random() * 80) + 10
        );
        setBars(newBars);
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setBars(Array(numberOfBars).fill(10));
    }
  }, [isActive]);
  
  const sizeClasses = {
    sm: 'h-16',
    md: 'h-24',
    lg: 'h-32'
  };
  
  return (
    <div className={`flex items-end justify-center ${sizeClasses[size]} w-full`}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={`voice-bar transition-all duration-100 ease-in-out ${isActive ? 'bg-mosaic-500' : 'bg-muted-foreground'}`}
          style={{ 
            height: `${isActive ? height : 5}%`,
            animationDelay: `${index * 0.05}s`
          }}
        />
      ))}
    </div>
  );
};

export default WaveVisualizer;
