'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FirebaseDraftService } from '@/lib/firebase-draft-service'
import { PageContainer } from '@/components/layout/PageContainer'

export default function FirebaseTestPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setTestResult('Testing Firebase connection...')
    
    try {
      const connected = await FirebaseDraftService.testConnection()
      setTestResult(connected ? '✅ Firebase connection successful' : '❌ Firebase connection failed')
    } catch (error) {
      setTestResult(`❌ Firebase test error: ${error}`)
    }
    setIsLoading(false)
  }

  const testSaveDraft = async () => {
    setIsLoading(true)
    setTestResult('Testing save draft...')
    
    try {
      const testDraft = {
        creativeFilename: 'Firebase Test Draft',
        formData: {
          designer: 'Test Designer',
          campaignName: 'Test Campaign',
          headline: 'Test Headline'
        },
        autoSaved: true,
        aiPopulatedFields: ['designer']
      }

      const docId = await FirebaseDraftService.saveDraft(testDraft)
      setTestResult(`✅ Draft saved successfully! Document ID: ${docId}`)
    } catch (error) {
      setTestResult(`❌ Save draft failed: ${error}`)
    }
    setIsLoading(false)
  }

  const testGetAllDrafts = async () => {
    setIsLoading(true)
    setTestResult('Getting all drafts...')
    
    try {
      const drafts = await FirebaseDraftService.getAllDrafts()
      setTestResult(`✅ Found ${drafts.length} drafts: ${JSON.stringify(drafts.map(d => ({ id: d.id, filename: d.creativeFilename })), null, 2)}`)
    } catch (error) {
      setTestResult(`❌ Get drafts failed: ${error}`)
    }
    setIsLoading(false)
  }

  return (
    <PageContainer>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Firebase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={isLoading}>
              Test Connection
            </Button>
            <Button onClick={testSaveDraft} disabled={isLoading}>
              Test Save Draft
            </Button>
            <Button onClick={testGetAllDrafts} disabled={isLoading}>
              Get All Drafts
            </Button>
          </div>
          
          {testResult && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}
          
          <div className="text-sm text-gray-600 mt-4">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Test Connection" first to verify Firebase is connected</li>
              <li>Click "Test Save Draft" to create a test draft in Firestore</li>
              <li>Click "Get All Drafts" to see if the draft was saved</li>
              <li>Check Firebase Console &gt; Firestore Database &gt; drafts collection to see data</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}