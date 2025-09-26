"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface ExtractedData {
  fullName?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  idNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  expirationDate?: string
  issueDate?: string
  gender?: string
  height?: string
  weight?: string
  eyeColor?: string
}

export function IDScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData>({})
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("scan")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setScannedImage(imageData)
        processImage(imageData)
        stopCamera()
      }
    }
  }, [stopCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setScannedImage(imageData)
        processImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const processImage = async (imageData: string) => {
    setIsScanning(true)

    try {
      // Simulate OCR processing with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock extracted data - in a real app, this would come from an OCR service
      const mockData: ExtractedData = {
        fullName: "John Michael Smith",
        firstName: "John",
        lastName: "Smith",
        dateOfBirth: "1985-03-15",
        idNumber: "DL123456789",
        address: "123 Main Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
        country: "United States",
        expirationDate: "2028-03-15",
        issueDate: "2023-03-15",
        gender: "M",
        height: "5'10\"",
        eyeColor: "Brown",
      }

      setExtractedData(mockData)
      setActiveTab("results")

      toast({
        title: "Scan Complete",
        description: "ID information has been successfully extracted.",
      })
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const clearData = () => {
    setExtractedData({})
    setScannedImage(null)
    setActiveTab("scan")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan">Scan ID</TabsTrigger>
          <TabsTrigger value="results">Extracted Data</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Camera Scan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {!streamRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p className="text-muted-foreground">Camera preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={startCamera} variant="outline" className="flex-1 bg-transparent">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Start Camera
                </Button>
                <Button onClick={captureImage} disabled={!streamRef.current || isScanning} className="flex-1">
                  {isScanning ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Capture & Scan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-muted-foreground mb-4">Drag and drop an ID card image, or click to browse</p>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isScanning}>
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {scannedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Scanned Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative max-w-md mx-auto">
                  <img src={scannedImage || "/placeholder.svg"} alt="Scanned ID" className="w-full rounded-lg border" />
                  <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">Processed</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Extracted Information</CardTitle>
              <Button onClick={clearData} variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                New Scan
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.keys(extractedData).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>No data extracted yet. Scan an ID card to get started.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Personal Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {extractedData.fullName && (
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <div className="flex gap-2">
                            <Input id="fullName" value={extractedData.fullName} readOnly className="bg-muted" />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(extractedData.fullName!)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}

                      {extractedData.dateOfBirth && (
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <div className="flex gap-2">
                            <Input id="dob" value={extractedData.dateOfBirth} readOnly className="bg-muted" />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(extractedData.dateOfBirth!)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}

                      {extractedData.idNumber && (
                        <div className="space-y-2">
                          <Label htmlFor="idNumber">ID Number</Label>
                          <div className="flex gap-2">
                            <Input id="idNumber" value={extractedData.idNumber} readOnly className="bg-muted" />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(extractedData.idNumber!)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}

                      {extractedData.gender && (
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <div className="flex gap-2">
                            <Input id="gender" value={extractedData.gender} readOnly className="bg-muted" />
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(extractedData.gender!)}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Address Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {extractedData.address && (
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Street Address</Label>
                          <div className="flex gap-2">
                            <Input id="address" value={extractedData.address} readOnly className="bg-muted" />
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(extractedData.address!)}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}

                      {extractedData.city && (
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <div className="flex gap-2">
                            <Input id="city" value={extractedData.city} readOnly className="bg-muted" />
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(extractedData.city!)}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}

                      {extractedData.state && (
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <div className="flex gap-2">
                            <Input id="state" value={extractedData.state} readOnly className="bg-muted" />
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(extractedData.state!)}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}

                      {extractedData.zipCode && (
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <div className="flex gap-2">
                            <Input id="zipCode" value={extractedData.zipCode} readOnly className="bg-muted" />
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(extractedData.zipCode!)}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Document Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {extractedData.issueDate && (
                        <div className="space-y-2">
                          <Label htmlFor="issueDate">Issue Date</Label>
                          <div className="flex gap-2">
                            <Input id="issueDate" value={extractedData.issueDate} readOnly className="bg-muted" />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(extractedData.issueDate!)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}

                      {extractedData.expirationDate && (
                        <div className="space-y-2">
                          <Label htmlFor="expirationDate">Expiration Date</Label>
                          <div className="flex gap-2">
                            <Input
                              id="expirationDate"
                              value={extractedData.expirationDate}
                              readOnly
                              className="bg-muted"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(extractedData.expirationDate!)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
