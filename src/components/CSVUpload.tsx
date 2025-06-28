import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { getAvailableActivityTypes, calculateCO2Emission, formatCO2Value } from "@/lib/calculations";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";

interface CSVRow {
  date: string;
  activityType: string;
  quantity: string;
  unit: string;
  location?: string;
  notes?: string;
}

interface ProcessedRow extends CSVRow {
  co2e: number;
  isValid: boolean;
  errors: string[];
}

const CSVUpload = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addEmission } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [csvData, setCsvData] = useState<ProcessedRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [validRows, setValidRows] = useState(0);
  const [invalidRows, setInvalidRows] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const activityTypes = getAvailableActivityTypes();

  // Synonym and normalization helpers
  const ACTIVITY_SYNONYMS: Record<string, string> = {
    'diesel fuel': 'diesel',
    'diesel': 'diesel',
    'petrol': 'petrol',
    'coal combustion': 'coal',
    'coal': 'coal',
    'lpg': 'lpg',
    'cng': 'cng',
    'electricity': 'electricity',
    'solar': 'solar',
    'wind': 'wind',
    'vehicle transport': 'transport_diesel',
    'transport': 'transport_diesel',
    'transport diesel': 'transport_diesel',
    'transport petrol': 'transport_petrol',
    'transport electric': 'transport_electric',
    'heavy equipment': 'excavator_diesel',
    'excavator': 'excavator_diesel',
    'bulldozer': 'bulldozer_diesel',
    'haul truck': 'haul_truck_diesel',
    'refrigerant r134a': 'r134a',
    'r134a': 'r134a',
    'refrigerant r404a': 'r404a',
    'r404a': 'r404a',
    'waste landfill': 'waste_landfill',
    'waste incineration': 'waste_incineration',
  };

  const UNIT_SYNONYMS: Record<string, string> = {
    'liters': 'litres',
    'liter': 'litres',
    'litres': 'litres',
    'litre': 'litres',
    'l': 'litres',
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'kgs': 'kg',
    'ton': 'tonnes',
    'tons': 'tonnes',
    'tonnes': 'tonnes',
    'tonne': 'tonnes',
    't': 'tonnes',
    'kwh': 'kWh',
    'kw-h': 'kWh',
    'kilowatt-hour': 'kWh',
    'kilowatt-hours': 'kWh',
    'hours': 'hour',
    'hour': 'hour',
    'hr': 'hour',
    'hrs': 'hour',
    'km': 'km',
    'kilometer': 'km',
    'kilometers': 'km',
    'kilometre': 'km',
    'kilometres': 'km',
    'miles': 'km',
    'mile': 'km',
    'mi': 'km',
  };

  function normalizeActivityType(input: string): string {
    const key = input.trim().toLowerCase();
    return ACTIVITY_SYNONYMS[key] || key;
  }

  function normalizeUnit(input: string): string {
    const key = input.trim().toLowerCase();
    return UNIT_SYNONYMS[key] || key;
  }

  function findActivityType(input: string) {
    const norm = normalizeActivityType(input);
    // Try direct match to value
    let found = activityTypes.find(a => a.value === norm);
    if (found) return found;
    // Try match to label (case-insensitive)
    found = activityTypes.find(a => a.label.toLowerCase() === input.trim().toLowerCase());
    if (found) return found;
    // Try match to synonyms
    found = activityTypes.find(a => normalizeActivityType(a.label) === norm);
    return found;
  }

  function findUnitMatch(input: string, expected: string) {
    if (!input) return expected;
    const norm = normalizeUnit(input);
    const expectedNorm = normalizeUnit(expected);
    if (norm === expectedNorm) return expected;
    // Accept close variants
    if (Object.values(UNIT_SYNONYMS).includes(norm) && norm === expectedNorm) return expected;
    return null;
  }

  const validateRow = (row: CSVRow, index: number): ProcessedRow => {
    const errors: string[] = [];
    let co2e = 0;

    // Validate date
    if (!row.date) {
      errors.push("Date is required");
    } else {
      const date = new Date(row.date);
      if (isNaN(date.getTime())) {
        errors.push("Invalid date format (use YYYY-MM-DD)");
      }
    }

    // Flexible activity type match
    const activity = findActivityType(row.activityType);
    if (!row.activityType) {
      errors.push("Activity type is required");
    } else if (!activity) {
      errors.push(`Invalid activity type: '${row.activityType}'. Supported: ${activityTypes.map(a => a.label).join(', ')}`);
    }

    // Validate quantity
    let quantity = 0;
    if (!row.quantity) {
      errors.push("Quantity is required");
    } else {
      quantity = parseFloat(row.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.push("Quantity must be a positive number");
      }
    }

    // Flexible unit match and auto-convert
    let unit = row.unit;
    if (activity) {
      const expectedUnit = activity.unit;
      let matchedUnit = findUnitMatch(row.unit, expectedUnit);
      
      // Handle unit conversions
      if (activity.value === 'coal') {
        // Coal: convert tons/tonnes to kg
        if (['ton', 'tons', 'tonnes', 'tonne'].includes(normalizeUnit(row.unit))) {
          quantity = quantity * 1000;
          unit = 'kg';
          matchedUnit = 'kg';
        }
      } else if (activity.value === 'electricity' || activity.value === 'solar' || activity.value === 'wind') {
        // Electricity: accept kWh, kwh, kw-h
        if (['kwh', 'kw-h', 'kilowatt-hour', 'kilowatt-hours'].includes(normalizeUnit(row.unit))) {
          unit = 'kWh';
          matchedUnit = 'kWh';
        }
      } else if (activity.value === 'transport_diesel' || activity.value === 'transport_petrol' || activity.value === 'transport_electric') {
        // Transport: accept km, kilometer, kilometers
        if (['km', 'kilometer', 'kilometers'].includes(normalizeUnit(row.unit))) {
          unit = 'km';
          matchedUnit = 'km';
        }
      } else if (activity.value === 'excavator_diesel' || activity.value === 'bulldozer_diesel' || activity.value === 'haul_truck_diesel') {
        // Equipment: accept hour, hours
        if (['hour', 'hours'].includes(normalizeUnit(row.unit))) {
          unit = 'hour';
          matchedUnit = 'hour';
        }
      }
      
      if (!row.unit || !matchedUnit) {
        // Auto-fill if missing or wrong
        unit = expectedUnit;
        if (row.unit && !matchedUnit) {
          errors.push(`Unit '${row.unit}' does not match expected unit '${expectedUnit}' for activity '${activity.label}'. Auto-corrected to '${expectedUnit}'.`);
        }
      } else {
        unit = expectedUnit;
      }
    }

    // Calculate CO2e if possible
    if (activity && quantity > 0 && errors.length === 0) {
      try {
        co2e = calculateCO2Emission(activity.value, quantity);
        // Ensure the result is a valid number
        if (isNaN(co2e) || co2e < 0) {
          errors.push("Invalid CO2 calculation result");
          co2e = 0;
        }
      } catch (error) {
        console.error('CO2 calculation error:', error);
        errors.push("Failed to calculate CO2 equivalent");
        co2e = 0;
      }
    }

    return {
      ...row,
      activityType: activity ? activity.label : row.activityType,
      unit,
      quantity: quantity.toString(),
      co2e,
      isValid: errors.length === 0,
      errors
    };
  };

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Check if first line is header
    const hasHeader = lines[0].toLowerCase().includes('date') || 
                     lines[0].toLowerCase().includes('activity') ||
                     lines[0].toLowerCase().includes('quantity');

    const dataLines = hasHeader ? lines.slice(1) : lines;
    
    return dataLines.map(line => {
      const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
      return {
        date: values[0] || '',
        activityType: values[1] || '',
        quantity: values[2] || '',
        unit: values[3] || '',
        location: values[4] || '',
        notes: values[5] || ''
      };
    });
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const text = await file.text();
      const rawData = parseCSV(text);
      
      if (rawData.length === 0) {
        toast({
          title: "Empty File",
          description: "The CSV file appears to be empty or invalid",
          variant: "destructive"
        });
        return;
      }

      // Process and validate each row
      const processedData = rawData.map((row, index) => validateRow(row, index));
      
      const valid = processedData.filter(row => row.isValid);
      const invalid = processedData.filter(row => !row.isValid);
      
      setCsvData(processedData);
      setTotalRows(processedData.length);
      setValidRows(valid.length);
      setInvalidRows(invalid.length);
      
      // Collect validation errors
      const errors = invalid.map(row => row.errors).flat();
      setValidationErrors([...new Set(errors)]);

      setUploadProgress(100);
      
      toast({
        title: "File Processed",
        description: `${valid.length} valid rows, ${invalid.length} invalid rows found`,
      });

      setIsOpen(true);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the CSV file. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleImport = async () => {
    const validRows = csvData.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      toast({
        title: "No Valid Data",
        description: "No valid rows to import",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      let imported = 0;
      const total = validRows.length;

      for (const row of validRows) {
        const activityType = activityTypes.find(a => 
          a.label.toLowerCase() === row.activityType.toLowerCase() ||
          a.value.toLowerCase() === row.activityType.toLowerCase()
        );

        await addEmission({
          date: row.date,
          activityType: activityType?.label || row.activityType,
          quantity: parseFloat(row.quantity),
          unit: row.unit,
          co2e: row.co2e,
          location: row.location || undefined,
          notes: row.notes || undefined,
          userId: user?.id || '',
          mineId: user?.mineId
        });

        imported++;
        setUploadProgress((imported / total) * 100);
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${imported} emission entries`,
      });

      // Reset form
      setCsvData([]);
      setValidationErrors([]);
      setTotalRows(0);
      setValidRows(0);
      setInvalidRows(0);
      setIsOpen(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import some entries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const template = [
      'Date,Activity Type,Quantity,Unit,Location,Notes',
      '2024-01-15,Diesel Fuel,5000,litres,Block A,Heavy equipment operation',
      '2024-01-14,Electricity,8500,kWh,Processing Plant,Daily operations',
      '2024-01-13,Vehicle Transport,2500,km,Transport Fleet,Coal transportation'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emission_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded",
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Bulk Upload</h3>
            <p className="text-sm text-gray-600">Upload multiple emission entries via CSV file</p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-green-500' : 'text-gray-400'}`} />
                <div className="mt-4">
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-900">
                      {isDragOver ? 'Drop your CSV file here' : 'Choose CSV file or drag and drop'}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      CSV files up to 5MB
                    </p>
                  </Label>
                  <Input
                    id="csv-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing file...</span>
                    <span>{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {validationErrors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Validation Errors Found:</p>
                      <ul className="text-sm space-y-1">
                        {validationErrors.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {validationErrors.length > 5 && (
                          <li>• ... and {validationErrors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review CSV Data</DialogTitle>
            <DialogDescription>
              Review the data before importing. {validRows} valid rows and {invalidRows} invalid rows found.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{validRows}</div>
                <div className="text-sm text-green-600">Valid Rows</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{invalidRows}</div>
                <div className="text-sm text-red-600">Invalid Rows</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalRows}</div>
                <div className="text-sm text-blue-600">Total Rows</div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>CO₂e</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {row.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.activityType}</TableCell>
                      <TableCell>{row.quantity} {row.unit}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {row.isValid ? formatCO2Value(row.co2e) : '-'}
                      </TableCell>
                      <TableCell>{row.location || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {csvData.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                        ... and {csvData.length - 10} more rows
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Error Details */}
            {invalidRows > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Invalid Rows:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {csvData.filter(row => !row.isValid).slice(0, 5).map((row, index) => (
                    <div key={index} className="text-sm text-red-600">
                      Row {index + 1}: {row.errors.join(', ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={isProcessing || validRows === 0}
              className="sustainability-gradient text-white"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Import {validRows} Rows
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CSVUpload;
