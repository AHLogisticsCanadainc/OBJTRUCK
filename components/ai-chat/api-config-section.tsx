"use client"

import { ApiKeyConfig } from "./api-key-config"
import { CustomInstructions } from "./custom-instructions"
import { useAiChat } from "@/hooks/use-ai-chat"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ApiConfigSection() {
  const { apiConfig, setApiProvider, updateModel, updateEndpoint, updateInstructions } = useAiChat()

  return (
    <Card className="mb-6">
      <CardContent className="p-4 pt-6">
        <Tabs defaultValue="api-key" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="api-key">API Configuration</TabsTrigger>
            <TabsTrigger value="instructions">Custom Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="api-key" className="mt-0">
            <ApiKeyConfig
              apiConfig={apiConfig}
              onSetApiProvider={setApiProvider}
              onUpdateModel={updateModel}
              onUpdateEndpoint={updateEndpoint}
            />
          </TabsContent>

          <TabsContent value="instructions" className="mt-0">
            <CustomInstructions apiConfig={apiConfig} onSave={updateInstructions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
