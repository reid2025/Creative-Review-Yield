'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Script from 'next/script'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

// Icons
import { 
  FileSpreadsheet,
  RefreshCw,
  Download,
  Search,
  LogIn,
  LogOut,
  User,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Shield,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

// Google Sheets configuration
const SPREADSHEET_ID = '1XaYez9SPv-ICmjdDSfTEfjK29bRgk3l7vKTz4Kg8Gnc'
const RANGE = 'A:Z' // Remove sheet name, let it use the default sheet
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4'
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'

// Google Client ID - You need to create this in Google Cloud Console
// This is PUBLIC and safe to expose (not a secret)
const GOOGLE_CLIENT_ID = '277440481893-266hjhtdct3vmh1u3rs4cdtt9rrf6a8u.apps.googleusercontent.com'

declare global {
  interface Window {
    google: any
    gapi: any
    gapiInited: boolean
    gisInited: boolean
  }
}

interface SheetData {
  data: any[]
  headers: string[]
  totalRows: number
}

export default function GoogleSheetsPage() {
  // State
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [sheetData, setSheetData] = useState<SheetData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [tokenClient, setTokenClient] = useState<any>(null)
  const [gapiInited, setGapiInited] = useState(false)
  const [gisInited, setGisInited] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [showLatestOnly, setShowLatestOnly] = useState(true)
  
  // Filter data based on search and latest
  useEffect(() => {
    if (!sheetData) {
      setFilteredData([])
      return
    }
    
    let data = [...sheetData.data]
    
    // Show only latest 100 rows if enabled
    if (showLatestOnly && data.length > 100) {
      data = data.slice(-100) // Get last 100 rows
    }
    
    // Apply search filter
    if (searchQuery) {
      data = data.filter(row => {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }
    
    setFilteredData(data)
    setCurrentPage(1) // Reset to first page when data changes
  }, [sheetData, searchQuery, showLatestOnly])
  
  // Calculate paginated data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )
  
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  
  // Initialize Google API
  const initializeGapiClient = async () => {
    try {
      await window.gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
      })
      
      await window.gapi.client.load('sheets', 'v4')
      
      setGapiInited(true)
      console.log('GAPI initialized successfully')
    } catch (error) {
      console.error('Error initializing GAPI:', error)
      toast.error('Failed to initialize Google API')
    }
  }
  
  // Initialize Google Identity Services
  const initializeGisClient = () => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          console.log('Token response:', response)
          if (response.error) {
            toast.error(`Authentication failed: ${response.error}`)
            return
          }
          
          // Successfully got access token
          handleAuthSuccess(response.access_token)
        },
      })
      
      setTokenClient(client)
      setGisInited(true)
      console.log('GIS initialized')
    } catch (error) {
      console.error('Error initializing GIS:', error)
      toast.error('Failed to initialize Google Sign-In')
    }
  }
  
  // Handle successful authentication
  const handleAuthSuccess = async (accessToken: string) => {
    try {
      // Set the access token for gapi
      window.gapi.auth.setToken({ access_token: accessToken })
      window.gapi.client.setToken({ access_token: accessToken })
      
      // Get user info
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const userInfo = await response.json()
        setUserEmail(userInfo.email)
        setIsSignedIn(true)
        toast.success(`Signed in as ${userInfo.email}`)
        
        // Auto-fetch data after sign in
        setTimeout(() => fetchSheetData(), 500)
      } else {
        // Even if user info fails, we're still authenticated
        setIsSignedIn(true)
        toast.success('Signed in successfully')
        setTimeout(() => fetchSheetData(), 500)
      }
    } catch (error) {
      console.error('Error getting user info:', error)
      setIsSignedIn(true)
      setTimeout(() => fetchSheetData(), 500)
    }
  }
  
  // Handle Google Sign In
  const handleSignIn = () => {
    if (!tokenClient) {
      toast.error('Google Sign-In not initialized')
      return
    }
    
    // Request access token
    tokenClient.requestAccessToken({ prompt: 'consent' })
  }
  
  // Handle Sign Out
  const handleSignOut = () => {
    const token = window.gapi.client.getToken()
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token)
      window.gapi.client.setToken(null)
    }
    
    setIsSignedIn(false)
    setUserEmail(null)
    setSheetData(null)
    setFilteredData([])
    toast.success('Signed out successfully')
  }
  
  // Fetch spreadsheet data
  const fetchSheetData = async () => {
    // Check if API is ready
    if (!window.gapi?.client) {
      console.log('GAPI client not ready, waiting...')
      setTimeout(() => fetchSheetData(), 1000)
      return
    }
    
    setFetchingData(true)
    
    try {
      console.log('Fetching spreadsheet data...')
      console.log('Spreadsheet ID:', SPREADSHEET_ID)
      console.log('Range:', RANGE)
      
      const response = await window.gapi.client.request({
        path: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`,
        method: 'GET',
      })
      
      console.log('Response:', response)
      
      const rows = response.result.values || []
      console.log('Received', rows.length, 'rows')
      
      if (rows.length === 0) {
        setSheetData({ data: [], headers: [], totalRows: 0 })
        toast.info('Spreadsheet is empty')
        return
      }
      
      // First row as headers
      const headers = rows[0]
      
      // Convert rows to objects
      const data = rows.slice(1).map((row: any[]) => {
        const obj: any = {}
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index] || ''
        })
        return obj
      })
      
      setSheetData({
        data,
        headers,
        totalRows: data.length
      })
      
      setFilteredData(data)
      toast.success(`Loaded ${data.length} rows from Google Sheets`)
    } catch (error: any) {
      console.error('Error fetching sheet data:', error)
      console.error('Error details:', error.result?.error)
      
      if (error.status === 403) {
        toast.error('Access denied. Make sure you have permission to view this spreadsheet.')
      } else if (error.status === 404) {
        toast.error('Spreadsheet not found. Check the spreadsheet ID.')
      } else if (error.status === 400) {
        toast.error('Invalid request. Check the spreadsheet ID and range.')
      } else {
        toast.error(error.result?.error?.message || error.message || 'Failed to fetch spreadsheet data')
      }
    } finally {
      setFetchingData(false)
    }
  }
  
  // Export data as JSON
  const exportToJSON = () => {
    if (!filteredData || filteredData.length === 0) return
    
    const dataStr = JSON.stringify(filteredData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `google_sheets_data_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Data exported successfully')
  }
  
  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }
  
  return (
    <>
      {/* Load Google API Scripts */}
      <Script
        src="https://apis.google.com/js/api.js"
        onLoad={() => {
          window.gapi.load('client', initializeGapiClient)
        }}
      />
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initializeGisClient}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <h1 className="text-3xl font-bold">Google Sheets Creatives</h1>
              </div>
              <p className="text-gray-600">
                Sign in with your Google account to access the spreadsheet
              </p>
            </div>
            
            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {isSignedIn && userEmail && (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{userEmail}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        {!isSignedIn ? (
          <Card>
            <CardHeader>
              <CardTitle>Sign in to Access Spreadsheet</CardTitle>
              <CardDescription>
                Use your Google account that has access to the private spreadsheet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Secure & Read-Only Access</AlertTitle>
                  <AlertDescription>
                    • This app only requests <strong>read-only</strong> access to Google Sheets<br/>
                    • Your data cannot be modified or deleted<br/>
                    • Sign in with the Google account that has access to the spreadsheet<br/>
                    • No separate API setup needed
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleSignIn} 
                    size="lg"
                    disabled={!gapiInited || !gisInited}
                  >
                    {(!gapiInited || !gisInited) ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign in with Google
                      </>
                    )}
                  </Button>
                  
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View Spreadsheet
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Data Controls */}
            <Card className="mb-6">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search data..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Filter Toggle */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showLatestOnly}
                          onChange={(e) => setShowLatestOnly(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Latest 100 only</span>
                      </label>
                    </div>
                    
                    {/* Stats */}
                    {sheetData && (
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">
                          {filteredData.length} filtered
                        </Badge>
                        <Badge variant="outline">
                          {sheetData.totalRows} total
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={fetchSheetData}
                      disabled={fetchingData}
                    >
                      {fetchingData ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Refresh
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={exportToJSON}
                      disabled={!filteredData || filteredData.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                
                {/* Pagination Controls */}
                {filteredData.length > 0 && (
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Data Table */}
            {fetchingData ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <p className="text-gray-600">Loading spreadsheet data...</p>
                  </div>
                </CardContent>
              </Card>
            ) : sheetData && paginatedData.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="w-full h-[600px]">
                    <div className="min-w-full">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
                          <TableRow>
                            <TableHead className="w-12 text-xs">#</TableHead>
                            {sheetData.headers.slice(0, 10).map((header, index) => (
                              <TableHead key={index} className="min-w-[120px] text-xs">
                                {header}
                              </TableHead>
                            ))}
                            {sheetData.headers.length > 10 && (
                              <TableHead className="text-xs">
                                +{sheetData.headers.length - 10} more
                              </TableHead>
                            )}
                            <TableHead className="w-16 text-xs">Copy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedData.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-xs py-2">
                                {((currentPage - 1) * rowsPerPage) + rowIndex + 1}
                              </TableCell>
                              {sheetData.headers.slice(0, 10).map((header, colIndex) => (
                                <TableCell key={colIndex} className="text-xs py-2">
                                  <div className="max-w-[200px] truncate" title={row[header]}>
                                    {row[header] || '-'}
                                  </div>
                                </TableCell>
                              ))}
                              {sheetData.headers.length > 10 && (
                                <TableCell className="text-xs py-2 text-gray-500">
                                  ...
                                </TableCell>
                              )}
                              <TableCell className="py-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(JSON.stringify(row))}
                                  className="h-7 w-7 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'No matching data found' : 'No data loaded'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search query'
                      : 'Click refresh to load data from the spreadsheet'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={fetchSheetData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Load Data
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
        
        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Spreadsheet ID: {SPREADSHEET_ID}</p>
          <a
            href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
          >
            Open in Google Sheets
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </>
  )
}