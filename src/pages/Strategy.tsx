import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { useData } from "@/contexts/DataContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { geminiService, GeminiMessage } from "@/lib/gemini";
import { formatCO2Tonnes } from "@/lib/calculations";
import { config } from "@/lib/config";
import { Sparkles, Plus } from 'lucide-react';

// Define a Strategy type at the top:
type Strategy = {
  id: string;
  title: string;
  category: string;
  priority: string;
  description: string;
  co2Reduction: string;
  costSaving: string;
  investment: string;
  roi: string;
  implementation: string;
  impact: number;
  feasibility: number;
  aiConfidence: number;
};

const Strategy = () => {
  const { toast } = useToast();
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [detailsStrategy, setDetailsStrategy] = useState<Strategy | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<GeminiMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [aiProvider, setAiProvider] = useState<'gemini'>('gemini');
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 });
  const chatPanelRef = useRef<HTMLDivElement>(null);

  const { emissions, carbonSinks, strategies, getTotalEmissions, getTotalCarbonSinks, getNetEmissions, getReductionPercentage } = useData();
  const totalEmissions = getTotalEmissions();
  const totalCarbonSinks = getTotalCarbonSinks();
  const netEmissions = getNetEmissions();
  const reductionPercentage = getReductionPercentage();

  // Calculate sustainability score
  const sustainabilityScore = Math.min(10, Math.max(0, 
    (reductionPercentage / 10) + (netEmissions < totalEmissions * 0.5 ? 5 : 0) + 
    (strategies.filter(s => s.status === 'completed').length * 2)
  ));

  const strategicRecommendations = [
    {
      id: "solar-energy",
      title: "Solar Energy Installation",
      category: "Renewable Energy",
      priority: "High",
      description: "Install 2MW solar panels on mine office buildings and processing facilities",
      co2Reduction: "1,450 tonnes/year",
      costSaving: "₹18.5 lakhs/year",
      investment: "₹2.1 crores",
      roi: "8.7 years",
      implementation: "6-8 months",
      impact: 85,
      feasibility: 92,
      aiConfidence: 94
    },
    {
      id: "led-lighting",
      title: "LED Lighting Upgrade",
      category: "Energy Efficiency",
      priority: "Medium",
      description: "Replace all conventional lighting with LED systems across mining operations",
      co2Reduction: "320 tonnes/year",
      costSaving: "₹4.2 lakhs/year",
      investment: "₹15 lakhs",
      roi: "3.5 years",
      implementation: "2-3 months",
      impact: 45,
      feasibility: 98,
      aiConfidence: 96
    },
    {
      id: "electric-vehicles",
      title: "Electric Vehicle Fleet",
      category: "Transportation",
      priority: "High",
      description: "Transition 60% of light vehicle fleet to electric vehicles",
      co2Reduction: "890 tonnes/year",
      costSaving: "₹12.8 lakhs/year",
      investment: "₹85 lakhs",
      roi: "6.6 years",
      implementation: "12-18 months",
      impact: 70,
      feasibility: 78,
      aiConfidence: 88
    },
    {
      id: "methane-capture",
      title: "Methane Capture System",
      category: "Process Optimization",
      priority: "High",
      description: "Install methane capture and utilization system for mine ventilation",
      co2Reduction: "2,150 tonnes/year",
      costSaving: "₹24.5 lakhs/year",
      investment: "₹3.5 crores",
      roi: "14.3 years",
      implementation: "18-24 months",
      impact: 95,
      feasibility: 65,
      aiConfidence: 82
    },
    {
      id: "afforestation",
      title: "Large Scale Afforestation",
      category: "Carbon Sequestration",
      priority: "Medium",
      description: "Plant 50,000 trees across 200 hectares of mine periphery",
      co2Reduction: "2,500 tonnes/year",
      costSaving: "₹0/year",
      investment: "₹45 lakhs",
      roi: "Carbon credits",
      implementation: "6-12 months",
      impact: 80,
      feasibility: 88,
      aiConfidence: 91
    }
  ];

  const handleApplyStrategy = (strategyId: string) => {
    const strategy = strategicRecommendations.find(s => s.id === strategyId);
    setSelectedStrategy(strategyId);
    toast({
      title: "Strategy Application Initiated",
      description: `${strategy?.title} has been added to your implementation plan`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Renewable Energy": return "☀️";
      case "Energy Efficiency": return "💡";
      case "Transportation": return "🚗";
      case "Process Optimization": return "⚙️";
      case "Carbon Sequestration": return "🌳";
      default: return "📊";
    }
  };

  async function sendMessageToGemini(message: string) {
    setChatMessages((msgs) => [...msgs, { role: 'user', content: message }]);
    setChatInput("");
    setGeminiError(null);
    setLoading(true);
    
    try {
      const dashboardContext = {
        totalEmissions,
        totalCarbonSinks,
        netEmissions,
        reductionPercentage,
        sustainabilityScore
      };

      const response = await geminiService.chatWithAssistant(
        message,
        chatMessages,
        dashboardContext
      );

      setLoading(false);
      setChatMessages((msgs) => [...msgs, { role: 'model', content: response }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setLoading(false);
      setGeminiError("Gemini AI error: " + (err instanceof Error ? err.message : String(err)));
      setChatMessages((msgs) => [...msgs, { 
        role: 'model', 
        content: "Sorry, there was an error contacting Gemini AI. Please check your internet connection and try again." 
      }]);
    }
  }

  async function handleSendChat(message: string) {
    await sendMessageToGemini(message);
  }

  async function generateAIInsights() {
    setLoading(true);
    try {
      const emissionsData = {
        totalEmissions,
        totalCarbonSinks,
        netEmissions,
        reductionPercentage
      };

      const insights = await geminiService.generateStrategyRecommendations(
        emissionsData,
        carbonSinks,
        strategies
      );

      setChatMessages([{ role: 'model', content: insights }]);
      setChatOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Helper to get a user-friendly model name
  const getModelDisplayName = (model: string) => {
    if (model === 'gemini-1.5-flash') return 'Gemini 1.5 Flash';
    if (model === 'gemini-2.0-flash') return 'Gemini 2.0 Flash';
    if (model === 'gemini-pro') return 'Gemini Pro';
    return model;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Strategy Recommendations</h1>
          <p className="text-gray-600 mt-1">Personalized carbon reduction strategies powered by AI Assistant</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="all-categories">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              <SelectItem value="renewable-energy">Renewable Energy</SelectItem>
              <SelectItem value="energy-efficiency">Energy Efficiency</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="process-optimization">Process Optimization</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={generateAIInsights}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-blue-500 mr-1" />
                <span>Generate AI Analysis</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Analysis Summary */}
      <Card className="eco-card animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span>AI Assistant Analysis Summary</span>
          </CardTitle>
          <CardDescription>
            Based on your mine's emission profile and industry best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-gray-600">Strategies Identified</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">7,310</div>
              <div className="text-sm text-gray-600">Potential CO₂ Reduction (tonnes/year)</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">₹60L</div>
              <div className="text-sm text-gray-600">Annual Cost Savings</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-orange-600">89%</div>
              <div className="text-sm text-gray-600">AI Confidence Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Plan</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {strategicRecommendations.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(strategy.category)}</span>
                      <div>
                        <CardTitle className="text-xl">{strategy.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {strategy.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getPriorityColor(strategy.priority)}>
                        {strategy.priority} Priority
                      </Badge>
                      <Badge variant="outline">
                        {strategy.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-700">{strategy.co2Reduction}</div>
                      <div className="text-xs text-gray-600">CO₂ Reduction</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-700">{strategy.costSaving}</div>
                      <div className="text-xs text-gray-600">Annual Savings</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="font-semibold text-orange-700">{strategy.investment}</div>
                      <div className="text-xs text-gray-600">Investment</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-semibold text-purple-700">{strategy.roi}</div>
                      <div className="text-xs text-gray-600">Payback Period</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Environmental Impact</span>
                        <span>{strategy.impact}%</span>
                      </div>
                      <Progress value={strategy.impact} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Implementation Feasibility</span>
                        <span>{strategy.feasibility}%</span>
                      </div>
                      <Progress value={strategy.feasibility} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>AI Confidence</span>
                        <span>{strategy.aiConfidence}%</span>
                      </div>
                      <Progress value={strategy.aiConfidence} className="h-2" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Implementation Time:</span> {strategy.implementation}
                    </div>
                    <div className="space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDetailsStrategy(strategy);
                          setDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button 
                        onClick={() => handleApplyStrategy(strategy.id)}
                        className="sustainability-gradient text-white"
                        size="sm"
                      >
                        Apply Strategy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Roadmap</CardTitle>
              <CardDescription>
                Phased approach to implementing your carbon reduction strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-lg">Phase 1: Quick Wins (0-6 months)</h3>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• LED Lighting Upgrade - ₹15L investment, 320 tonnes CO₂ reduction</li>
                    <li>• Energy Audit and Basic Efficiency Measures</li>
                    <li>• Employee Training and Awareness Programs</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-lg">Phase 2: Medium-term Projects (6-18 months)</h3>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Solar Energy Installation - ₹2.1Cr investment, 1,450 tonnes CO₂ reduction</li>
                    <li>• Electric Vehicle Fleet Transition</li>
                    <li>• Afforestation Program Launch</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-lg">Phase 3: Complex Systems (18+ months)</h3>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Methane Capture System - ₹3.5Cr investment, 2,150 tonnes CO₂ reduction</li>
                    <li>• Advanced Process Optimization</li>
                    <li>• Carbon Credit Program Development</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant Model Performance</CardTitle>
                <CardDescription>
                  How our recommendation engine analyzed your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Data Quality Score</span>
                  <span className="font-semibold">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Model Accuracy</span>
                  <span className="font-semibold">89%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Prediction Confidence</span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Similar Mines Analyzed</span>
                  <span className="font-semibold">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">AI Provider</span>
                  <span className="font-semibold text-blue-600">{getModelDisplayName(config.gemini.model)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  AI-powered guidance for your carbon journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <strong>💡 Smart Tip:</strong> Based on your current emission patterns, 
                      prioritizing renewable energy will yield the highest ROI within 2 years.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm">
                      <strong>🎯 Goal Insight:</strong> You're {Math.round((reductionPercentage / 30) * 100)}% of the way to your 2024 
                      reduction target. Focus on transportation electrification to close the gap.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm">
                      <strong>🤖 AI Recommendation:</strong> Your sustainability score of {sustainabilityScore.toFixed(1)}/10 indicates 
                      strong progress. Consider methane capture systems for maximum impact.
                    </p>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => setChatOpen(true)}>
                    💬 Chat with AI Assistant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setDetailsStrategy(null);
        }}
      >
        <SheetContent side="right" className="max-w-md w-full">
          {!!detailsStrategy && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <span className="text-2xl">{getCategoryIcon(detailsStrategy.category)}</span>
                  <span>{detailsStrategy.title}</span>
                </SheetTitle>
                <SheetDescription>{detailsStrategy.description}</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="font-semibold text-green-700">{detailsStrategy.co2Reduction}</div>
                  <div className="text-xs text-gray-600">CO₂ Reduction</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="font-semibold text-blue-700">{detailsStrategy.costSaving}</div>
                  <div className="text-xs text-gray-600">Annual Savings</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="font-semibold text-orange-700">{detailsStrategy.investment}</div>
                  <div className="text-xs text-gray-600">Investment</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="font-semibold text-purple-700">{detailsStrategy.roi}</div>
                  <div className="text-xs text-gray-600">Payback Period</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Environmental Impact:</span>
                  <span>{detailsStrategy.impact}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Implementation Feasibility:</span>
                  <span>{detailsStrategy.feasibility}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>AI Confidence:</span>
                  <span>{detailsStrategy.aiConfidence}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Implementation Time:</span>
                  <span>{detailsStrategy.implementation}</span>
                </div>
              </div>
              <SheetFooter className="mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  onClick={() => setDetailsOpen(false)}
                >
                  Close
                </button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-white/60 backdrop-blur-md shadow-lg rounded-full p-4 border border-white/30 hover:bg-white/80 transition flex items-center gap-2"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
          aria-label="Open AI Assistant Chat"
        >
          <Plus className="w-7 h-7 text-green-600 animate-bounce" />
          <span className="font-semibold text-blue-700 hidden md:inline">AI Assistant</span>
        </button>
      )}

      {/* Floating Glass Chat Panel */}
      {chatOpen && (
        <div
          ref={chatPanelRef}
          className="fixed z-50 w-[95vw] max-w-md bottom-6 right-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 flex flex-col"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            cursor: isDragging ? 'grabbing' : 'default',
            transform: `translate(${chatPosition.x}px, ${chatPosition.y}px)`
          }}
          onMouseDown={e => {
            if ((e.target as HTMLElement).classList.contains('chat-drag-handle')) {
              setIsDragging(true);
              setDragOffset({ x: e.clientX - chatPosition.x, y: e.clientY - chatPosition.y });
            }
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseMove={e => {
            if (isDragging) {
              setChatPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
            }
          }}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* Drag handle and close button */}
          <div className="chat-drag-handle flex items-center justify-between px-4 py-2 cursor-move select-none bg-white/40 rounded-t-2xl border-b border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-semibold text-blue-700">AI Assistant</span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-gray-500 hover:text-red-500 transition text-xl font-bold px-2"
              aria-label="Close Chat"
            >
              ×
            </button>
          </div>
          <div className="px-4 pt-2 pb-3 flex-1 flex flex-col min-h-[350px] max-h-[70vh] overflow-y-auto">
            {/* Alerts */}
            {totalEmissions > 1000 && chatOpen && (
              <Alert variant="destructive" className="mb-4 mt-2">
                <AlertTitle>⚠️ Warning: Emissions are critically high!</AlertTitle>
                <AlertDescription>
                  Your total CO₂ emissions exceed 1000 tonnes. Immediate action is recommended.
                </AlertDescription>
              </Alert>
            )}
            {geminiError && (
              <Alert variant="destructive" className="mb-4 mt-2">
                <AlertTitle>AI Assistant Error</AlertTitle>
                <AlertDescription>
                  {geminiError}<br />
                  <span>Please check your API key, endpoint, and internet connection. (Gemini AI is a cloud service, not a local model.)</span>
                </AlertDescription>
              </Alert>
            )}
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto my-2 px-1">
              {chatMessages.length === 0 && !loading && (
                <div className="text-gray-400 text-center mt-12">Start the conversation...</div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className={`max-w-[80%] flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                          <span>🧑</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                          <span>🤖</span>
                        </div>
                      )}
                    </div>
                    {/* Chat Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-md text-base whitespace-pre-line font-sans transition-all duration-500
                        ${msg.role === 'user'
                          ? 'bg-gradient-to-br from-green-50 to-emerald-100 text-green-900 border border-green-200 animate-slide-in-right'
                          : 'bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-900 border border-blue-200 animate-slide-in-left'}
                      `}
                      style={{
                        fontFamily: 'inherit',
                        wordBreak: 'break-word',
                        lineHeight: '1.6',
                      }}
                    >
                      {msg.role === 'model' ? (
                        <ChatFormattedResponse content={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-center items-center mt-8 mb-4">
                  <svg className="animate-spin h-7 w-7 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  <span className="text-blue-600 font-medium">AI is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <form
              className="flex gap-2 mt-auto"
              onSubmit={e => {
                e.preventDefault();
                if (chatInput.trim() && !loading) handleSendChat(chatInput.trim());
              }}
            >
              <input
                className="flex-1 border rounded px-3 py-2 focus:outline-none bg-white/70"
                placeholder="Type your message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                autoFocus
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                disabled={!chatInput.trim() || loading}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component to format AI response
function ChatFormattedResponse({ content }: { content: string }) {
  // Split into lines and detect points
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  const isList = lines.length > 1 && lines.every(line => /^\d+\.|[-*•]/.test(line.trim()));
  if (isList) {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {lines.map((line, i) => (
          <li key={i}>{line.replace(/^\d+\.|[-*•]\s*/, '').trim()}</li>
        ))}
      </ul>
    );
  }
  // Otherwise, show as paragraphs
  return (
    <div className="space-y-2">
      {lines.map((line, i) => <p key={i}>{line}</p>)}
    </div>
  );
}

export default Strategy;
