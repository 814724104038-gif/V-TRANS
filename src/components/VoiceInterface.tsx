/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceInterfaceProps {
  onCommand: (command: string) => void;
  isProcessing?: boolean;
  lastResponse?: string;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  onCommand, 
  isProcessing = false,
  lastResponse 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleResult = useCallback((text: string) => {
    setTranscript(text);
    setIsListening(false);
    onCommand(text.toLowerCase());
  }, [onCommand]);

  const handleError = useCallback((err: string) => {
    setError(err);
    setIsListening(false);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setError(null);
      setTranscript('');
      setIsListening(true);
      voiceService.startListening(handleResult, handleError);
    }
  };

  useEffect(() => {
    if (lastResponse) {
      voiceService.speak(lastResponse);
    }
  }, [lastResponse]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-auto">
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
            isListening ? "bg-red-500 shadow-lg shadow-red-200" : "bg-blue-600 shadow-lg shadow-blue-200",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
          disabled={isProcessing}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 text-white animate-pulse" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
          
          {isListening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full border-4 border-red-400"
            />
          )}
        </motion.button>
      </div>

      <div className="mt-8 text-center w-full">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {isListening ? "Listening..." : isProcessing ? "Processing..." : "Tap to Speak"}
        </h3>
        
        <AnimatePresence mode="wait">
          {transcript && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-600 italic mb-4"
            >
              "{transcript}"
            </motion.p>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {isProcessing && (
          <div className="flex justify-center mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Try saying:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• "Book bus to Chennai"</li>
            <li>• "Show available transport"</li>
            <li>• "View my bookings"</li>
            <li>• "Cancel booking"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
