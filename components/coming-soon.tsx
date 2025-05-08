"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, Construction, Bell } from "lucide-react"

interface ComingSoonProps {
  title: string
  description?: string
  estimatedRelease?: string
}

export function ComingSoon({
  title,
  description = "We're working hard to bring you this feature soon.",
  estimatedRelease,
}: ComingSoonProps) {
  const [notify, setNotify] = useState(false)
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
        <CardContent className="pt-6 pb-8 px-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <Construction className="h-20 w-20 text-primary animate-pulse" />
              <div className="absolute -top-2 -right-2 bg-primary/10 rounded-full p-2">
                <CalendarClock className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
              <p className="text-muted-foreground">{description}</p>

              <div className="h-1.5 w-full bg-secondary rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-primary rounded-full w-3/4 animate-pulse"></div>
              </div>

              <p className="text-sm text-muted-foreground mt-2">Development in progress{dots}</p>

              {estimatedRelease && <p className="text-sm font-medium mt-4">Estimated release: {estimatedRelease}</p>}
            </div>

            <Button variant={notify ? "outline" : "default"} className="mt-4 w-full" onClick={() => setNotify(!notify)}>
              <Bell className="mr-2 h-4 w-4" />
              {notify ? "We'll notify you" : "Notify me when ready"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
