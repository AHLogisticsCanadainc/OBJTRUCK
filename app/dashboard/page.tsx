import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, FileText, AlertTriangle, TrendingUp, CalendarCheck } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // In a real app, you would fetch this data from Supabase
  const stats = [
    {
      title: "Total Clients",
      value: 248,
      icon: Users,
      change: "+12% from last month",
      trending: "up",
    },
    {
      title: "Active Policies",
      value: 573,
      icon: Shield,
      change: "+5% from last month",
      trending: "up",
    },
    {
      title: "Documents",
      value: 1204,
      icon: FileText,
      change: "+18% from last month",
      trending: "up",
    },
    {
      title: "Compliance Alerts",
      value: 8,
      icon: AlertTriangle,
      change: "-3 from last month",
      trending: "down",
    },
  ]

  // Sample upcoming tasks
  const tasks = [
    { id: 1, task: "Policy renewal for Smith & Co.", due: "Today", status: "urgent" },
    { id: 2, task: "Review compliance documents for ABC Ltd.", due: "Tomorrow", status: "normal" },
    { id: 3, task: "Update client information for Johnson family", due: "Aug 23", status: "normal" },
    { id: 4, task: "Follow up on pending claims", due: "Aug 25", status: "normal" },
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.email?.split("@")[0] || "Agent"}</h2>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs text-muted-foreground ${stat.trending === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks and Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div>
              <CardTitle>Upcoming Tasks</CardTitle>
            </div>
            <CalendarCheck className="ml-auto h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center">
                  <div
                    className={`mr-2 h-2 w-2 rounded-full ${
                      task.status === "urgent" ? "bg-destructive" : "bg-muted-foreground"
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{task.task}</p>
                    <p className="text-xs text-muted-foreground">Due {task.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div>
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <TrendingUp className="ml-auto h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">New client added: Johnson family</p>
                  <p className="text-xs text-muted-foreground">Today at 10:15 AM</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Policy renewed for Smith & Co.</p>
                  <p className="text-xs text-muted-foreground">Yesterday at 3:45 PM</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Document uploaded: ABC Ltd. compliance report</p>
                  <p className="text-xs text-muted-foreground">Aug 21, 2023 at 11:30 AM</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Claim processed for XYZ Corp.</p>
                  <p className="text-xs text-muted-foreground">Aug 20, 2023 at 2:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
