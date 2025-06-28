import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { formatCO2Tonnes, formatCO2Value } from "@/lib/calculations";
import { AnimatePresence, motion } from 'framer-motion';
import jsPDF from "jspdf";
import { AlertTriangle, Award, Bell, CheckCircle, Factory, Info, Leaf, Minus, Target, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'reminder';
  title: string;
  message: string;
  mine?: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    emissions, 
    carbonSinks, 
    strategies, 
    getTotalEmissions, 
    getTotalCarbonSinks, 
    getNetEmissions, 
    getReductionPercentage 
  } = useData();

  const [animatedValues, setAnimatedValues] = useState({
    totalEmissions: 0,
    totalCarbonSinks: 0,
    reductionPercentage: 0,
    sustainabilityScore: 0
  });

  // Calculate real statistics
  const totalEmissions = getTotalEmissions();
  const totalCarbonSinks = getTotalCarbonSinks();
  const netEmissions = getNetEmissions();
  const reductionPercentage = getReductionPercentage();
  
  // Calculate sustainability score (0-10)
  const sustainabilityScore = Math.min(10, Math.max(0, 
    (reductionPercentage / 10) + (netEmissions < totalEmissions * 0.5 ? 5 : 0) + 
    (strategies.filter(s => s.status === 'completed').length * 2)
  ));

  // Calculate carbon credit (if offsets > emissions)
  const carbonCredit = Math.max(totalCarbonSinks - totalEmissions, 0);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'high-priority'>('all');
  const [animatingOut, setAnimatingOut] = useState<string[]>([]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (notificationFilter) {
      case 'unread':
        return !notification.read;
      case 'high-priority':
        return notification.priority === 'high';
      default:
        return true;
    }
  });

  // Sort notifications by priority and date
  const sortedNotifications = filteredNotifications.sort((a, b) => {
    // First by priority (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority] || 0;
    const bPriority = priorityOrder[b.priority] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Then by read status (unread first)
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    
    // Finally by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Animate numbers on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedValues({
        totalEmissions: totalEmissions * easeOutQuart,
        totalCarbonSinks: totalCarbonSinks * easeOutQuart,
        reductionPercentage: reductionPercentage * easeOutQuart,
        sustainabilityScore: sustainabilityScore * easeOutQuart
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues({
          totalEmissions,
          totalCarbonSinks,
          reductionPercentage,
          sustainabilityScore
        });
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [totalEmissions, totalCarbonSinks, reductionPercentage, sustainabilityScore]);

  // Example mine data (replace with real data if available)
  const mines = [
    { name: "Jharia", complianceScore: 45, status: "Non-Reporting", emissions: totalEmissions },
    { name: "Singareni", complianceScore: 94, status: "Active", emissions: totalEmissions * 0.5 },
    { name: "Bokaro", complianceScore: 78, status: "Active", emissions: totalEmissions * 0.3 },
    { name: "Raniganj", complianceScore: 92, status: "Active", emissions: totalEmissions * 0.2 },
  ];

  // Generate comprehensive notifications
  useEffect(() => {
    const newNotifications: Notification[] = [];
    const emissionThreshold = 10000; // Example threshold
    const currentDate = new Date();
    
    // Success notifications
    if (reductionPercentage > 20) {
      newNotifications.push({
        id: 'success-reduction',
        type: 'success',
        title: 'Excellent Progress!',
        message: `You've achieved ${reductionPercentage.toFixed(1)}% emission reduction. Keep up the great work!`,
        date: currentDate.toLocaleDateString(),
        read: false,
        priority: 'high',
        action: 'View Details'
      });
    }

    if (carbonCredit > 0) {
      newNotifications.push({
        id: 'success-carbon-credit',
        type: 'success',
        title: 'Carbon Credit Achieved!',
        message: `Congratulations! You've generated ${formatCO2Tonnes(carbonCredit)} in carbon credits.`,
        date: currentDate.toLocaleDateString(),
        read: false,
        priority: 'high',
        action: 'Claim Credits'
      });
    }

    if (sustainabilityScore > 7) {
      newNotifications.push({
        id: 'success-sustainability',
        type: 'success',
        title: 'High Sustainability Score',
        message: `Your sustainability score is ${sustainabilityScore.toFixed(1)}/10. You're leading the industry!`,
        date: currentDate.toLocaleDateString(),
        read: false,
        priority: 'medium',
        action: 'View Report'
      });
    }

    // Warning notifications for mines
    mines.forEach(mine => {
      if (mine.emissions > emissionThreshold) {
        newNotifications.push({
          id: `emission-${mine.name}`,
          type: 'warning',
          title: 'Excess Emissions Alert',
          message: `Mine '${mine.name}' exceeded the monthly CO₂ emission threshold by ${((mine.emissions - emissionThreshold) / emissionThreshold * 100).toFixed(1)}%.`,
          mine: mine.name,
          date: currentDate.toLocaleDateString(),
          read: false,
          priority: 'high',
          action: 'Review Emissions'
        });
      }
      
      if (mine.complianceScore < 60) {
        newNotifications.push({
          id: `risk-${mine.name}`,
          type: 'error',
          title: 'High Risk Mine',
          message: `Mine '${mine.name}' is flagged as high risk (compliance: ${mine.complianceScore}%). Immediate action required.`,
          mine: mine.name,
          date: currentDate.toLocaleDateString(),
          read: false,
          priority: 'high',
          action: 'Take Action'
        });
      }
      
      if (mine.status === "Non-Reporting") {
        newNotifications.push({
          id: `nonreporting-${mine.name}`,
          type: 'warning',
          title: 'Non-Reporting Mine',
          message: `Mine '${mine.name}' has not reported emissions this month. Please update data.`,
          mine: mine.name,
          date: currentDate.toLocaleDateString(),
          read: false,
          priority: 'medium',
          action: 'Update Data'
        });
      }
    });

    // Reminders
    if (emissions.length === 0) {
      newNotifications.push({
        id: 'reminder-no-data',
        type: 'reminder',
        title: 'Data Entry Reminder',
        message: 'No emission data has been entered yet. Start tracking your carbon footprint today!',
        date: currentDate.toLocaleDateString(),
        read: false,
        priority: 'medium',
        action: 'Add Data'
      });
    }

    if (strategies.length === 0) {
      newNotifications.push({
        id: 'reminder-no-strategies',
        type: 'reminder',
        title: 'Strategy Planning',
        message: 'No carbon reduction strategies have been created. Plan your path to net-zero!',
        date: currentDate.toLocaleDateString(),
        read: false,
        priority: 'medium',
        action: 'Create Strategy'
      });
    }

    // Recommendations
    if (reductionPercentage < 10) {
      newNotifications.push({
        id: 'recommendation-reduction',
        type: 'info',
        title: 'Reduction Opportunity',
        message: 'Consider implementing energy-efficient technologies to increase your reduction percentage.',
        date: currentDate.toLocaleDateString(),
        read: false,
        priority: 'medium',
        action: 'View Recommendations'
      });
    }

    if (carbonSinks.length === 0) {
      newNotifications.push({
        id: 'recommendation-sinks',
        type: 'info',
        title: 'Carbon Offset Opportunity',
        message: 'Start carbon sink projects to offset your emissions and achieve carbon neutrality faster.',
        date: currentDate.toLocaleDateString(),
        read: false,
        priority: 'low',
        action: 'Explore Projects'
      });
    }

    // Weekly report reminder
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 1) { // Monday
      newNotifications.push({
        id: 'reminder-weekly-report',
        type: 'reminder',
        title: 'Weekly Report Due',
        message: 'Your weekly carbon emissions report is due. Generate and submit your report.',
        date: currentDate.toLocaleDateString(),
        read: false,
        priority: 'medium',
        action: 'Generate Report'
      });
    }

    setNotifications(newNotifications);
  }, [mines, totalEmissions, reductionPercentage, carbonCredit, sustainabilityScore, emissions.length, strategies.length, carbonSinks.length]);

  // Mark notification as read with animation
  const markAsRead = (id: string) => {
    setAnimatingOut((prev) => [...prev, id]);
    setTimeout(() => {
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setAnimatingOut((prev) => prev.filter(animId => animId !== id));
    }, 350); // Match animation duration
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'reminder':
        return <Bell className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get notification priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Stats cards
  const statsData = [
    {
      title: "Total CO₂ Emissions",
      value: formatCO2Tonnes(animatedValues.totalEmissions),
      change: totalEmissions > 0 ? "+" + (totalEmissions * 0.05).toFixed(1) + "%" : "0%",
      trend: "up" as const,
      icon: Factory,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700"
    },
    {
      title: "Carbon Offsets",
      value: formatCO2Tonnes(animatedValues.totalCarbonSinks),
      change: totalCarbonSinks > 0 ? "+" + (totalCarbonSinks * 0.15).toFixed(1) + "%" : "0%",
      trend: "up" as const,
      icon: Leaf,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Reduction Achieved",
      value: animatedValues.reductionPercentage.toFixed(1),
      unit: "%",
      change: reductionPercentage > 0 ? "+" + (reductionPercentage * 0.1).toFixed(1) + "%" : "0%",
      trend: "up" as const,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Sustainability Score",
      value: animatedValues.sustainabilityScore.toFixed(1),
      unit: "/10",
      change: sustainabilityScore > 0 ? "+" + (sustainabilityScore * 0.05).toFixed(1) : "0",
      trend: "up" as const,
      icon: Award,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      title: "Carbon Credit",
      value: formatCO2Tonnes(carbonCredit),
      unit: "tCO₂e",
      change: carbonCredit > 0 ? "+" + (carbonCredit * 0.1).toFixed(1) + "%" : "0%",
      trend: carbonCredit > 0 ? "up" : "none",
      icon: Award,
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700"
    }
  ];

  // Group emissions by activity type for pie chart
  const emissionsByActivity = emissions.reduce((acc, emission) => {
    const activity = emission.activityType;
    if (acc[activity]) {
      acc[activity] += emission.co2e;
    } else {
      acc[activity] = emission.co2e;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(emissionsByActivity).map(([name, value], index) => ({
    name,
    value,
    color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][index % 6]
  }));

  // Prepare time series data for line chart
  const monthlyData = emissions.reduce((acc, emission) => {
    const month = new Date(emission.date).toLocaleDateString('en-US', { month: 'short' });
    if (acc[month]) {
      acc[month].emissions += emission.co2e;
    } else {
      acc[month] = { month, emissions: emission.co2e, target: emission.co2e * 0.9 };
    }
    return acc;
  }, {} as Record<string, { month: string; emissions: number; target: number }>);

  const emissionsOverTime = Object.values(monthlyData).sort((a, b) => 
    new Date(a.month + ' 1, 2024').getTime() - new Date(b.month + ' 1, 2024').getTime()
  );

  const handleExportPDF = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 40;

    // Set eco-friendly background
    doc.setFillColor(240, 255, 245);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add logo (SVG) at top left
    try {
      const img = await fetch("/placeholder.svg").then(r => r.blob()).then(blob => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }));
      doc.addImage(img, "SVG", 40, 40, 60, 60);
    } catch {}

    // Heading at top right
    doc.setFontSize(20);
    doc.setTextColor(34, 139, 34);
    doc.setFont("helvetica", "bold");
    doc.text("Dashboard Carbon Performance Report", pageWidth - 60, 60, { align: "right" });
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text("NextCoal Initiative", pageWidth - 60, 80, { align: "right" });

    // Horizontal line
    doc.setDrawColor(200, 220, 200);
    doc.setLineWidth(1);
    doc.line(40, 100, pageWidth - 40, 100);
    y = 120;

    // Key Stats (stacked, left-aligned)
    doc.setFontSize(12);
    doc.setTextColor(34, 139, 34);
    doc.setFont("helvetica", "bold");
    doc.text("Key Stats", 60, y);
    y += 20;
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Emissions: ${formatCO2Tonnes(totalEmissions)}`, 60, y); y += 16;
    doc.text(`Total Offsets: ${formatCO2Tonnes(totalCarbonSinks)}`, 60, y); y += 16;
    doc.text(`Net Emissions: ${formatCO2Tonnes(netEmissions)}`, 60, y); y += 16;
    doc.text(`Reduction Achieved: ${reductionPercentage.toFixed(1)}%`, 60, y); y += 16;
    doc.text(`Sustainability Score: ${sustainabilityScore.toFixed(1)}/10`, 60, y); y += 16;
    doc.text(`Entries: ${emissions.length}`, 60, y); y += 16;
    doc.text(`Carbon Sink Projects: ${carbonSinks.length}`, 60, y); y += 24;

    // Executive Summary (short, clear, left-aligned, max 3-4 lines)
    doc.setFontSize(12);
    doc.setTextColor(34, 139, 34);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 60, y);
    y += 18;
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    const summary =
      `Your mine recorded ${formatCO2Tonnes(totalEmissions)} emissions and ${formatCO2Tonnes(totalCarbonSinks)} offsets, resulting in net emissions of ${formatCO2Tonnes(netEmissions)}.\nReduction achieved: ${reductionPercentage.toFixed(1)}%. Sustainability score: ${sustainabilityScore.toFixed(1)}/10.`;
    doc.text(summary, 60, y, { maxWidth: pageWidth - 120, lineHeightFactor: 1.5 });
    y += 60;

    // Signature (bottom right)
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("_________________________", pageWidth - 200, pageHeight - 90, { align: "left" });
    doc.text("Authorized User", pageWidth - 200, pageHeight - 70, { align: "left" });
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text("(Digitally generated)", pageWidth - 200, pageHeight - 55, { align: "left" });

    // Add stampseal image (bottom left)
    try {
      const sealImg = await fetch("/Stampseal.png").then(r => r.blob()).then(blob => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }));
      doc.addImage(sealImg, "PNG", 40, pageHeight - 110, 80, 80);
    } catch {}

    // Footer (centered)
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Report generated by NextCoal Initiative Dashboard | Confidential",
      pageWidth / 2,
      pageHeight - 30,
      { align: "center" }
    );

    // Download PDF
    const url = doc.output('bloburl');
    const a = document.createElement('a');
    a.href = url;
    a.download = "dashboard_report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 animate-slide-up">
        <div>
          <h1 className="heading-lg text-gray-900 flex items-center">
            <span className="mr-3">🌱</span>
            Carbon Emissions Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Welcome back, <span className="font-semibold text-green-600">{user?.name}</span>. 
            Monitor and manage your mine's carbon footprint
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification Button */}
          <div className="relative notification-dropdown">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative hover:bg-green-50 focus-ring"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllAsRead}
                        className="text-xs hover:bg-green-100"
                      >
                        Mark all read
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowNotifications(false)}
                        className="text-xs hover:bg-gray-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {unreadCount} unread • {notifications.length} total
                  </p>
                </div>
                
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {sortedNotifications.filter(n => !n.read).map((notification) =>
                        animatingOut.includes(notification.id) ? null : (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            className={`p-3 rounded-lg border-l-4 mb-2 transition-all duration-200 hover:shadow-md ${getPriorityColor(notification.priority)}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                  {notification.message}
                                </p>
                                {notification.mine && (
                                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mt-2">
                                    {notification.mine}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {notification.date}
                                </span>
                                {notification.action && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-xs h-6 px-2 hover:bg-green-100 text-green-700"
                                  >
                                    {notification.action}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs h-6 px-2 hover:bg-blue-100 text-blue-700"
                                >
                                  Mark read
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => deleteNotification(notification.id)}
                                className="text-xs h-6 px-2 hover:bg-red-100 text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            )}
          </div>

          <Select defaultValue="last-6-months">
            <SelectTrigger className="w-40 focus-ring">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF} className="ripple focus-ring">
            <span className="mr-2">📊</span>
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="eco-card animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
                {stat.unit && <span className="text-lg font-normal text-gray-500 ml-1">{stat.unit}</span>}
              </div>
              <div className="flex items-center">
                <Badge 
                  variant={stat.trend === "up" ? "default" : "secondary"}
                  className={`text-xs bg-gradient-to-r ${stat.color} text-white`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : stat.trend === "down" ? (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  ) : (
                    <Minus className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
                <span className="text-xs text-gray-500 ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Carbon Neutrality Progress */}
      <Card className="eco-card animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <span className="mr-2">🎯</span>
            Carbon Neutrality Progress
          </CardTitle>
          <CardDescription>
            Your journey towards achieving net-zero emissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between text-sm">
              <span>Net Emissions: {formatCO2Tonnes(netEmissions)}</span>
              <span>Target: 0 tonnes CO₂e</span>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min((netEmissions / Math.max(totalEmissions, 1)) * 100, 100)} 
                className="h-4 animate-progress"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full opacity-20"></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-red-50 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-2xl font-bold text-red-600">{formatCO2Tonnes(totalEmissions)}</div>
                <div className="text-sm text-gray-500 flex items-center justify-center">
                  <Factory className="w-4 h-4 mr-1" />
                  Total Emissions
                </div>
              </div>
              <div className="p-4 rounded-lg bg-green-50 animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <div className="text-2xl font-bold text-green-600">{formatCO2Tonnes(totalCarbonSinks)}</div>
                <div className="text-sm text-gray-500 flex items-center justify-center">
                  <Leaf className="w-4 h-4 mr-1" />
                  Carbon Sinks
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 animate-scale-in" style={{ animationDelay: '0.6s' }}>
                <div className="text-2xl font-bold text-blue-600">{formatCO2Tonnes(netEmissions)}</div>
                <div className="text-sm text-gray-500 flex items-center justify-center">
                  <Target className="w-4 h-4 mr-1" />
                  Net Emissions
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emissions by Activity - Pie Chart */}
        <Card className="eco-card animate-slide-left">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">📊</span>
              Emissions by Activity
            </CardTitle>
            <CardDescription>
              Breakdown of CO₂ emissions by source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" className="dashboard-pie-chart">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCO2Value(value as number), 'CO₂e']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <p>No emission data available</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieChartData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span>{entry.name}</span>
                  <span className="text-gray-500">{((entry.value / pieChartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emissions Over Time - Line Chart */}
        <Card className="eco-card animate-slide-right">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">📈</span>
              Emissions Over Time
            </CardTitle>
            <CardDescription>
              Monthly CO₂ emissions vs targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {emissionsOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" className="dashboard-line-chart">
                  <LineChart data={emissionsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip formatter={(value) => [formatCO2Value(value as number), 'CO₂e']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="emissions" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Actual Emissions"
                      animationDuration={2000}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="Target"
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <p>No time series data available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Progress */}
      {strategies.length > 0 && (
        <Card className="eco-card animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🚀</span>
              Strategy Progress
            </CardTitle>
            <CardDescription>
              Current progress on carbon reduction strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {strategies.slice(0, 3).map((strategy, idx) => {
                const percent = Math.min(100, Math.round((strategy.currentReduction / (strategy.targetReduction || 1)) * 100));
                const statusColors = {
                  planned: 'bg-gray-100 text-gray-700',
                  'in-progress': 'bg-yellow-100 text-yellow-800',
                  completed: 'bg-green-100 text-green-800',
                };
                
                return (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm animate-scale-in" style={{ animationDelay: `${idx * 0.2}s` }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-gray-900">{strategy.title}</div>
                        <div className="text-sm text-gray-600">{strategy.description}</div>
                      </div>
                    </div>
                    <div className="flex-1 md:mx-8 mt-4 md:mt-0">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out animate-progress"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{percent}% complete</div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 mt-4 md:mt-0 min-w-[120px]">
                      <Badge className={statusColors[strategy.status?.toLowerCase() as keyof typeof statusColors] || statusColors.planned}>
                        {strategy.status}
                      </Badge>
                      <span className="text-green-700 font-semibold text-sm">
                        {formatCO2Tonnes(strategy.currentReduction)} saved
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;