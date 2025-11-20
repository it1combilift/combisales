import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileContentProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function ProfileContent({ user }: ProfileContentProps) {
    const userName = user.name || "";
    const userEmail = user.email || "";
    const [firstName, lastName] = userName.split(" ");

    return (
        <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details and profile information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 w-full">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombre</Label>
                                <Input id="firstName" defaultValue={firstName || ""} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellido</Label>
                                <Input id="lastName" defaultValue={lastName || ""} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue={userEmail} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" placeholder="+1 (555) 123-4567" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">Cargo</Label>
                                <Input id="jobTitle" placeholder="Ej: Gerente de Ventas" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">Empresa</Label>
                                <Input id="company" defaultValue="Combilift Company" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Biografía</Label>
                            <Textarea
                                id="bio"
                                placeholder="Cuéntanos sobre ti..."
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Ubicación</Label>
                            <Input id="location" placeholder="Ej: Madrid, España" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Manage your account preferences and subscription.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base">Account Status</Label>
                                <p className="text-muted-foreground text-sm">Your account is currently active</p>
                            </div>
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                Active
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base">Subscription Plan</Label>
                                <p className="text-muted-foreground text-sm">Pro Plan - $29/month</p>
                            </div>
                            <Button variant="outline">Manage Subscription</Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base">Account Visibility</Label>
                                <p className="text-muted-foreground text-sm">
                                    Make your profile visible to other users
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base">Data Export</Label>
                                <p className="text-muted-foreground text-sm">Download a copy of your data</p>
                            </div>
                            <Button variant="outline">Export Data</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base">Delete Account</Label>
                                <p className="text-muted-foreground text-sm">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage your account security and authentication.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Password</Label>
                                    <p className="text-muted-foreground text-sm">Last changed 3 months ago</p>
                                </div>
                                <Button variant="outline">
                                    <Key className="mr-2 h-4 w-4" />
                                    Change Password
                                </Button>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Two-Factor Authentication</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Add an extra layer of security to your account
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                        Enabled
                                    </Badge>
                                    <Button variant="outline" size="sm">
                                        Configure
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Login Notifications</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Get notified when someone logs into your account
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Active Sessions</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Manage devices that are logged into your account
                                    </p>
                                </div>
                                <Button variant="outline">
                                    <Shield className="mr-2 h-4 w-4" />
                                    View Sessions
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Choose what notifications you want to receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-muted-foreground text-sm">Receive notifications via email</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Push Notifications</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Receive push notifications in your browser
                                    </p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Marketing Emails</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Receive emails about new features and updates
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Weekly Summary</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Get a weekly summary of your activity
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Security Alerts</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Important security notifications (always enabled)
                                    </p>
                                </div>
                                <Switch checked disabled />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}