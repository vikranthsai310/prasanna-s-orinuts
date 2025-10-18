import { useState } from 'react';
import { Sparkles, Loader2, X, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNutritionalInfo, getProductDescription } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantProps {
  onFillNutritionalInfo: (data: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  }) => void;
  onFillDescription: (description: string) => void;
  productName: string;
}

export const AIAssistant = ({ onFillNutritionalInfo, onFillDescription, productName }: AIAssistantProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false);
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);
  const { toast } = useToast();

  const handleGetNutritionalInfo = async () => {
    if (!productName.trim()) {
      toast({
        title: 'Product Name Required',
        description: 'Please enter a product name first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoadingNutrition(true);
    try {
      const data = await getNutritionalInfo(productName);
      if (data) {
        onFillNutritionalInfo(data);
        toast({
          title: 'Success!',
          description: `Nutritional information filled for ${productName}`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Could not fetch nutritional information',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get nutritional information',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingNutrition(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!productName.trim()) {
      toast({
        title: 'Product Name Required',
        description: 'Please enter a product name first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoadingDescription(true);
    try {
      const description = await getProductDescription(productName);
      if (description) {
        onFillDescription(description);
        toast({
          title: 'Success!',
          description: 'Description generated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Could not generate description',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate description',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingDescription(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg rounded-full px-6 py-6 flex items-center gap-2"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">AI Assistant</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-6 w-96 animate-in slide-in-from-bottom">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Product Name Display */}
      {productName && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-muted-foreground mb-1">Current Product:</p>
          <p className="font-semibold text-purple-900">{productName}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleGetNutritionalInfo}
          disabled={isLoadingNutrition || !productName}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          size="lg"
        >
          {isLoadingNutrition ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Nutrition Info...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Fill Nutritional Info
            </>
          )}
        </Button>

        <Button
          onClick={handleGenerateDescription}
          disabled={isLoadingDescription || !productName}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          size="lg"
        >
          {isLoadingDescription ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Description...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Description
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          💡 <strong>Tip:</strong> Enter the product name first, then use AI to auto-fill nutritional information and generate descriptions!
        </p>
      </div>
    </div>
  );
};
