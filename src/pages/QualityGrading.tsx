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
import { ClipboardCheck, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

    batches[batchIndex] = {
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

    localStorage.setItem('freshtrack_batches', JSON.stringify(batches));
    
    const pricePerUnit = getProductPrice(productId, grade);
    setGradedBatch({ batch: batches[batchIndex], grade });
    
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
    A: 'bg-fresh text-fresh-foreground',
    B: 'bg-warning text-warning-foreground',
    C: 'bg-muted text-muted-foreground',
  };

  if (gradedBatch) {
    const product = getProductById(gradedBatch.batch.cropType);
    const productName = product?.name || gradedBatch.batch.cropType;
    const productUnit = product?.unit || 'kg';
    const pricePerUnit = getProductPrice(gradedBatch.batch.cropType, gradedBatch.grade);
    const priceGradeC = getProductPrice(gradedBatch.batch.cropType, 'C');

    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-fresh">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-fresh/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-fresh" />
              </div>
              <CardTitle className="text-2xl">Quality Test Complete!</CardTitle>
              <CardDescription>
                {productName} has been graded and priced accordingly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Batch ID</p>
                <p className="text-xl font-mono font-bold">{gradedBatch.batch.batchId}</p>
              </div>

              <div className="flex justify-center">
                <div className={`text-6xl font-bold px-8 py-4 rounded-xl ${gradeColors[gradedBatch.grade]}`}>
                  Grade {gradedBatch.grade}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <p className="text-muted-foreground">Price/{productUnit}</p>
                  <p className="text-2xl font-bold text-primary">Rs.{pricePerUnit}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <p className="text-muted-foreground">Shelf Life</p>
                  <p className="text-2xl font-bold text-primary">
                    {gradedBatch.batch.retailStatus?.remainingDays} days
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2">Farmer Payout Impact</h4>
                <p className="text-sm text-muted-foreground">
                  Higher quality grades mean better prices for farmers. 
                  Grade {gradedBatch.grade} earns Rs.{pricePerUnit}/{productUnit} 
                  (vs Rs.{priceGradeC}/{productUnit} for Grade C).
                </p>
              </div>

              <Button onClick={resetForm} className="w-full">
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quality Grading</h1>
          <p className="text-muted-foreground mt-1">
            Test and grade batches to determine pricing and shelf life
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Grading Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Quality Test</CardTitle>
                  <CardDescription>
                    Evaluate batch quality parameters
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {untestedBatches.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No batches pending quality testing.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Register new harvests from the Farmer Intake page.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Select Batch</Label>
                    <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a batch to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {untestedBatches.map((batch) => {
                          const product = getProductById(batch.cropType);
                          return (
                            <SelectItem key={batch.batchId} value={batch.batchId}>
                              {product?.name || batch.cropType} - {batch.batchId} - {batch.quantity}{product?.unit || 'kg'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBatch && (
                    <>
                      {(() => {
                        const product = getProductById(selectedBatch.cropType);
                        const productName = product?.name || selectedBatch.cropType;
                        const productUnit = product?.unit || 'kg';
                        return (
                          <div className="p-3 bg-secondary rounded-lg text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="text-muted-foreground">Product:</span>
                              <span>{productName}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-muted-foreground">Farmer:</span>
                              <span>{selectedBatch.farmer?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-muted-foreground">Storage:</span>
                              <span>{selectedBatch.storage?.storageType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Quantity:</span>
                              <span>{selectedBatch.quantity} {productUnit}</span>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label>Visual Quality (1-5)</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={visualQuality}
                              onValueChange={setVisualQuality}
                              min={1}
                              max={5}
                              step={1}
                              className="flex-1"
                            />
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`h-5 w-5 ${star <= visualQuality[0] ? 'text-warning fill-warning' : 'text-muted'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Rate appearance, color uniformity, and ripeness
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Firmness</Label>
                          <Select value={firmness} onValueChange={(v: Firmness) => setFirmness(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">High (Firm, long shelf life)</SelectItem>
                              <SelectItem value="Medium">Medium (Standard)</SelectItem>
                              <SelectItem value="Low">Low (Soft, consume soon)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Predicted Grade */}
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Predicted Grade</p>
                        {(() => {
                          const product = getProductById(selectedBatch.cropType);
                          const predictedPrice = getProductPrice(selectedBatch.cropType, calculatedGrade);
                          return (
                            <div className="flex items-center justify-between">
                              <Badge className={`text-lg py-1 px-3 ${gradeColors[calculatedGrade]}`}>
                                Grade {calculatedGrade}
                              </Badge>
                              <span className="text-lg font-bold text-primary">
                                Rs.{predictedPrice}/{product?.unit || 'kg'}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      <Button onClick={handleGrade} className="w-full" size="lg">
                        Confirm Grade
                      </Button>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tests</CardTitle>
              <CardDescription>
                Previously graded batches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testedBatches.slice(0, 6).map((batch) => {
                  const product = getProductById(batch.cropType);
                  const pricePerUnit = batch.qualityGrade ? getProductPrice(batch.cropType, batch.qualityGrade) : 0;
                  return (
                    <div 
                      key={batch.batchId}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{product?.name || batch.cropType}</p>
                        <p className="font-mono text-xs text-muted-foreground">{batch.batchId}</p>
                        <p className="text-xs text-muted-foreground">{batch.quantity} {product?.unit || 'kg'}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={gradeColors[batch.qualityGrade!]}>
                          Grade {batch.qualityGrade}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rs.{pricePerUnit}/{product?.unit || 'kg'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {testedBatches.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No tests completed yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
