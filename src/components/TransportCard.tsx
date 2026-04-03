/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bus, Train, Plane, MapPin, Calendar, Clock, Users, CreditCard } from 'lucide-react';
import { Transport, TransportType } from '../types';
import { cn } from '../lib/utils';

interface TransportCardProps {
  transport: Transport;
  onBook?: (transport: Transport) => void;
  isBooking?: boolean;
}

export const TransportCard: React.FC<TransportCardProps> = ({ 
  transport, 
  onBook,
  isBooking = false 
}) => {
  const Icon = transport.type === TransportType.BUS ? Bus : 
               transport.type === TransportType.TRAIN ? Train : Plane;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl",
              transport.type === TransportType.BUS ? "bg-blue-100 text-blue-600" :
              transport.type === TransportType.TRAIN ? "bg-green-100 text-green-600" :
              "bg-purple-100 text-purple-600"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{transport.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{transport.type}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-blue-600">₹{transport.price}</p>
            <p className="text-xs text-gray-400">per person</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div className="text-sm">
              <p className="text-gray-400 text-xs uppercase font-bold">From</p>
              <p className="font-semibold text-gray-700">{transport.from}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div className="text-sm">
              <p className="text-gray-400 text-xs uppercase font-bold">To</p>
              <p className="font-semibold text-gray-700">{transport.to}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div className="text-sm">
              <p className="text-gray-400 text-xs uppercase font-bold">Departure</p>
              <p className="font-semibold text-gray-700">{transport.departure}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="text-sm">
              <p className="text-gray-400 text-xs uppercase font-bold">Seats</p>
              <p className="font-semibold text-gray-700">{transport.availableSeats} Left</p>
            </div>
          </div>
        </div>

        {onBook && (
          <button
            onClick={() => onBook(transport)}
            disabled={isBooking || transport.availableSeats === 0}
            className={cn(
              "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300",
              transport.availableSeats === 0 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-100"
            )}
          >
            {isBooking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Book Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
