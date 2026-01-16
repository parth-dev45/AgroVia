import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { getAllBatches } from '@/lib/mockData';
import { determineGradeFromVisualAndFirmness, calculateExpiryDate, calculateRemainingDays, determineFreshnessStatus, isSaleAllowed } from '@/lib/freshness';
import { Firmness, QualityGrade, BatchWithDetails, getProductById, getProductPrice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCheck, Star, CheckCircle2, AlertCircle, TrendingUp, Thermometer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function QualityGrading() {
  const { toast } = useToast();
  const allBatches = getAllBatches();
  const untestedBatches = allBatches.filter(b => b.qualityGrade === null);
  const testedBatches = allBatches.filter(b => b.qualityGrade !== null);

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [visualQuality, setVisualQuality] = useState([3]);
  const [firmness, setFirmness] = useState<Firmness>('Medium');
  const [gradedBatch, setGradedBatch] = useState<{ batch: BatchWithDetails; grade: QualityGrade } | null>(null);

  const selectedBatch = untestedBatches.find(b => b.batchId === selectedBatchId);
  const calculatedGrade = determineGradeFromVisualAndFirmness(visualQuality[0], firmness);

  const handleGrade = () => {
    if (!selectedBatch) return;

    // Update batch in localStorage
    const batches = getAllBatches();
    const batchIndex = batches.findIndex(b => b.batchId === selectedBatchId);

    if (batchIndex === -1) return;

    const grade = calculatedGrade;
    const storageType = batches[batchIndex].storage?.storageType || 'Normal';
    const harvestDate = new Date(batches[batchIndex].harvestDate);
    const productId = batches[batchIndex].cropType;
    const expiryDate = calculateExpiryDate(harvestDate, grade, storageType, productId);
    const remainingDays = calculateRemainingDays(expiryDate);
    const status = determineFreshnessStatus(remainingDays);

    const updateBatch = {
      ...batches[batchIndex],
      qualityGrade: grade,
      qualityTest: {
        testId: `TEST-${selectedBatchId}`,
        batchId: selectedBatchId,
        visualQuality: visualQuality[0],
        freshnessDays: remainingDays,
        firmness,
        finalGrade: grade,
        testDate: new Date(),
      },
      storage: {
        ...batches[batchIndex].storage!,
        expiryDate,
        expectedShelfLife: expiryDate.getTime() - harvestDate.getTime(),
      },
      retailStatus: {
        batchId: selectedBatchId,
        sellByDate: expiryDate,
        remainingDays,
        status,
        saleAllowed: isSaleAllowed(status),
      },
    };

    batches[batchIndex] = updateBatch;

    localStorage.setItem('freshtrack_batches', JSON.stringify(batches));

    const pricePerUnit = getProductPrice(productId, grade);
    setGradedBatch({ batch: updateBatch, grade });

    toast({
      title: 'Quality Test Complete',
      description: `Batch graded as ${grade} with Rs.${pricePerUnit}/${getProductById(productId)?.unit || 'kg'} pricing.`,
    });
  };

  const resetForm = () => {
    setSelectedBatchId('');
    setVisualQuality([3]);
    setFirmness('Medium');
    setGradedBatch(null);
  };

  const gradeColors = {
    A: 'bg-fresh text-fresh-foreground shadow-fresh/25',
    B: 'bg-warning text-warning-foreground shadow-warning/25',
    C: 'bg-expired text-expired-foreground shadow-expired/25',
  };

  const gradeDescription = {
    A: 'Premium Export Quality',
    B: 'Standard Market Quality',
    C: 'Processing / Low Quality',
  };

  if (gradedBatch) {
    const product = getProductById(gradedBatch.batch.cropType);
    const productName = product?.name || gradedBatch.batch.cropType;
    const productUnit = product?.unit || 'kg';
    const pricePerUnit = getProductPrice(gradedBatch.batch.cropType, gradedBatch.grade);
    const priceGradeC = getProductPrice(gradedBatch.batch.cropType, 'C');

    return (
      <Layout>
        <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
          <Card className="glass-card border-2 border-fresh/50 shadow-2xl">
            <CardHeader className="text-center pb-8 border-b border-border/50">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-fresh to-fresh/80 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-fresh/20 animate-in spin-in-12 duration-1000">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fresh to-primary">Quality Test Complete!</CardTitle>
              <CardDescription className="text-lg">
                {productName} has been graded and priced accordingly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Final Grade Assigned</p>
                <div className={`text-7xl font-black px-12 py-8 rounded-3xl inline-block shadow-2xl ${gradeColors[gradedBatch.grade]} transition-all hover:scale-105`}>
                  {gradedBatch.grade}
                </div>
                <p className="text-xl font-medium text-muted-foreground">{gradeDescription[gradedBatch.grade]}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm max-w-lg mx-auto">
                <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 text-center hover:bg-secondary/50 transition-colors">
                  <p className="text-muted-foreground mb-1">Market Price</p>
                  <p className="text-2xl font-bold text-primary">Rs.{pricePerUnit}<span className="text-sm font-normal text-muted-foreground">/{productUnit}</span></p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 text-center hover:bg-secondary/50 transition-colors">
                  <p className="text-muted-foreground mb-1">Predicted Shelf Life</p>
                  <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    {gradedBatch.batch.retailStatus?.remainingDays} <span className="text-sm font-normal text-muted-foreground">days</span>
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Farmer Payout Impact
                </h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Excellent work! Highest quality grading means better prices for farmers.
                  Grade {gradedBatch.grade} earns <span className="font-bold">Rs.{pricePerUnit}</span>
                  (vs Rs.{priceGradeC} for Grade C).
                </p>
              </div>

              <Button onClick={resetForm} className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                Grade Another Batch
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 ring-1 ring-primary/20">
            <ClipboardCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Quality Grading</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            AI-assisted quality parameter evaluation for accurate pricing
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Grading Form */}
          <Card className="glass-card shadow-xl h-fit">
            <CardHeader>
              <CardTitle className="text-xl">Quality Assessment</CardTitle>
              <CardDescription>
                Evaluate visual and physical parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {untestedBatches.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border-dashed border-2 border-border/50 bg-secondary/20">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">No batches pending test.</p>
                  <Button variant="link" asChild className="mt-2 text-primary">
                    <a href="/farmer">Register new batches</a>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label className="text-base">Select Batch to Test</Label>
                    <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                      <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-black/20">
                        <SelectValue placeholder="Choose a pending batch..." />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        {untestedBatches.map((batch) => {
                          const product = getProductById(batch.cropType);
                          return (
                            <SelectItem key={batch.batchId} value={batch.batchId} className="py-3">
                              <span className="font-medium">{product?.name || batch.cropType}</span>
                              <span className="text-muted-foreground mx-2 text-xs font-mono">{batch.batchId}</span>
                              <span className="text-xs bg-secondary px-2 py-0.5 rounded-md">{batch.quantity}{product?.unit || 'kg'}</span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBatch && (
                    <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-8">
                      {(() => {
                        const product = getProductById(selectedBatch.cropType);
                        return (
                          <div className="grid grid-cols-2 gap-3 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Product</p>
                              <p className="font-semibold">{product?.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Storage</p>
                              <p className="font-semibold">{selectedBatch.storage?.storageType}</p>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-base">Visual Appearance (1-5)</Label>
                            <span className="text-2xl font-bold text-primary">{visualQuality[0]}</span>
                          </div>

                          <div className="bg-secondary/30 p-2 rounded-xl">
                            <Slider
                              value={visualQuality}
                              onValueChange={setVisualQuality}
                              min={1}
                              max={5}
                              step={1}
                              className="py-4 cursor-pointer"
                            />
                          </div>

                          <div className="flex justify-between px-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setVisualQuality([star])}
                                className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${star === visualQuality[0] ? 'scale-110' : 'opacity-50'}`}
                              >
                                <Star
                                  className={`h-8 w-8 transition-colors ${star <= visualQuality[0] ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                                />
                                <span className="text-[10px] font-medium uppercase text-muted-foreground">
                                  {star === 1 ? 'Poor' : star === 5 ? 'Perfect' : ''}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base">Firmness Level</Label>
                          <div className="grid grid-cols-3 gap-3">
                            {(['Low', 'Medium', 'High'] as Firmness[]).map((level) => (
                              <button
                                key={level}
                                onClick={() => setFirmness(level)}
                                className={cn(
                                  "py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                                  firmness === level
                                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                                    : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary"
                                )}
                              >
                                <Thermometer className={cn("h-5 w-5", firmness === level ? "text-primary" : "text-muted-foreground")} />
                                <span className="font-semibold">{level}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Predicted Grade Preview */}
                      <div className="p-5 bg-gradient-to-r from-secondary to-secondary/30 rounded-2xl border border-white/20 shadow-inner">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Predicted Result</p>
                            <p className="text-xs text-muted-foreground max-w-[150px]">Based on current parameters</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`text-2xl py-2 px-6 rounded-xl overflow-hidden shadow-lg transition-colors duration-500 ${gradeColors[calculatedGrade]}`}>
                              {calculatedGrade}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleGrade}
                        className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90 hover:scale-[1.02] transition-transform"
                      >
                        Confirm Quality Grade
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Tests Sidebar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold px-2">Recently Graded</h3>
            <div className="space-y-4">
              {testedBatches.slice(0, 5).map((batch) => {
                const product = getProductById(batch.cropType);
                const pricePerUnit = batch.qualityGrade ? getProductPrice(batch.cropType, batch.qualityGrade) : 0;
                return (
                  <div
                    key={batch.batchId}
                    className="group glass-card p-4 rounded-2xl border border-white/10 hover:border-primary/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${gradeColors[batch.qualityGrade!]}`}>
                        {batch.qualityGrade}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{product?.name || batch.cropType}</p>
                        <p className="text-xs text-muted-foreground font-mono">{batch.batchId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">Rs.{pricePerUnit}</p>
                      <p className="text-xs text-muted-foreground">per {product?.unit}</p>
                    </div>
                  </div>
                );
              })}
              {testedBatches.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                  No batches have been graded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
