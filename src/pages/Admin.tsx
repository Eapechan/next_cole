import { GoogleMapsTest } from "@/components/GoogleMapsTest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManager from "@/components/UserManager";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { Search } from "lucide-react";
import React, { useState } from "react";

// Define a Mine type at the top:
type Mine = {
  id: number;
  name: string;
  location: string;
  operator: string;
  status: string;
  lastReport: string;
  emissions: string;
  complianceScore: number;
  risk: string;
};

const Admin = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [reportText, setReportText] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null);
  const [mineModalOpen, setMineModalOpen] = useState(false);

  // Mock data for mines and users
  let mines = [
    {
      id: 1,
      name: "Singareni Collieries Company Ltd",
      location: "Telangana",
      operator: "Rajesh Kumar",
      status: "Active",
      lastReport: "2024-01-25",
      emissions: "45,234 tonnes",
      complianceScore: 94,
      risk: "Low"
    },
    {
      id: 2,
      name: "Coal India Limited - Jharia",
      location: "Jharkhand",
      operator: "Priya Sharma",
      status: "Active",
      lastReport: "2024-01-20",
      emissions: "67,890 tonnes",
      complianceScore: 78,
      risk: "Medium"
    },
    {
      id: 3,
      name: "Neyveli Lignite Corporation",
      location: "Tamil Nadu",
      operator: "Arjun Patel",
      status: "Non-Reporting",
      lastReport: "2023-12-15",
      emissions: "32,156 tonnes",
      complianceScore: 45,
      risk: "High"
    },
    {
      id: 4,
      name: "Mahanadi Coalfields Limited",
      location: "Odisha",
      operator: "Sunita Singh",
      status: "Active",
      lastReport: "2024-01-28",
      emissions: "89,234 tonnes",
      complianceScore: 88,
      risk: "Low"
    }
  ];
  // Fallback: if mines is empty, add a default mine
  if (!mines || mines.length === 0) {
    mines = [{
      id: 100,
      name: "Demo Mine",
      location: "Demo State",
      operator: "Demo Operator",
      status: "Active",
      lastReport: "2024-01-01",
      emissions: "10,000 tonnes",
      complianceScore: 80,
      risk: "Low"
    }];
  }

  const users = [
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh.kumar@scl.gov.in",
      role: "Mine Operator",
      organization: "Singareni Collieries",
      lastLogin: "2024-01-30",
      status: "Active"
    },
    {
      id: 2,
      name: "Dr. Meera Gupta",
      email: "meera.gupta@moef.gov.in",
      role: "Regulator",
      organization: "MoEF&CC",
      lastLogin: "2024-01-29",
      status: "Active"
    },
    {
      id: 3,
      name: "Priya Sharma",
      email: "priya.sharma@cil.gov.in",
      role: "Mine Operator",
      organization: "Coal India Ltd",
      lastLogin: "2024-01-28",
      status: "Active"
    }
  ];

  const regionData = [
    { region: "Jharkhand", mines: 45, emissions: "2.3M tonnes", compliance: 82 },
    { region: "Odisha", mines: 38, emissions: "1.9M tonnes", compliance: 85 },
    { region: "Chhattisgarh", mines: 32, emissions: "1.7M tonnes", compliance: 79 },
    { region: "Telangana", mines: 28, emissions: "1.2M tonnes", compliance: 88 },
    { region: "Tamil Nadu", mines: 15, emissions: "0.8M tonnes", compliance: 76 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Non-Reporting": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSendReminder = (mineId: number) => {
    toast({
      title: "Reminder Sent",
      description: "Compliance reminder has been sent to the mine operator.",
    });
  };

  const handleSuspendUser = (userId: number) => {
    toast({
      title: "User Suspended",
      description: "User access has been temporarily suspended.",
    });
  };

  // Helper for formatting numbers
  const fmt = (n: number) => typeof n === 'number' ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : n;

  // Search and auto-popup logic
  const filteredMines = searchTerm.trim()
    ? mines.filter(m => m.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : mines;

  // Auto-open modal if search matches exactly one mine
  React.useEffect(() => {
    if (searchTerm.trim() && filteredMines.length === 1) {
      setSelectedMine(filteredMines[0]);
      setMineModalOpen(true);
    }
  }, [searchTerm, filteredMines]);

  const handleExportAdminPDF = async () => {
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
    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34);
    doc.setFont("helvetica", "bold");
    doc.text("Admin Compliance & Performance Report", pageWidth - 60, 70, { align: "right" });
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text("NextCoal Initiative", pageWidth - 60, 92, { align: "right" });

    // Horizontal line
    doc.setDrawColor(200, 220, 200);
    doc.setLineWidth(1);
    doc.line(40, 110, pageWidth - 40, 110);
    y = 130;

    // Two-column layout
    // Left column: stats
    let leftY = y;
    doc.setFontSize(13);
    doc.setTextColor(34, 139, 34);
    doc.setFont("helvetica", "bold");
    doc.text("Key Stats", 60, leftY);
    leftY += 24;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.text("Total Mines: 158", 60, leftY);
    leftY += 18;
    doc.text("Active Users: 1,247", 60, leftY);
    leftY += 18;
    doc.text("Compliance Rate: 87%", 60, leftY);
    leftY += 18;
    doc.text("High Risk Mines: 12", 60, leftY);
    leftY += 18;
    doc.text("Top Regions: Jharkhand, Odisha, Chhattisgarh, Telangana, Tamil Nadu", 60, leftY, { maxWidth: 180 });
    leftY += 36;
    doc.setFont("helvetica", "bold");
    doc.text("Compliance Metrics", 60, leftY);
    leftY += 22;
    doc.setFont("helvetica", "normal");
    doc.text("Timely Reporting: 87%", 60, leftY);
    leftY += 16;
    doc.text("Data Quality: 92%", 60, leftY);
    leftY += 16;
    doc.text("Regulatory Adherence: 94%", 60, leftY);
    leftY += 16;
    doc.text("Non-Reporting Mines: 1", 60, leftY);

    // Right column: summary
    let rightY = y;
    const rightX = pageWidth / 2 + 10;
    doc.setFontSize(13);
    doc.setTextColor(34, 139, 34);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", rightX, rightY);
    rightY += 24;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    const summary =
      `This report provides a modern overview of mine operations, user activity, compliance rates, and regional performance for the Indian coal mining sector.\n\n` +
      `Platform stats: 158 registered mines, 1,247 active users, 87% compliance, 12 high risk mines.\n\n` +
      `Key operators: Singareni Collieries (Telangana), Coal India - Jharia (Jharkhand), Neyveli Lignite (Tamil Nadu), Mahanadi Coalfields (Odisha).\n\n` +
      `User base includes mine operators and regulators. All users are monitored for compliance, with tools for account management and suspension.\n\n` +
      `System-wide metrics: Timely reporting (87%), data quality (92%), regulatory adherence (94%). Non-compliant mines flagged for action.\n\n` +
      `Top regions: Jharkhand, Odisha, Chhattisgarh, Telangana, Tamil Nadu. Compliance by region: 76%–88%.\n\n` +
      `For details, refer to the Admin Panel or contact the compliance team.`;
    doc.text(summary, rightX, rightY, { maxWidth: pageWidth / 2 - 70, lineHeightFactor: 1.5 });

    // Signature (bottom right)
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("_________________________", pageWidth - 200, pageHeight - 90, { align: "left" });
    doc.text("Authorized Admin", pageWidth - 200, pageHeight - 70, { align: "left" });
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
      "Report generated by NextCoal Initiative Admin Panel | Confidential",
      pageWidth / 2,
      pageHeight - 30,
      { align: "center" }
    );

    // Download PDF
    const url = doc.output('bloburl');
    const a = document.createElement('a');
    a.href = url;
    a.download = "admin_report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMineModalChange = (open) => {
    setMineModalOpen(open);
    if (!open) {
      setSelectedMine(null);
      setSearchTerm(""); // Clear search when modal closes
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage mines, users, and compliance tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Input
              placeholder="Search mines, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <Button className="sustainability-gradient text-white" onClick={handleExportAdminPDF}>
            📄 Export PDF Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Mines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">158</div>
            <p className="text-xs text-gray-500">+3 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-gray-500">+18 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-gray-500">+2% vs last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Risk Mines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">12</div>
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mines" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mines">Mine Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracking</TabsTrigger>
          <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
          <TabsTrigger value="maps">Google Maps Test</TabsTrigger>
        </TabsList>

        <TabsContent value="mines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mine Directory</CardTitle>
              <CardDescription>
                Overview of all registered coal mines and their compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mine Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Report</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMines.map((mine) => (
                      <TableRow key={mine.id}>
                        <TableCell className="font-medium">{mine.name}</TableCell>
                        <TableCell>{mine.location}</TableCell>
                        <TableCell>{mine.operator}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(mine.status)}>
                            {mine.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{mine.lastReport}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={mine.complianceScore} className="w-16 h-2" />
                            <span className="text-sm">{mine.complianceScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskColor(mine.risk)}>
                            {mine.risk}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMine(mine);
                                setMineModalOpen(true);
                              }}
                            >
                              View
                            </Button>
                            {mine.status === "Non-Reporting" && (
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleSendReminder(mine.id)}
                              >
                                Remind
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManager />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>
                  System-wide compliance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Timely Reporting</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Data Quality</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Regulatory Adherence</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Non-Compliant Mines</CardTitle>
                <CardDescription>
                  Mines requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium">Neyveli Lignite Corp</div>
                      <div className="text-sm text-gray-600">45 days overdue</div>
                    </div>
                    <Button size="sm" variant="outline">
                      Contact
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-medium">Eastern Coalfields Ltd</div>
                      <div className="text-sm text-gray-600">Incomplete data</div>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Emission Heatmap</CardTitle>
              <CardDescription>
                State-wise coal mine emissions and compliance overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionData.map((region) => (
                  <div key={region.region} className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">{region.region}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mines</span>
                        <span className="font-medium">{region.mines}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Emissions</span>
                        <span className="font-medium">{region.emissions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Compliance</span>
                        <span className="font-medium">{region.compliance}%</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={region.compliance} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maps" className="space-y-6">
          <GoogleMapsTest />
        </TabsContent>
      </Tabs>

      {/* Mine Details Modal */}
      <Dialog open={mineModalOpen} onOpenChange={handleMineModalChange}>
        <DialogContent className="max-w-md w-full animate-fade-in-up bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-2xl border border-green-100">
          {selectedMine && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-green-800">{selectedMine.name}</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Detailed information about this mine and its compliance status.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-4 text-base font-medium text-gray-800">
                <div><span className="font-semibold text-green-700">Location:</span> {selectedMine.location}</div>
                <div><span className="font-semibold text-green-700">Operator:</span> {selectedMine.operator}</div>
                <div><span className="font-semibold text-green-700">Status:</span> <Badge className={getStatusColor(selectedMine.status)}>{selectedMine.status}</Badge></div>
                <div><span className="font-semibold text-green-700">Last Report:</span> {selectedMine.lastReport}</div>
                <div><span className="font-semibold text-green-700">Compliance:</span> <span className="text-blue-700 font-semibold">{selectedMine.complianceScore}%</span></div>
                <div><span className="font-semibold text-green-700">Risk Level:</span> <Badge className={getRiskColor(selectedMine.risk)}>{selectedMine.risk}</Badge></div>
                <div><span className="font-semibold text-green-700">Emissions:</span> {selectedMine.emissions}</div>
              </div>
              <DialogFooter className="mt-6">
                <Button onClick={() => { setMineModalOpen(false); setSelectedMine(null); }} className="w-full sustainability-gradient text-white font-semibold">Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
