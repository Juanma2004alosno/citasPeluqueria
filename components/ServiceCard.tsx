import React from 'react';
import { Service } from '../types';
import { Clock, Euro } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isSelected, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(service)}
      className={`
        cursor-pointer rounded-xl border-2 p-6 transition-all duration-200
        ${isSelected 
          ? 'border-amber-600 bg-amber-50 shadow-lg scale-105' 
          : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-md'
        }
      `}
    >
      <h3 className="font-bold text-xl text-stone-800 mb-2">{service.name}</h3>
      <p className="text-stone-600 text-sm mb-4 h-10 line-clamp-2">{service.description}</p>
      
      <div className="flex items-center justify-between text-stone-700 font-medium">
        <div className="flex items-center gap-1">
          <Clock size={16} className="text-amber-600" />
          <span>{service.durationMinutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Euro size={16} className="text-amber-600" />
          <span>{service.price}</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;