'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Monitor, 
  Shield, 
  Bell, 
  MapPin, 
  CreditCard,
  Save,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, refreshUser, token } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)

  // Form states (pre-populated with user data)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    pincode: user?.pincode || '',
    bio: user?.bio || '',
    hourly_rate: user?.hourly_rate || 0,
    skill: user?.skill || ''
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          hourly_rate: formData.hourly_rate
        })
      })

      if (response.ok) {
        await refreshUser()
        toast.success('Settings updated successfully!', {
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
        })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update settings')
      }
    } catch (err) {
      toast.error('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="relative min-h-[calc(100vh-4rem)]">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-primary rounded-full bg-blob translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-500 rounded-full bg-blob -translate-x-1/2 translate-y-1/2" />

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight text-foreground">Settings</h1>
            <p className="mt-2 text-muted-foreground">Manage your account preferences and profile details.</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-card border border-border p-1 rounded-2xl h-12">
              <TabsTrigger value="profile" className="rounded-xl px-6 gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="appearance" className="rounded-xl px-6 gap-2">
                <Moon className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="account" className="rounded-xl px-6 gap-2">
                <SettingsIcon className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="animate-slide-up">
              <Card className="rounded-3xl border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>This information will be displayed to {user?.role === 'worker' ? 'customers' : 'experts'}.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    {user?.role === 'worker' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="skill">Expertise</Label>
                            <Input 
                              id="skill" 
                              value={formData.skill} 
                              disabled
                              className="rounded-xl bg-muted"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rate">Hourly Rate (₹)</Label>
                            <Input 
                              id="rate" 
                              type="number"
                              value={formData.hourly_rate} 
                              onChange={e => setFormData({...formData, hourly_rate: parseInt(e.target.value)})}
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Professional Bio</Label>
                          <Textarea 
                            id="bio" 
                            rows={4}
                            value={formData.bio} 
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            className="rounded-xl resize-none"
                            placeholder="Tell customers about your experience and services..."
                          />
                        </div>
                      </>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isSaving} className="rounded-xl gap-2 px-8 shadow-lg shadow-primary/20">
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="animate-slide-up">
              <Card className="rounded-3xl border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Theme Preferences</CardTitle>
                  <CardDescription>Choose how HireLocal looks to you.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/20'}`}
                    >
                      <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <Sun className="h-6 w-6 text-amber-600" />
                      </div>
                      <span className="font-bold">Light</span>
                    </button>
                    
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/20'}`}
                    >
                      <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <Moon className="h-6 w-6 text-slate-200" />
                      </div>
                      <span className="font-bold">Dark</span>
                    </button>

                    <button 
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/20'}`}
                    >
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <span className="font-bold">System</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings */}
            <TabsContent value="account" className="animate-slide-up">
               <div className="space-y-6">
                  <Card className="rounded-3xl border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                          <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-card">
                                <MapPin className="h-5 w-5 text-primary" />
                             </div>
                             <div>
                                <p className="text-sm font-bold">Primary Location</p>
                                <p className="text-xs text-muted-foreground">Used to find nearby {user?.role === 'worker' ? 'jobs' : 'experts'}</p>
                             </div>
                          </div>
                          <span className="font-black text-foreground">{user?.pincode}</span>
                       </div>

                       <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                          <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-card">
                                <Shield className="h-5 w-5 text-blue-500" />
                             </div>
                             <div>
                                <p className="text-sm font-bold">Account Security</p>
                                <p className="text-xs text-muted-foreground">Two-factor authentication and passwords</p>
                             </div>
                          </div>
                          <Button variant="ghost" size="sm" className="font-bold text-primary">Manage</Button>
                       </div>

                       <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                          <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-card">
                                <CreditCard className="h-5 w-5 text-green-500" />
                             </div>
                             <div>
                                <p className="text-sm font-bold">Payment Methods</p>
                                <p className="text-xs text-muted-foreground">Linked cards and billing history</p>
                             </div>
                          </div>
                          <Button variant="ghost" size="sm" className="font-bold text-primary">View</Button>
                       </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-destructive/20 bg-destructive/5">
                    <CardHeader>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-destructive/80 mb-4">Permanently delete your account and all your data. This action cannot be undone.</p>
                       <Button variant="destructive" className="rounded-xl px-6">Delete Account</Button>
                    </CardContent>
                  </Card>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
