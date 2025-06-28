import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { useState } from "react";

const Reports = () => {
  const { emissions, carbonSinks, getTotalEmissions, getTotalCarbonSinks } = useData();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [reportText, setReportText] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");

  // Calculate summary values
  const totalEmissions = getTotalEmissions();
  const totalOffsets = getTotalCarbonSinks();
  const netEmissions = totalEmissions - totalOffsets;

  // Reporting period (earliest to latest emission date)
  const emissionEntries = emissions || [];
  let reportingPeriod = "-";
  if (emissionEntries.length > 0) {
    const sorted = [...emissionEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const start = new Date(sorted[0].date).toLocaleDateString();
    const end = new Date(sorted[sorted.length - 1].date).toLocaleDateString();
    reportingPeriod = start === end ? start : `${start} to ${end}`;
  }

  // Calculate averages and max values
  const avgEmissions = emissionEntries.length > 0 ? emissionEntries.reduce((sum, e) => sum + e.co2e, 0) / emissionEntries.length : 0;
  const avgOffsets = carbonSinks.length > 0 ? carbonSinks.reduce((sum, s) => sum + s.co2e, 0) / carbonSinks.length : 0;
  const maxEmission = emissionEntries.length > 0 ? Math.max(...emissionEntries.map(e => e.co2e)) : 0;
  const maxOffset = carbonSinks.length > 0 ? Math.max(...carbonSinks.map(s => s.co2e)) : 0;

  // Helper for formatting numbers
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  // Stub for sending to Llama 3 (replace with your actual function)
  const sendToLlama3 = async (text: string) => {
    setAiLoading(true);
    setAiResponse("");
    try {
      // Replace this with your actual Llama 3 API call
      // Example: const response = await llama3ApiCall(text);
      await new Promise(res => setTimeout(res, 2000)); // Simulate delay
      setAiResponse("[AI Response: Reframed/Analyzed Report]\n" + text.slice(0, 300) + (text.length > 300 ? "..." : ""));
    } catch (err) {
      setAiResponse("Error contacting AI model.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setIsGenerating(true);
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
    doc.text("Carbon Emission & Offset Business Report", pageWidth - 60, 60, { align: "right" });
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
    doc.text(`Total Emissions: ${fmt(totalEmissions)} tCO₂e`, 60, y); y += 16;
    doc.text(`Total Offsets: ${fmt(totalOffsets)} tCO₂e`, 60, y); y += 16;
    doc.text(`Net Emissions: ${fmt(netEmissions)} tCO₂e`, 60, y); y += 16;
    doc.text(`Reporting Period: ${reportingPeriod}`, 60, y); y += 16;
    doc.text(`Entries: ${emissionEntries.length}`, 60, y); y += 16;
    doc.text(`Max Emission: ${fmt(maxEmission)} tCO₂e`, 60, y); y += 16;
    doc.text(`Max Offset: ${fmt(maxOffset)} tCO₂e`, 60, y); y += 24;

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
      `Your operations recorded ${fmt(totalEmissions)} tCO₂e emissions and ${fmt(totalOffsets)} tCO₂e offsets, resulting in net emissions of ${fmt(netEmissions)} tCO₂e.\nReporting period: ${reportingPeriod}.\nMax emission: ${fmt(maxEmission)} tCO₂e. Max offset: ${fmt(maxOffset)} tCO₂e.`;
    doc.text(summary, 60, y, { maxWidth: pageWidth - 120, lineHeightFactor: 1.5 });
    y += 60;

    // Signature (bottom right)
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("_________________________", pageWidth - 200, pageHeight - 90, { align: "left" });
    doc.text("Authorized Signatory", pageWidth - 200, pageHeight - 70, { align: "left" });
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
      "Report generated by NextCoal Initiative | Powered by Indian and IPCC standards | Confidential",
      pageWidth / 2,
      pageHeight - 30,
      { align: "center" }
    );

    // Download PDF
    const url = doc.output('bloburl');
    const a = document.createElement('a');
    a.href = url;
    a.download = "carbon_emission_report.pdf";
    a.click();
    URL.revokeObjectURL(url);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Carbon Emission Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-lg font-semibold">Summary</p>
            <ul className="list-disc ml-6 mt-2 text-gray-700">
              <li>Total Emissions: <span className="font-bold">{fmt(totalEmissions)} t CO₂e</span></li>
              <li>Total Offsets (Sinks): <span className="font-bold">{fmt(totalOffsets)} t CO₂e</span></li>
              <li>Net Emissions: <span className="font-bold">{fmt(netEmissions)} t CO₂e</span></li>
            </ul>
          </div>
          <Button
            onClick={() => sendToLlama3(reportText)}
            disabled={!reportText || aiLoading}
            className="w-full mt-2 flex items-center justify-center gap-2"
            variant="outline"
          >
            {aiLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Reframing with AI...
              </>
            ) : (
              "Reframe with AI"
            )}
          </Button>
          {aiResponse && (
            <div className="mt-4 p-4 bg-gray-50 rounded border text-sm whitespace-pre-line">
              {aiResponse}
            </div>
          )}
          <Button className="sustainability-gradient text-white" onClick={handleExportPDF}>
            📄 Export PDF Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
