"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Phone, TestTube, CheckCircle, XCircle } from "lucide-react";

export function MpesaTest() {
  const [phone, setPhone] = useState("254708374149"); // Test phone number
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testMpesaConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: "test-item",
              name: "Test Cake",
              price: parseFloat(amount),
              quantity: 1,
              image: "/placeholder.jpg",
              seller: "Test Seller",
            },
          ],
          phone,
          guestName: "Test User",
          guestEmail: "test@example.com",
        }),
      });

      const data = await response.json();
      setTestResult({ success: response.ok, data });

      if (response.ok) {
        toast.success("M-Pesa test initiated successfully!");
      } else {
        toast.error(data.error || "M-Pesa test failed");
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message });
      toast.error("M-Pesa test failed");
    } finally {
      setLoading(false);
    }
  };

  const testCallback = async () => {
    try {
      const response = await fetch("/api/mpesa/callback", {
        method: "GET",
      });
      const data = await response.json();
      toast.success("Callback endpoint is active");
      console.log("Callback test response:", data);
    } catch (error) {
      toast.error("Callback test failed");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          M-Pesa Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Phone Number</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="254708374149"
            className="font-mono"
          />
          <p className="text-xs text-gray-500">
            Use 254708374149 for success, 254708374150 for insufficient funds
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Test Amount (KSh)</label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="1"
            max="1000"
            className="font-mono"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={testMpesaConnection}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Test STK Push
              </>
            )}
          </Button>

          <Button
            onClick={testCallback}
            variant="outline"
            size="sm"
          >
            Test Callback
          </Button>
        </div>

        {testResult && (
          <div className="mt-4 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">
                {testResult.success ? "Test Successful" : "Test Failed"}
              </span>
            </div>
            
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(testResult.data || testResult.error, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_MPESA_BASE_URL || "Not set"}</p>
          <p><strong>Short Code:</strong> {process.env.NEXT_PUBLIC_MPESA_BUSINESS_SHORT_CODE || "Not set"}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This is for testing only. Make sure you have valid M-Pesa credentials in your environment variables.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 