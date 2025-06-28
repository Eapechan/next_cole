import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { getAvailableActivityTypes, calculateCO2Emission, formatCO2Value } from "@/lib/calculations";
import { Loader2, Plus, Upload, Download, Factory, Zap, Truck, Leaf } from "lucide-react";
import CSVUpload from "@/components/CSVUpload";

const EmissionInput = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { emissions, addEmission, deleteEmission } = useData();
  
  const [formData, setFormData] = useState({
    activityType: "",
    quantity: "",
    unit: "",
    date: "",
    location: "",
    notes: ""
  });
  
  const [calculatedCO2, setCalculatedCO2] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const activityTypes = getAvailableActivityTypes();

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const calculateCO2 = () => {
    if (formData.activityType && formData.quantity) {
      try {
        const co2 = calculateCO2Emission(formData.activityType, parseFloat(formData.quantity));
        setCalculatedCO2(co2);
      } catch (error) {
        setCalculatedCO2(0);
        console.error('Calculation error:', error);
      }
    }
  };

  useEffect(() => {
    calculateCO2();
  }, [formData.activityType, formData.quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.activityType || !formData.quantity || !formData.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const activityType = activityTypes.find(a => a.value === formData.activityType);
      
      addEmission({
        date: formData.date,
        activityType: activityType?.label || formData.activityType,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        co2e: calculatedCO2,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        userId: user?.id || '',
        mineId: user?.mineId
      });

      // Reset form
      setFormData({
        activityType: "",
        quantity: "",
        unit: "",
        date: new Date().toISOString().split('T')[0],
        location: "",
        notes: ""
      });
      setCalculatedCO2(0);

      toast({
        title: "✅ Emission Data Saved",
        description: `Successfully logged ${formatCO2Value(calculatedCO2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save emission data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteEmission(id);
    toast({
      title: "🗑️ Emission Deleted",
      description: "Emission entry has been removed",
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Activity Type', 'Quantity', 'Unit', 'CO2e (kg)', 'Location', 'Notes'],
      ...emissions.map(emission => [
        emission.date,
        emission.activityType,
        emission.quantity.toString(),
        emission.unit,
        emission.co2e.toString(),
        emission.location || '',
        emission.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "📊 Export Successful",
      description: "Emission data exported to CSV",
    });
  };

  const getActivityIcon = (activityType: string) => {
    if (activityType.toLowerCase().includes('diesel') || activityType.toLowerCase().includes('fuel')) {
      return <Factory className="w-4 h-4" />;
    }
    if (activityType.toLowerCase().includes('electricity')) {
      return <Zap className="w-4 h-4" />;
    }
    if (activityType.toLowerCase().includes('transport') || activityType.toLowerCase().includes('vehicle')) {
      return <Truck className="w-4 h-4" />;
    }
    return <Leaf className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="heading-lg text-gray-900 flex items-center">
          <span className="mr-3">📊</span>
          Emission Data Input
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Log your coal mine's carbon emissions with real-time calculations</p>
      </div>

      <Tabs defaultValue="manual" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 bg-green-50 p-1 rounded-xl">
          <TabsTrigger value="manual" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <span className="mr-2">✏️</span>
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="bulk" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <span className="mr-2">📁</span>
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-2">
              <Card className="eco-card animate-slide-left">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <span className="mr-2">📝</span>
                    Add New Emission Entry
                  </CardTitle>
                  <CardDescription>
                    Enter emission data for automatic CO₂e calculation using IPCC standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="activityType" className="text-sm font-medium">
                          Activity Type *
                        </Label>
                        <Select 
                          value={formData.activityType} 
                          onValueChange={(value) => {
                            setFormData({ ...formData, activityType: value });
                            const activity = activityTypes.find(a => a.value === value);
                            if (activity) {
                              setFormData(prev => ({ ...prev, unit: activity.unit }));
                            }
                          }}
                        >
                          <SelectTrigger className="focus-ring">
                            <SelectValue placeholder="Select emission source" />
                          </SelectTrigger>
                          <SelectContent>
                            {activityTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center space-x-2">
                                  {getActivityIcon(type.label)}
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="focus-ring"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-sm font-medium">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          step="0.01"
                          placeholder="Enter quantity"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          className="focus-ring"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unit" className="text-sm font-medium">Unit</Label>
                        <Input
                          id="unit"
                          value={formData.unit}
                          readOnly
                          className="bg-gray-50 focus-ring"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">Location/Mine Section</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Block A, Pit 2, Processing Plant"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="focus-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional context or details..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="focus-ring"
                      />
                    </div>

                    {/* Calculated CO2 Display */}
                    {calculatedCO2 > 0 && (
                      <div className="p-6 eco-gradient border border-green-200 rounded-xl animate-scale-in">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-green-800 flex items-center">
                              <span className="mr-2">🧮</span>
                              Calculated CO₂ Equivalent
                            </h3>
                            <p className="text-sm text-green-600 mt-1">Based on IPCC emission factors</p>
                          </div>
                          <Badge className="text-lg px-4 py-2 sustainability-gradient text-white">
                            {formatCO2Value(calculatedCO2)}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="sustainability-gradient text-white ripple focus-ring w-full md:w-auto"
                      disabled={isSubmitting || calculatedCO2 === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Save Emission Data
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Recent Entries */}
            <div className="lg:col-span-1">
              <Card className="eco-card animate-slide-right">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <span className="mr-2">📋</span>
                      Recent Entries
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleExport} className="ripple">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Latest emission data entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emissions.slice(0, 5).map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border border-green-100 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center">
                            {getActivityIcon(entry.activityType)}
                            <span className="ml-2">{entry.activityType}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {entry.date} • {entry.quantity} {entry.unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm text-green-600">
                            {formatCO2Value(entry.co2e)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                    {emissions.length === 0 && (
                      <div className="text-center text-gray-500 py-12">
                        <div className="text-4xl mb-4">📊</div>
                        <p>No emission entries yet</p>
                        <p className="text-sm mt-2">Start by adding your first entry</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-8">
          <div className="animate-slide-up">
            <CSVUpload />
          </div>
        </TabsContent>
      </Tabs>

      {/* All Entries Table */}
      <Card className="eco-card animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">📊</span>
            All Emission Entries
          </CardTitle>
          <CardDescription>
            Complete history of emission data with real-time calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>CO₂e</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emissions.map((entry, index) => (
                  <TableRow key={entry.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getActivityIcon(entry.activityType)}
                        <span className="ml-2">{entry.activityType}</span>
                      </div>
                    </TableCell>
                    <TableCell>{entry.quantity} {entry.unit}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCO2Value(entry.co2e)}
                    </TableCell>
                    <TableCell>{entry.location || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ripple"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {emissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-12">
                      <div className="text-4xl mb-4">📊</div>
                      <p>No emission entries found</p>
                      <p className="text-sm mt-2">Start by adding your first emission entry above</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmissionInput;