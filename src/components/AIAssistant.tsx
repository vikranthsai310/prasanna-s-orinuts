import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, X, Send, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNutritionalInfo, getProductDescription, askAIAssistant } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Prasanna\'s AI Assistant. Ask me anything about dry fruits, nutritional information, or product details. I can help you fill in product information!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: 'Copied!',
        description: 'Message copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy message',
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check if user is asking for nutritional info
      const lowerMessage = inputMessage.toLowerCase();
      const productContext = productName ? `for ${productName}` : '';
      
      if (lowerMessage.includes('nutrition') || lowerMessage.includes('calories') || lowerMessage.includes('protein')) {
        const productToSearch = productName || inputMessage;
        const data = await getNutritionalInfo(productToSearch);
        
        if (data) {
          const nutritionText = `Nutritional Information ${productContext}:\n\nCalories: ${data.calories} kcal\nProtein: ${data.protein}g\nFat: ${data.fat}g\nCarbs: ${data.carbs}g\nFiber: ${data.fiber}g\n\nWould you like me to fill these values in the form?`;
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: nutritionText,
            timestamp: new Date()
          }]);
        } else {
          throw new Error('Could not fetch nutritional data');
        }
      } else if (lowerMessage.includes('description') || lowerMessage.includes('write') || lowerMessage.includes('describe')) {
        const productToDescribe = productName || inputMessage;
        const description = await getProductDescription(productToDescribe);
        
        if (description) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Here's a product description ${productContext}:\n\n${description}\n\nYou can copy and paste this into the description field!`,
            timestamp: new Date()
          }]);
        } else {
          throw new Error('Could not generate description');
        }
      } else {
        // General question
        const response = await askAIAssistant(inputMessage);
        
        if (response) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: response,
            timestamp: new Date()
          }]);
        } else {
          throw new Error('Could not get response');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    <div className="fixed bottom-6 right-6 z-[9999] bg-white rounded-2xl shadow-2xl border-2 border-purple-200 w-96 h-[600px] flex flex-col animate-in slide-in-from-bottom">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Prasanna's AI</h3>
            <p className="text-xs text-muted-foreground">Your Product Assistant</p>
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

      {/* Product Context */}
      {productName && (
        <div className="bg-purple-50 border-b border-purple-100 px-4 py-2">
          <p className="text-xs text-muted-foreground">Current Product:</p>
          <p className="text-sm font-semibold text-purple-900">{productName}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.role === 'assistant' && (
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyMessage(message.content, index)}
                    className="h-6 px-2 text-xs hover:bg-gray-200"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about nutritional info, descriptions..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Try: "What's the nutrition info for almonds?" or "Write a description"
        </p>
      </div>
    </div>
  );
};
