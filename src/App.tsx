/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  updateDoc, 
  doc, 
  orderBy,
  deleteDoc
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Transport, Booking, UserProfile, TransportType } from './types';
import { VoiceInterface } from './components/VoiceInterface';
import { TransportCard } from './components/TransportCard';
import { BookingList } from './components/BookingList';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  LayoutDashboard, 
  Bus, 
  History, 
  Settings, 
  LogOut, 
  LogIn, 
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
  Mic
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'admin'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Simple role check - in a real app this would be in Firestore
        setProfile({
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'User',
          role: currentUser.email === '814724104038@trp.srmtrichy.edu.in' ? 'admin' : 'user'
        });
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Transports
  useEffect(() => {
    const q = query(collection(db, 'transports'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transport));
      setTransports(data);
    });
    return () => unsubscribe();
  }, []);

  // Fetch User Bookings
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid), orderBy('bookingDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const bookTransport = async (transport: Transport) => {
    if (!user) {
      setLastResponse("Please login to book a transport.");
      return;
    }

    if (transport.availableSeats <= 0) {
      setLastResponse("Sorry, no seats available for this transport.");
      return;
    }

    setIsBooking(transport.id);
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        transportId: transport.id,
        transportName: transport.name,
        transportType: transport.type,
        from: transport.from,
        to: transport.to,
        departure: transport.departure,
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
      });

      await updateDoc(doc(db, 'transports', transport.id), {
        availableSeats: transport.availableSeats - 1
      });

      setLastResponse(`Successfully booked ${transport.name} to ${transport.to}.`);
    } catch (error) {
      console.error("Booking failed", error);
      setLastResponse("Booking failed. Please try again.");
    } finally {
      setIsBooking(null);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setIsCancelling(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled'
      });

      const transport = transports.find(t => t.id === booking.transportId);
      if (transport) {
        await updateDoc(doc(db, 'transports', transport.id), {
          availableSeats: transport.availableSeats + 1
        });
      }

      setLastResponse(`Your booking for ${booking.transportName} has been cancelled.`);
    } catch (error) {
      console.error("Cancellation failed", error);
      setLastResponse("Cancellation failed. Please try again.");
    } finally {
      setIsCancelling(null);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    // Simple command parsing
    if (command.includes('book bus') || command.includes('book a bus')) {
      const destination = command.split('to ')[1];
      if (destination) {
        const available = transports.find(t => 
          t.type === TransportType.BUS && 
          t.to.toLowerCase().includes(destination.toLowerCase()) &&
          t.availableSeats > 0
        );
        if (available) {
          await bookTransport(available);
        } else {
          setLastResponse(`Sorry, I couldn't find any available buses to ${destination}.`);
        }
      } else {
        setLastResponse("Which destination would you like to book for?");
        setActiveTab('home');
      }
    } 
    else if (command.includes('show available') || command.includes('available transport')) {
      setActiveTab('home');
      setLastResponse("Here are the available transport options.");
    }
    else if (command.includes('view my bookings') || command.includes('my bookings')) {
      setActiveTab('bookings');
      setLastResponse(`You have ${bookings.filter(b => b.status === 'confirmed').length} active bookings.`);
    }
    else if (command.includes('cancel booking')) {
      setActiveTab('bookings');
      setLastResponse("Please select a booking to cancel from your list.");
    }
    else if (command.includes('admin') || command.includes('dashboard')) {
      if (profile?.role === 'admin') {
        setActiveTab('admin');
        setLastResponse("Opening admin dashboard.");
      } else {
        setLastResponse("Access denied. You are not an admin.");
      }
    }
    else {
      setLastResponse("I'm sorry, I didn't catch that. Try commands like 'Book bus to Chennai' or 'View my bookings'.");
    }

    setIsProcessing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bus className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Voice Transport</h1>
          <p className="text-gray-500 mb-8">Manage your travel with simple voice commands. Quick, easy, and hands-free.</p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Developed by</p>
            <div className="flex justify-center gap-4 text-sm font-medium text-gray-600">
              <span>Divya V</span>
              <span>Divyadharshini R</span>
              <span>Durgasri G</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-100 transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl text-gray-900">V-Trans</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={LayoutDashboard} 
            label="Available" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={History} 
            label="My Bookings" 
            active={activeTab === 'bookings'} 
            onClick={() => setActiveTab('bookings')}
            collapsed={!isSidebarOpen}
          />
          {profile?.role === 'admin' && (
            <NavItem 
              icon={ShieldCheck} 
              label="Admin Panel" 
              active={activeTab === 'admin'} 
              onClick={() => setActiveTab('admin')}
              collapsed={!isSidebarOpen}
            />
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-2xl bg-gray-50",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-5 h-5 text-blue-600" />
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 p-3 mt-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Voice System Active
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tab Content */}
            <div className="lg:col-span-2 space-y-8">
              <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {transports.map(t => (
                      <TransportCard 
                        key={t.id} 
                        transport={t} 
                        onBook={bookTransport}
                        isBooking={isBooking === t.id}
                      />
                    ))}
                  </motion.div>
                )}

                {activeTab === 'bookings' && (
                  <motion.div
                    key="bookings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <BookingList 
                      bookings={bookings} 
                      onCancel={cancelBooking}
                      isCancelling={isCancelling}
                    />
                  </motion.div>
                )}

                {activeTab === 'admin' && profile?.role === 'admin' && (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AdminDashboard 
                      transports={transports}
                      onAdd={async (t) => {
                        await addDoc(collection(db, 'transports'), t);
                      }}
                      onDelete={async (id) => {
                        await deleteDoc(doc(db, 'transports', id));
                      }}
                      onUpdate={async (id, data) => {
                        await updateDoc(doc(db, 'transports', id), data);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice Control Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-0">
                <VoiceInterface 
                  onCommand={handleVoiceCommand}
                  isProcessing={isProcessing}
                  lastResponse={lastResponse}
                />
                
                <div className="mt-8 bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100">
                  <h4 className="text-xl font-black mb-4">Quick Help</h4>
                  <p className="text-blue-100 text-sm mb-6">You can use your voice to control almost everything in the system.</p>
                  <div className="space-y-4">
                    <HelpItem command="Book bus to Chennai" />
                    <HelpItem command="Show available transport" />
                    <HelpItem command="View my bookings" />
                    <HelpItem command="Cancel booking" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ icon: Icon, label, active, onClick, collapsed }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all duration-300",
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
      collapsed && "justify-center p-4"
    )}
  >
    <Icon className="w-5 h-5" />
    {!collapsed && <span>{label}</span>}
  </button>
);

const HelpItem = ({ command }: { command: string }) => (
  <div className="flex items-center gap-3 bg-blue-500/30 p-3 rounded-xl border border-blue-400/30">
    <Mic className="w-4 h-4 text-blue-200" />
    <span className="text-sm font-medium">"{command}"</span>
  </div>
);
