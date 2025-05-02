"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      })
    }, 1000)
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Agent Profile</CardTitle>
              <CardDescription>Manage your personal information and agent details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/business-agent.png" alt="Profile" />
                    <AvatarFallback>AG</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input id="first_name" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input id="last_name" defaultValue="Smith" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email_primary">Email</Label>
                    <Input id="email_primary" type="email" defaultValue="john.smith@ccia.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_primary">Phone Number</Label>
                    <Input id="phone_primary" type="tel" defaultValue="(555) 123-4567" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue="active">
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="territory">Territory</Label>
                      <Input id="territory" defaultValue="Northeast Region" />
                    </div>
                  </div>
                </div>
              </div>

              <Accordion type="multiple" className="w-full">
                {/* License Information */}
                <AccordionItem value="license">
                  <AccordionTrigger>License Information</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="license_number_primary">License Number</Label>
                        <Input id="license_number_primary" defaultValue="INS-12345-NY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license_expiration_primary">License Expiration</Label>
                        <Input id="license_expiration_primary" type="date" defaultValue="2025-06-30" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* E&O Insurance */}
                <AccordionItem value="insurance">
                  <AccordionTrigger>E&O Insurance</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="e_and_o_policy_number">Policy Number</Label>
                        <Input id="e_and_o_policy_number" defaultValue="EO-987654" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="e_and_o_carrier">Carrier</Label>
                        <Input id="e_and_o_carrier" defaultValue="Professional Liability Co." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="e_and_o_expiration">Expiration Date</Label>
                        <Input id="e_and_o_expiration" type="date" defaultValue="2024-12-31" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Employment Details */}
                <AccordionItem value="employment">
                  <AccordionTrigger>Employment Details</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="agent_since">Agent Since</Label>
                        <Input id="agent_since" type="date" defaultValue="2018-03-15" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hire_application_date">Hire Application Date</Label>
                        <Input id="hire_application_date" type="date" defaultValue="2018-02-01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="education_level">Education Level</Label>
                        <Select defaultValue="bachelors">
                          <SelectTrigger id="education_level">
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="highschool">High School</SelectItem>
                            <SelectItem value="associates">Associate's Degree</SelectItem>
                            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                            <SelectItem value="masters">Master's Degree</SelectItem>
                            <SelectItem value="doctorate">Doctorate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employment_history">Employment History</Label>
                      <Textarea
                        id="employment_history"
                        defaultValue="2015-2018: Junior Agent at Regional Insurance Group
2012-2015: Customer Service Representative at AllState"
                        rows={4}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Background Check */}
                <AccordionItem value="background">
                  <AccordionTrigger>Background Check</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="background_check_date">Background Check Date</Label>
                        <Input id="background_check_date" type="date" defaultValue="2018-02-15" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="drug_test_result">Drug Test Result</Label>
                        <Select defaultValue="pass">
                          <SelectTrigger id="drug_test_result">
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pass">Pass</SelectItem>
                            <SelectItem value="fail">Fail</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="exempt">Exempt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credit_score_application">Credit Score Application</Label>
                      <Input id="credit_score_application" defaultValue="720" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="criminal_records">Criminal Records</Label>
                      <Textarea id="criminal_records" defaultValue="None" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disciplinary_actions">Disciplinary Actions</Label>
                      <Textarea id="disciplinary_actions" defaultValue="None" rows={2} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Certifications */}
                <AccordionItem value="certifications">
                  <AccordionTrigger>Professional Certifications</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="professional_certifications">Certifications</Label>
                      <Textarea
                        id="professional_certifications"
                        defaultValue="Certified Insurance Counselor (CIC) - 2020
Chartered Property Casualty Underwriter (CPCU) - 2022"
                        rows={4}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* References */}
                <AccordionItem value="references">
                  <AccordionTrigger>References</AccordionTrigger>
                  <AccordionContent className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Reference 1</h4>
                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="ref1_name">Name *</Label>
                          <Input id="ref1_name" defaultValue="Robert Johnson" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ref1_relationship">Relationship</Label>
                            <Input id="ref1_relationship" defaultValue="Former Supervisor" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ref1_phone">Phone</Label>
                            <Input id="ref1_phone" type="tel" defaultValue="(555) 234-5678" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ref1_email">Email</Label>
                          <Input id="ref1_email" type="email" defaultValue="robert.j@example.com" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Reference 2</h4>
                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="ref2_name">Name *</Label>
                          <Input id="ref2_name" defaultValue="Sarah Williams" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ref2_relationship">Relationship</Label>
                            <Input id="ref2_relationship" defaultValue="Colleague" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ref2_phone">Phone</Label>
                            <Input id="ref2_phone" type="tel" defaultValue="(555) 345-6789" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ref2_email">Email</Label>
                          <Input id="ref2_email" type="email" defaultValue="sarah.w@example.com" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Reference 3</h4>
                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="ref3_name">Name *</Label>
                          <Input id="ref3_name" defaultValue="Michael Chen" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ref3_relationship">Relationship</Label>
                            <Input id="ref3_relationship" defaultValue="Industry Contact" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ref3_phone">Phone</Label>
                            <Input id="ref3_phone" type="tel" defaultValue="(555) 456-7890" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ref3_email">Email</Label>
                          <Input id="ref3_email" type="email" defaultValue="michael.c@example.com" />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Additional Notes */}
                <AccordionItem value="notes">
                  <AccordionTrigger>Additional Notes</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="additional_notes">Notes</Label>
                      <Textarea
                        id="additional_notes"
                        defaultValue="Top performer in 2022. Specializes in commercial property insurance."
                        rows={4}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="policy-expiry">Policy Expiration Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts when policies are about to expire</p>
                  </div>
                  <Switch id="policy-expiry" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compliance-alerts">Compliance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts for upcoming compliance deadlines</p>
                  </div>
                  <Switch id="compliance-alerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="client-updates">Client Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when client information is updated
                    </p>
                  </div>
                  <Switch id="client-updates" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates about new features and services</p>
                  </div>
                  <Switch id="marketing" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Schedule</h3>

                <div className="space-y-2">
                  <Label htmlFor="notification-timing">Policy Expiration Reminder</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="notification-timing">
                      <SelectValue placeholder="Select timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days before expiry</SelectItem>
                      <SelectItem value="14">14 days before expiry</SelectItem>
                      <SelectItem value="30">30 days before expiry</SelectItem>
                      <SelectItem value="60">60 days before expiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification-frequency">Daily Digest</Label>
                  <Select defaultValue="morning">
                    <SelectTrigger id="notification-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8:00 AM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (1:00 PM)</SelectItem>
                      <SelectItem value="evening">Evening (6:00 PM)</SelectItem>
                      <SelectItem value="none">Don't send</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="two-factor" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Session Management</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">Current device - Last active: Just now</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Sign Out
                    </Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Sign Out of All Devices
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Manage your company details and branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-24 w-24 rounded-md bg-primary flex items-center justify-center text-white text-2xl font-bold">
                    CCIA
                  </div>
                  <Button variant="outline" size="sm">
                    Change Logo
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="CCIA Insurance" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-address">Address</Label>
                    <Input id="company-address" defaultValue="123 Insurance Ave, Suite 500" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-city">City</Label>
                      <Input id="company-city" defaultValue="New York" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-state">State</Label>
                      <Input id="company-state" defaultValue="NY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-zip">ZIP Code</Label>
                      <Input id="company-zip" defaultValue="10001" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Phone Number</Label>
                    <Input id="company-phone" type="tel" defaultValue="(555) 987-6543" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input id="company-email" type="email" defaultValue="contact@cciainsurance.com" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID / EIN</Label>
                  <Input id="tax-id" defaultValue="12-3456789" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license-number">Insurance License Number</Label>
                  <Input id="license-number" defaultValue="INS-123456-NY" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founded">Year Founded</Label>
                  <Input id="founded" defaultValue="1995" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
