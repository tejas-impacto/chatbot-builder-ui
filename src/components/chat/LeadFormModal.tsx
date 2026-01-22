import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { UserInfo } from '@/types/chat';

interface LeadFormModalProps {
  onSubmit: (userInfo: UserInfo) => void;
  isLoading?: boolean;
  chatbotName?: string;
}

const LeadFormModal = ({ onSubmit, isLoading, chatbotName }: LeadFormModalProps) => {
  const [formData, setFormData] = useState<UserInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<UserInfo>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<UserInfo> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      ...formData,
      lastName: formData.lastName || undefined,
      phone: formData.phone || undefined,
    });
  };

  const handleChange = (field: keyof UserInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {chatbotName ? `Welcome to ${chatbotName}!` : 'Welcome!'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Please provide your details to start chatting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            className={errors.firstName ? 'border-destructive' : ''}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange('email')}
            className={errors.email ? 'border-destructive' : ''}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={formData.phone}
            onChange={handleChange('phone')}
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            'Start Chat'
          )}
        </Button>
      </form>
    </div>
  );
};

export default LeadFormModal;
