"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { format } from "date-fns"
import type { Quote, QuoteOption, NewQuoteOption } from "@/types/quotes"
import type { Client } from "@/types/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Edit,
  Printer,
  Save,
  Calendar,
  User,
  Truck,
  Loader2,
  Phone,
  MapPin,
  CreditCard,
  Info,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useClients } from "@/hooks/use-clients"
import { useQuoteOptions } from "@/hooks/use-quote-options"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuoteOptionList } from "./quote-option-list"
import { useToast } from "@/components/ui/use-toast"
import { MailIcon } from "lucide-react"
import { sendQuoteEmail, markQuoteEmailAsUnsent } from "@/app/actions/email-actions"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CreateOptionForm } from "./option-form/create-option-form"
// Add this import at the top of the file
import { testSupabaseConnection, checkTableStructure, checkQuoteAndOptions } from "@/lib/debug-supabase-connection"

interface QuoteDetailsProps {
  quote: Quote
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateQuote: (id: string, data: Partial<Quote>) => Promise<Quote | null>
}

function StatusBadge({ status }: { status: string }) {
  let color = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  if (status === "Approved") {
    color = "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
  } else if (status === "Rejected") {
    color = "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
  } else if (status === "Expired") {
    color = "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300"
  }

  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${color}`}>
      {status}
    </div>
  )
}

export function QuoteDetails({ quote, open, onOpenChange, onUpdateQuote }: QuoteDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuote, setEditedQuote] = useState<Quote | null>(null)
  const [displayedQuote, setDisplayedQuote] = useState<Quote | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [clientDetails, setClientDetails] = useState<Client | null>(null)
  const [isLoadingClient, setIsLoadingClient] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const { clients, isLoading: clientsLoading, getClient } = useClients()
  const { toast } = useToast()

  // State for option management
  const [isAddOptionOpen, setIsAddOptionOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<QuoteOption | null>(null)

  const [isRefreshingOptions, setIsRefreshingOptions] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // New state for email confirmation dialog
  const [isEmailConfirmOpen, setIsEmailConfirmOpen] = useState(false)

  // Add a new state for the custom email message
  const [emailMessage, setEmailMessage] = useState<string>("")

  // Add state for recipient name
  const [recipientName, setRecipientName] = useState<string>("")

  // Add states for CC and BCC
  const [ccRecipients, setCcRecipients] = useState<string>("general@logisticcanada.ca")
  const [bccRecipients, setBccRecipients] = useState<string>("")

  // Add a state for checking if Resend API key is configured
  const [isResendConfigured, setIsResendConfigured] = useState(true)

  // State to track if an option is being duplicated
  const isDuplicatingRef = useRef(false)

  // Use our quote options hook
  const {
    options,
    isLoading: isLoadingOptions,
    error: optionsError,
    fetchOptions,
    createOption,
    updateOption,
    deleteOption,
    duplicateOption,
    clearOptions,
    refreshOptions,
  } = useQuoteOptions(displayedQuote?.id || quote?.id)

  // Add this effect to check if the Resend API key is configured
  useEffect(() => {
    // This is a client-side check - the actual check happens server-side in the action
    const checkResendConfig = async () => {
      try {
        // Make a simple request to check if the API key is configured
        const response = await fetch("/api/check-resend-config")
        const data = await response.json()
        setIsResendConfigured(data.configured)
      } catch (error) {
        console.error("Error checking Resend configuration:", error)
        // Assume it's not configured if there's an error
        setIsResendConfigured(false)
      }
    }

    checkResendConfig()
  }, [])

  // Update displayed quote when the quote prop changes
  useEffect(() => {
    if (quote) {
      setDisplayedQuote(quote)
    }
  }, [quote])

  // Log when the component mounts with a quote
  useEffect(() => {
    // Log when the component mounts with a quote
    if (quote) {
      console.log("QuoteDetails mounted with quote:", quote.id)
      console.log("Quote client_id:", quote.client_id)

      // Check if the quote has a client_id
      if (!quote.client_id) {
        console.warn("Quote has no client_id - this will cause client loading issues")
      }
    }
  }, [quote])

  // Load client details when quote changes or dialog opens
  const loadClientDetails = useCallback(
    async (clientId: string) => {
      if (!clientId) {
        console.error("Cannot load client details: No client ID provided")
        setClientError("No client ID provided")
        setClientDetails(null)
        return
      }

      // Skip fetching if we already have the client details for this client ID
      if (clientDetails && clientDetails.id === clientId) {
        return
      }

      setIsLoadingClient(true)
      setClientError(null)

      try {
        console.log(`Loading client details for ID: ${clientId}`)
        const client = await getClient(clientId)

        if (client) {
          console.log("Client details loaded successfully:", client)
          setClientDetails(client)
        } else {
          console.error("No client details found for ID:", clientId)
          setClientDetails(null)
          setClientError("Could not load client details")
        }
      } catch (error) {
        console.error("Error loading client details:", error)
        handleClientLoadError(error)
        setClientDetails(null)
      } finally {
        setIsLoadingClient(false)
      }
    },
    [clientDetails, getClient],
  )

  // Add better error handling for client loading
  const handleClientLoadError = (error: any) => {
    console.error("Client load error:", error)

    // Check for specific error types
    if (error?.code === "PGRST116") {
      setClientError("Client not found in database")
    } else if (error?.code?.includes("auth")) {
      setClientError("Authentication error when loading client")
    } else {
      setClientError(`Error loading client: ${error?.message || "Unknown error"}`)
    }
  }

  // Improve the useEffect for loading client details
  useEffect(() => {
    if (open && displayedQuote?.client_id) {
      console.log("Loading client details for quote:", displayedQuote.id, "client:", displayedQuote.client_id)
      loadClientDetails(displayedQuote.client_id)
    } else if (open && !displayedQuote?.client_id) {
      console.warn("Quote has no client_id:", displayedQuote)
      setClientDetails(null)
      setClientError("This quote is not associated with a client")
    }
  }, [displayedQuote?.client_id, open, loadClientDetails, displayedQuote])

  // Effect to load options when dialog opens
  useEffect(() => {
    if (open && displayedQuote?.id) {
      // We don't need to call fetchOptions here as the hook will handle it
      console.log(`Dialog opened for quote ${displayedQuote.id}`)
    }
  }, [open, displayedQuote?.id])

  // Handle refreshing options
  const handleRefreshOptions = async () => {
    if (!displayedQuote?.id) return

    setIsRefreshingOptions(true)
    try {
      await refreshOptions()
      toast({
        title: "Options refreshed",
        description: "The quote options have been refreshed.",
      })
    } catch (error) {
      console.error("Error refreshing options:", error)
      toast({
        title: "Error",
        description: "Failed to refresh options. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshingOptions(false)
    }
  }

  if (!displayedQuote) return null

  const handleEditQuote = () => {
    setEditedQuote({ ...displayedQuote })
    setIsEditing(true)
  }

  const handleSaveQuote = async () => {
    if (!editedQuote) return

    setIsSaving(true)
    try {
      console.log("Saving quote changes:", editedQuote)

      // Create an object with only the fields that have changed
      const changedFields: Partial<Quote> = {}

      if (editedQuote.reference !== displayedQuote.reference) changedFields.reference = editedQuote.reference
      if (editedQuote.origin !== displayedQuote.origin) changedFields.origin = editedQuote.origin
      if (editedQuote.destination !== displayedQuote.destination) changedFields.destination = editedQuote.destination
      if (editedQuote.date !== displayedQuote.date) changedFields.date = editedQuote.date
      if (editedQuote.client_id !== displayedQuote.client_id) changedFields.client_id = editedQuote.client_id
      if (editedQuote.status !== displayedQuote.status) changedFields.status = editedQuote.status

      // Only update if there are changes
      if (Object.keys(changedFields).length === 0) {
        console.log("No changes detected")
        setIsEditing(false)
        setIsSaving(false)
        return
      }

      console.log("Sending these changes to update function:", changedFields)

      const updatedQuote = await onUpdateQuote(displayedQuote.id, changedFields)

      if (updatedQuote) {
        // Update our displayed quote with the latest data from the server
        setDisplayedQuote(updatedQuote)

        toast({
          title: "Quote updated",
          description: "The quote has been successfully updated.",
        })

        // Exit edit mode
        setIsEditing(false)

        // Refresh client details if client changed
        if (updatedQuote.client_id !== displayedQuote.client_id) {
          loadClientDetails(updatedQuote.client_id)
        }

        // Refresh options to ensure they're in sync with the updated quote
        await refreshOptions()
      } else {
        toast({
          title: "Error",
          description: "Failed to update the quote. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving quote:", error)
      toast({
        title: "Error",
        description: "Failed to update the quote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set"
    try {
      return format(new Date(dateString), "PPP")
    } catch (e) {
      return dateString
    }
  }

  const handleClientChange = (clientId: string) => {
    if (editedQuote) {
      setEditedQuote({
        ...editedQuote,
        client_id: clientId,
        customerName: clients.find((c) => c.id === clientId)?.company_name || "Unknown Customer",
      })
    }
  }

  // Format address from client details
  const formatAddress = () => {
    if (!clientDetails) return null

    const addressParts = []

    if (clientDetails.address_number) addressParts.push(clientDetails.address_number)
    if (clientDetails.address_street) addressParts.push(clientDetails.address_street)
    if (clientDetails.address_suite) addressParts.push(`Suite ${clientDetails.address_suite}`)

    const line1 = addressParts.join(" ")

    const cityStateParts = []
    if (clientDetails.address_city) cityStateParts.push(clientDetails.address_city)
    if (clientDetails.address_state_province) cityStateParts.push(clientDetails.address_zip_postal)

    const line2 = cityStateParts.join(", ")

    if (!line1 && !line2) return null

    return (
      <>
        {line1 && <p className="text-sm">{line1}</p>}
        {line2 && <p className="text-sm">{line2}</p>}
      </>
    )
  }

  // Handle adding a new option or updating an existing one
  const handleAddOrUpdateOption = async (newOption: NewQuoteOption, isEditing: boolean, optionId?: string) => {
    try {
      // Show a loading toast to indicate the process has started
      toast({
        title: isEditing ? "Updating option..." : "Creating option...",
        description: "Please wait while we save your changes.",
      })

      console.log("handleAddOrUpdateOption called with:", {
        newOption,
        isEditing,
        optionId,
        quoteId: displayedQuote?.id,
      })

      if (isEditing && optionId) {
        // Update existing option
        console.log(`Updating existing option with ID: ${optionId}`, newOption)
        const result = await updateOption(optionId, newOption)
        if (result) {
          toast({
            title: "Option updated",
            description: "The quote option has been successfully updated.",
          })
          setIsAddOptionOpen(false)
          setEditingOption(null)

          // Refresh options to get the latest data
          await refreshOptions()
        } else {
          toast({
            title: "Error",
            description: "Failed to update the quote option. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        // Create new option
        console.log("Creating new option for quote:", displayedQuote?.id)
        console.log("Option data:", newOption)

        // Ensure the quote_id is set
        if (!newOption.quote_id && displayedQuote?.id) {
          newOption.quote_id = displayedQuote.id
        }

        const result = await createOption(newOption)
        console.log("Create option result:", result)

        if (result) {
          toast({
            title: "Option added",
            description: "The quote option has been successfully added.",
          })
          setIsAddOptionOpen(false)
          setEditingOption(null)

          // Refresh options to get the latest data
          await refreshOptions()
        } else {
          toast({
            title: "Error",
            description: "Failed to add the quote option. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error saving option:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle editing an option
  const handleEditOption = (option: QuoteOption) => {
    setEditingOption(option)
    setIsAddOptionOpen(true)
  }

  // Handle deleting an option
  const handleDeleteOption = async (optionId: string) => {
    if (!optionId) {
      console.error("Cannot delete option: No option ID provided")
      return
    }

    if (window.confirm("Are you sure you want to delete this option?")) {
      try {
        console.log(`Attempting to delete option with ID: ${optionId}`)
        const success = await deleteOption(optionId)

        if (success) {
          toast({
            title: "Option deleted",
            description: "The quote option has been successfully deleted.",
          })
          // Force refresh options to ensure UI is in sync
          await refreshOptions()
        } else {
          toast({
            title: "Error",
            description: "Failed to delete the quote option. Please try again.",
          })
        }
      } catch (error) {
        console.error("Error in handleDeleteOption:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while deleting. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Handle duplicating an option
  const handleDuplicateOption = async (option: QuoteOption) => {
    if (!option || !option.id) {
      console.error("Cannot duplicate option: Invalid option provided")
      toast({
        title: "Error",
        description: "Cannot duplicate this option. Invalid option data.",
        variant: "destructive",
      })
      return
    }

    // Prevent multiple duplicate calls
    if (isDuplicatingRef.current) {
      console.warn("Duplicate operation already in progress.")
      return
    }

    try {
      console.log(`Attempting to duplicate option with ID: ${option.id}`)

      // Show loading toast
      toast({
        title: "Duplicating option...",
        description: "Please wait while we create a copy of this option.",
      })

      // Set the ref to true to indicate duplication is in progress
      isDuplicatingRef.current = true

      const result = await duplicateOption(option)

      // Clear the ref
      isDuplicatingRef.current = false

      if (result) {
        toast({
          title: "Option duplicated",
          description: "The quote option has been successfully duplicated.",
        })

        // Force refresh options to ensure UI is in sync
        await refreshOptions()
      } else {
        // Handle the case where result is null (error occurred)
        console.error("Failed to duplicate option - no result returned")
        toast({
          title: "Error",
          description: "Failed to duplicate the quote option. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error in handleDuplicateOption:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while duplicating. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Ensure the ref is cleared even if an error occurs
      isDuplicatingRef.current = false
    }
  }

  // Handle updating an option's status
  const handleUpdateOptionStatus = async (optionId: string, status: string) => {
    try {
      console.log(`Updating option ${optionId} status to ${status}`)

      // Make sure we're sending a valid status value
      const normalizedStatus = status.toLowerCase() as any

      const result = await updateOption(optionId, {
        status: normalizedStatus,
        updated_at: new Date().toISOString(),
      })

      if (result) {
        toast({
          title: "Status updated",
          description: `The option status has been updated to ${status}.`,
        })

        // Force a refresh of the options list to ensure UI is in sync
        await refreshOptions()
      } else {
        toast({
          title: "Error",
          description: "Failed to update the option status. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating option status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add this function near the showEmailConfirmation function to set the default message when opening the dialog
  const showEmailConfirmation = () => {
    // If email is already sent, toggle it off without confirmation
    if (displayedQuote.sent_email) {
      handleToggleEmailStatus()
      return // Add this return statement to exit early
    }

    // Set the default recipient name
    setRecipientName(clientDetails?.contact_name || "Valued Customer")

    // Set the default email message when opening the confirmation dialog
    setEmailMessage(
      `Please find attached your requested quote for transportation from ${displayedQuote.origin} to ${displayedQuote.destination}.

If you have any questions or would like to proceed with this quote, please let us know.

Thank you for your business,
A.H Logistics Canada Inc.`,
    )

    // Reset CC and BCC to defaults
    setCcRecipients("general@logisticcanada.ca")
    setBccRecipients("")

    // Show confirmation dialog for sending
    setIsEmailConfirmOpen(true)
  }

  // Add this new function to handle toggling the email status
  const handleToggleEmailStatus = async () => {
    if (!displayedQuote) return

    try {
      // Set loading state
      setIsSendingEmail(true)

      if (displayedQuote.sent_email) {
        // If email was already sent, mark it as unsent
        const result = await markQuoteEmailAsUnsent(displayedQuote.id)

        if (!result.success) {
          throw new Error(result.error || "Failed to update email status")
        }

        // Update the displayed quote
        setDisplayedQuote({
          ...displayedQuote,
          sent_email: null,
          sent_email_at: null,
        })

        toast({
          title: "Email Status Removed",
          description: "The quote has been marked as not sent.",
        })
      } else {
        // If email wasn't sent yet, we'll handle this in handleSendEmailToCustomer
        // This branch should not be reached directly, but we'll keep it for safety
        console.warn(
          "handleToggleEmailStatus called for unsent email - this should be handled by handleSendEmailToCustomer",
        )
      }
    } catch (error) {
      console.error("Error updating email status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating email status.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Helper function to validate email addresses
  const validateEmails = (emails: string): boolean => {
    if (!emails.trim()) return true // Empty is valid

    const emailList = emails.split(",").map((email) => email.trim())
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailList.every((email) => emailRegex.test(email))
  }

  // Update the handleSendEmailToCustomer function to pass the custom message, CC and BCC
  const handleSendEmailToCustomer = async () => {
    if (!displayedQuote || !clientDetails?.email) return

    // Validate CC and BCC emails
    if (!validateEmails(ccRecipients)) {
      toast({
        title: "Invalid CC Email(s)",
        description: "Please enter valid email addresses for CC recipients, separated by commas.",
        variant: "destructive",
      })
      return
    }

    if (!validateEmails(bccRecipients)) {
      toast({
        title: "Invalid BCC Email(s)",
        description: "Please enter valid email addresses for BCC recipients, separated by commas.",
        variant: "destructive",
      })
      return
    }

    try {
      // Set loading state
      setIsSendingEmail(true)

      // Process CC and BCC recipients
      const ccArray = ccRecipients.trim() ? ccRecipients.split(",").map((email) => email.trim()) : []
      const bccArray = bccRecipients.trim() ? bccRecipients.split(",").map((email) => email.trim()) : []

      // Send the email using our server action with the custom message, CC and BCC
      const result = await sendQuoteEmail(
        displayedQuote.id,
        clientDetails.email,
        emailMessage,
        ccArray,
        bccArray,
        recipientName,
      )

      if (!result.success) {
        throw new Error(result.error || "Failed to send email")
      }

      // Update the displayed quote
      setDisplayedQuote({
        ...displayedQuote,
        sent_email: "sent",
        sent_email_at: new Date().toISOString(),
      })

      toast({
        title: "Email Sent",
        description: `The quote has been emailed to ${clientDetails.email}.`,
      })
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the email.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
      // Close the confirmation dialog
      setIsEmailConfirmOpen(false)
    }
  }

  // Helper function to remove a CC recipient
  const removeCcRecipient = (emailToRemove: string) => {
    const emailList = ccRecipients.split(",").map((email) => email.trim())
    const filteredEmails = emailList.filter((email) => email !== emailToRemove)
    setCcRecipients(filteredEmails.join(", "))
  }

  // Helper function to remove a BCC recipient
  const removeBccRecipient = (emailToRemove: string) => {
    const emailList = bccRecipients.split(",").map((email) => email.trim())
    const filteredEmails = emailList.filter((email) => email !== emailToRemove)
    setBccRecipients(filteredEmails.join(", "))
  }

  // Add a function to check the connection
  const handleCheckConnection = async () => {
    try {
      toast({
        title: "Checking connection...",
        description: "Testing database connection and structure.",
      })

      // Test basic connection
      const connectionResult = await testSupabaseConnection()
      console.log("Connection test result:", connectionResult)

      if (connectionResult.success) {
        // If connection is successful, check the quote_options table structure
        const tableResult = await checkTableStructure("quote_options")
        console.log("Table structure check result:", tableResult)

        if (tableResult.success) {
          // If table structure is good, check this specific quote and its options
          if (displayedQuote?.id) {
            const quoteResult = await checkQuoteAndOptions(displayedQuote.id)
            console.log("Quote check result:", quoteResult)

            if (quoteResult.success) {
              toast({
                title: "All checks passed",
                description: `Connection successful. Table 'quote_options' has ${tableResult.columns?.length || 0} columns. Quote has ${quoteResult.optionsCount} options.`,
              })
            } else {
              toast({
                title: "Quote check issue",
                description: quoteResult.message,
                variant: "destructive",
              })
            }
          } else {
            toast({
              title: "Connection successful",
              description: `Database connection is working properly. Table 'quote_options' has ${tableResult.columns?.length || 0} columns.`,
            })
          }
        } else {
          toast({
            title: "Table structure issue",
            description: tableResult.message,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Connection issue",
          description: connectionResult.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking connection:", error)
      toast({
        title: "Error",
        description: "Failed to check connection: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      })
    }
  }

  // Add this function near the other handler functions

  const handleDiagnoseOptionIssues = async () => {
    if (!displayedQuote?.id) {
      toast({
        title: "Error",
        description: "No quote ID available for testing",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Running diagnostics...",
      description: "Testing option creation functionality",
    })

    try {
      // Import the debug utilities
      const { checkQuoteOptionsTable, testCreateOption } = await import("@/lib/debug-quote-options")

      // Check the table structure
      const tableResult = await checkQuoteOptionsTable()
      console.log("Quote options table check result:", tableResult)

      if (!tableResult.success) {
        toast({
          title: "Table structure issue",
          description: tableResult.message,
          variant: "destructive",
        })
        return
      }

      // Test creating an option
      const createResult = await testCreateOption(displayedQuote.id)
      console.log("Test option creation result:", createResult)

      if (!createResult.success) {
        toast({
          title: "Option creation issue",
          description: createResult.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Diagnostics passed",
        description:
          "The option creation functionality appears to be working correctly. The issue may be in the form submission.",
      })

      // Force refresh options
      await refreshOptions()
    } catch (error) {
      console.error("Error running diagnostics:", error)
      toast({
        title: "Diagnostics error",
        description: `An error occurred during diagnostics: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[900px] lg:max-w-[1000px] w-[95vw] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex justify-between items-center">
              <DialogTitle className="flex items-center text-xl">
                <FileText className="mr-2 h-5 w-5 text-primary" /> Quote{" "}
                {displayedQuote.reference || displayedQuote.id.substring(0, 8)}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsAddOptionOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleCheckConnection}>
                  Check Connection
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleDiagnoseOptionIssues}>
                  Diagnose Options
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isEditing ? handleSaveQuote : handleEditQuote}
                  disabled={isSaving}
                >
                  {isEditing ? (
                    isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Quote
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <DialogDescription>
                Created on {formatDate(displayedQuote.created_at)} • Last updated:{" "}
                {formatDate(displayedQuote.updated_at)}
              </DialogDescription>
              <StatusBadge status={displayedQuote.status} />
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh]">
            <div className="p-6 pt-2 space-y-6">
              {/* Summary Card */}
              <Card className={cn("border-primary/20 shadow-sm", "bg-primary/5 dark:bg-primary/10")}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="text-sm font-medium flex items-center">
                        <FileText className="mr-1 h-3.5 w-3.5 text-primary" />
                        {displayedQuote.reference || displayedQuote.id.substring(0, 8)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="text-sm font-medium flex items-center">
                        <User className="mr-1 h-3.5 w-3.5 text-primary" />
                        {clientDetails?.company_name || displayedQuote.customerName || "Unknown Customer"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Route</p>
                      <p className="text-sm font-medium flex items-center">
                        <Truck className="mr-1 h-3.5 w-3.5 text-primary" />
                        {displayedQuote.origin} → {displayedQuote.destination}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Quote Date</p>
                      <p className="text-sm font-medium flex items-center">
                        <Calendar className="mr-1 h-3.5 w-3.5 text-primary" />
                        {displayedQuote.date}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quote Information Section */}
              <div>
                <div className="flex items-center mb-2">
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  <h3 className="text-lg font-medium">Quote Information</h3>
                </div>
                <Separator className={cn("mb-4", "bg-blue-200 dark:bg-blue-900/50")} />
                <div
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-md",
                    "border border-blue-200 bg-blue-50/30",
                    "dark:border-blue-900/50 dark:bg-blue-950/20",
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                    {isEditing ? (
                      <Input
                        value={editedQuote?.reference || ""}
                        onChange={(e) => setEditedQuote({ ...editedQuote!, reference: e.target.value })}
                        className="dark:bg-background/80"
                      />
                    ) : (
                      <p className="text-sm">{displayedQuote.reference || displayedQuote.id.substring(0, 8)}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    {isEditing ? (
                      <Select
                        value={editedQuote?.status || "Pending"}
                        onValueChange={(value) => setEditedQuote({ ...editedQuote!, status: value })}
                      >
                        <SelectTrigger className="dark:bg-background/80">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{displayedQuote.status}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Quote Date</p>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedQuote?.date || ""}
                        onChange={(e) => setEditedQuote({ ...editedQuote!, date: e.target.value })}
                        className="dark:bg-background/80"
                      />
                    ) : (
                      <p className="text-sm">{displayedQuote.date}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                    <p className="text-sm">{formatDate(displayedQuote.created_at)}</p>
                  </div>
                  {displayedQuote.sent_email && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email Status</p>
                      <p className="text-sm flex items-center">
                        <MailIcon className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                        Sent on {formatDate(displayedQuote.sent_email_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information Section */}
              <div>
                <div className="flex items-center mb-2">
                  <User className="mr-2 h-4 w-4 text-primary" />
                  <h3 className="text-lg font-medium">Customer Information</h3>
                </div>
                <Separator className={cn("mb-4", "bg-green-200 dark:bg-green-900/50")} />

                {isLoadingClient ? (
                  <div className="flex items-center justify-center p-6 border rounded-md bg-muted/10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                    <span>Loading client details...</span>
                  </div>
                ) : clientError ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{clientError}</AlertDescription>
                  </Alert>
                ) : isEditing ? (
                  <div
                    className={cn(
                      "p-3 rounded-md",
                      "border border-green-200 bg-green-50/30",
                      "dark:border-green-900/50 dark:bg-green-950/20",
                    )}
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Select Client</p>
                      {clientsLoading ? (
                        <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="text-muted-foreground">Loading clients...</span>
                        </div>
                      ) : (
                        <Select value={editedQuote?.client_id || ""} onValueChange={handleClientChange}>
                          <SelectTrigger className="dark:bg-background/80">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.company_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ) : clientDetails ? (
                  <div
                    className={cn(
                      "grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-md",
                      "border border-green-200 bg-green-50/30",
                      "dark:border-green-900/50 dark:bg-green-950/20",
                    )}
                  >
                    {/* Company Name */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Company</p>
                      <p className="text-sm">{clientDetails.company_name}</p>
                    </div>

                    {/* Contact Name */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Contact</p>
                      <p className="text-sm">{clientDetails.contact_name}</p>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-sm">{clientDetails.email}</p>
                    </div>

                    {/* Phone Number - Only if available */}
                    {clientDetails.phone_number && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-sm flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1 text-primary" />
                          {clientDetails.phone_number}
                        </p>
                      </div>
                    )}

                    {/* Address - Only if any address field is available */}
                    {(clientDetails.address_street || clientDetails.address_city) && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <div className="flex items-start">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-primary mt-0.5" />
                          <div>{formatAddress()}</div>
                        </div>
                      </div>
                    )}

                    {/* Payment Terms - Only if available */}
                    {clientDetails.payment_terms && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Payment Terms</p>
                        <p className="text-sm">{clientDetails.payment_terms}</p>
                      </div>
                    )}

                    {/* Credit Limit - Only if available */}
                    {clientDetails.credit_limit && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Credit Limit</p>
                        <p className="text-sm flex items-center">
                          <CreditCard className="h-3.5 w-3.5 mr-1 text-primary" />$
                          {clientDetails.credit_limit.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {/* Notes - Only if available */}
                    {clientDetails.notes && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                        <p className="text-sm flex items-start">
                          <Info className="h-3.5 w-3.5 mr-1 text-primary mt-0.5" />
                          {clientDetails.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-md border border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20">
                    <p className="text-sm text-muted-foreground">No client information available</p>
                  </div>
                )}
              </div>

              {/* Route Information Section */}
              <div>
                <div className="flex items-center mb-2">
                  <Truck className="mr-2 h-4 w-4 text-primary" />
                  <h3 className="text-lg font-medium">Route Information</h3>
                </div>
                <Separator className={cn("mb-4", "bg-purple-200 dark:bg-purple-900/50")} />
                <div
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-md",
                    "border border-purple-200 bg-purple-50/30",
                    "dark:border-purple-900/50 dark:bg-purple-950/20",
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Origin</p>
                    {isEditing ? (
                      <Input
                        value={editedQuote?.origin || ""}
                        onChange={(e) => setEditedQuote({ ...editedQuote!, origin: e.target.value })}
                        className="dark:bg-background/80"
                      />
                    ) : (
                      <p className="text-sm">{displayedQuote.origin}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Destination</p>
                    {isEditing ? (
                      <Input
                        value={editedQuote?.destination || ""}
                        onChange={(e) => setEditedQuote({ ...editedQuote!, destination: e.target.value })}
                        className="dark:bg-background/80"
                      />
                    ) : (
                      <p className="text-sm">{displayedQuote.destination}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quote Options Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4 text-primary" />
                    <h3 className="text-lg font-medium">Quote Options</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshOptions}
                      disabled={isRefreshingOptions}
                      className="h-8"
                    >
                      {isRefreshingOptions ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      <span className="ml-2">Refresh</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsAddOptionOpen(true)} className="h-8">
                      <PlusCircle className="mr-2 h-3.5 w-3.5" />
                      Add Option
                    </Button>
                  </div>
                </div>
                <Separator className={cn("mb-4", "bg-amber-200 dark:bg-amber-900/50")} />

                {isLoadingOptions ? (
                  <div className="flex items-center justify-center p-6 border rounded-md bg-muted/10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                    <span>Loading options...</span>
                  </div>
                ) : optionsError ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{optionsError}</AlertDescription>
                  </Alert>
                ) : (
                  <QuoteOptionList
                    options={options}
                    onUpdateStatus={handleUpdateOptionStatus}
                    onEdit={handleEditOption}
                    onDelete={handleDeleteOption}
                    onDuplicate={handleDuplicateOption}
                  />
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-2">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                {!isResendConfigured && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Email service is not configured. Please add RESEND_API_KEY to your environment variables.
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 sm:flex-none",
                    displayedQuote.sent_email && "bg-green-600 hover:bg-green-700 text-white border-green-600",
                  )}
                  onClick={showEmailConfirmation}
                  disabled={isSendingEmail || isLoadingClient || !clientDetails?.email}
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {displayedQuote.sent_email ? "Updating..." : "Sending..."}
                    </>
                  ) : displayedQuote.sent_email ? (
                    <>
                      <MailIcon className="mr-2 h-4 w-4" />
                      Email Sent
                    </>
                  ) : (
                    <>
                      <MailIcon className="mr-2 h-4 w-4" />
                      Email to Customer
                    </>
                  )}
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleCheckConnection}>
                  Check Connection
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleDiagnoseOptionIssues}>
                  Diagnose Options
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                  onClick={async () => {
                    toast({
                      title: "Running comprehensive check...",
                      description: "Testing database, tables, and quote data.",
                    })

                    try {
                      const { performComprehensiveCheck } = await import("@/lib/debug-supabase-connection")
                      const result = await performComprehensiveCheck()
                      console.log("Comprehensive check result:", result)

                      if (result.success) {
                        toast({
                          title: "Comprehensive check passed",
                          description: `Connection: OK, Tables: ${Object.values(result.tableChecks).filter((t) => t.success).length}/${
                            Object.keys(result.tableChecks).length
                          } OK, Quotes: ${result.sampleQuotesFound} found`,
                        })
                      } else {
                        toast({
                          title: "Comprehensive check failed",
                          description: result.message,
                          variant: "destructive",
                        })
                      }
                    } catch (error) {
                      console.error("Error in comprehensive check:", error)
                      toast({
                        title: "Error",
                        description:
                          "Failed to run comprehensive check: " +
                          (error instanceof Error ? error.message : "Unknown error"),
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Full System Check
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                {isEditing && (
                  <Button size="sm" className="flex-1 sm:flex-none" onClick={handleSaveQuote} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Quote
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Confirmation Dialog */}
      <Dialog open={isEmailConfirmOpen} onOpenChange={setIsEmailConfirmOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customize Email Message</DialogTitle>
            <DialogDescription>
              Customize the email message below or use the default text. The quote details will be included
              automatically.
              {clientDetails?.email && (
                <span className="block mt-2 font-medium">Email will be sent to: {clientDetails.email}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="recipient-name">Recipient Name</Label>
              <Input
                id="recipient-name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="mt-1"
                placeholder="Enter recipient name"
              />
            </div>

            <div>
              <Label htmlFor="email-message">Email Message</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="mt-1 min-h-[200px]"
                placeholder="Enter your custom message here..."
              />
            </div>

            <div>
              <Label htmlFor="cc-recipients" className="flex items-center justify-between">
                CC Recipients
                <span className="text-xs text-muted-foreground">(Comma separated)</span>
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="cc-recipients"
                  value={ccRecipients}
                  onChange={(e) => setCcRecipients(e.target.value)}
                  placeholder="e.g. general@logisticcanada.ca, another@example.com"
                />
              </div>
              {ccRecipients && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {ccRecipients.split(",").map((email, index) => {
                    const trimmedEmail = email.trim()
                    if (!trimmedEmail) return null
                    return (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
                        {trimmedEmail}
                        <button
                          type="button"
                          onClick={() => removeCcRecipient(trimmedEmail)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="bcc-recipients" className="flex items-center justify-between">
                BCC Recipients
                <span className="text-xs text-muted-foreground">(Comma separated)</span>
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="bcc-recipients"
                  value={bccRecipients}
                  onChange={(e) => setBccRecipients(e.target.value)}
                  placeholder="e.g. manager@logisticcanada.ca, archive@example.com"
                />
              </div>
              {bccRecipients && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {bccRecipients.split(",").map((email, index) => {
                    const trimmedEmail = email.trim()
                    if (!trimmedEmail) return null
                    return (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
                        {trimmedEmail}
                        <button
                          type="button"
                          onClick={() => removeBccRecipient(trimmedEmail)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEmailConfirmOpen(false)} className="sm:flex-1">
              Cancel
            </Button>
            <Button onClick={handleSendEmailToCustomer} disabled={isSendingEmail} className="sm:flex-1">
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MailIcon className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CreateOptionForm
        quoteId={displayedQuote?.id || quote?.id}
        open={isAddOptionOpen}
        onOpenChange={setIsAddOptionOpen}
        onSubmit={handleAddOrUpdateOption}
        editOption={editingOption}
        onClearEdit={() => setEditingOption(null)}
      />
    </>
  )
}
