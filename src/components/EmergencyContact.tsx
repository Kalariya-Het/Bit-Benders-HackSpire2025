
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellRing, X } from 'lucide-react';

interface EmergencyContactProps {
  name: string;
  phone: string;
  onSave: (name: string, phone: string) => void;
  onCancel: () => void;
}

const EmergencyContact: React.FC<EmergencyContactProps> = ({
  name,
  phone,
  onSave,
  onCancel
}) => {
  const [contactName, setContactName] = useState(name);
  const [contactPhone, setContactPhone] = useState(phone);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSave = () => {
    if (!contactName || !contactPhone) return;
    
    // Simulate message sending
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);
      onSave(contactName, contactPhone);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  const handleEmergencyAlert = () => {
    if (!contactName || !contactPhone) return;
    
    // Simulate message sending
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  if (showSuccess) {
    return (
      <Alert className="bg-green-100 border-green-300">
        <BellRing className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-800">
          {isSending ? 'Sending alert message...' : 'Emergency contact has been alerted.'}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="p-4 bg-white/70 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-mosaic-900">Emergency Contact</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="contactName" className="text-sm text-mosaic-700">Contact Name</label>
          <Input 
            id="contactName"
            value={contactName} 
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Enter name" 
            className="w-full mt-1"
          />
        </div>
        
        <div>
          <label htmlFor="contactPhone" className="text-sm text-mosaic-700">Phone Number</label>
          <Input 
            id="contactPhone"
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Enter phone number" 
            className="w-full mt-1"
          />
        </div>
        
        <div className="pt-2 flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={!contactName || !contactPhone || isSending}
            className="flex-1 bg-mosaic-600 hover:bg-mosaic-700"
          >
            Save Contact
          </Button>
          
          <Button 
            onClick={handleEmergencyAlert}
            disabled={!contactName || !contactPhone || isSending}
            variant="destructive"
            className="flex items-center gap-1"
          >
            <Bell className="h-4 w-4" />
            Alert Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContact;
