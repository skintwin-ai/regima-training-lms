import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User } from "@/lib/types";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface IngredientsProps {
  user: User | null;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
}

interface Ingredient {
  name: string;
  category: string;
  mainFunctions: string[];
  benefits: string[];
  concentration: string;
  notes: string;
}

export default function Ingredients({ user, onLogin, onLogout }: IngredientsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { data: ingredientData, isLoading } = useQuery({
    queryKey: ['/api/ingredients'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const ingredients: Ingredient[] = ingredientData?.ingredients || [];
  const categories: string[] = ingredientData?.categories || [];
  
  // Filter ingredients based on search term and active category
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.mainFunctions.some(func => func.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ingredient.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !activeCategory || ingredient.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Skincare Ingredients Reference</h1>
          <p className="text-muted-foreground mt-2">
            A comprehensive guide to active ingredients used in REGIMA skincare products and treatments
          </p>
        </div>
        
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input
                    placeholder="Search ingredients, functions, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {activeCategory && (
                    <Button variant="outline" onClick={() => setActiveCategory(null)} className="gap-1">
                      <span>Clear Filter:</span>
                      <Badge variant="secondary">{activeCategory}</Badge>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="mr-2 h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Browse ingredients by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-1">
                        {categories.map((category) => (
                          <Button
                            key={category}
                            variant={activeCategory === category ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveCategory(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeCategory ? `${activeCategory} Ingredients` : "All Ingredients"}
                    </CardTitle>
                    <CardDescription>
                      {filteredIngredients.length} ingredients found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <Accordion type="single" collapsible className="w-full">
                        {filteredIngredients.map((ingredient, index) => (
                          <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                              <div className="flex justify-between items-center w-full pr-4">
                                <span>{ingredient.name}</span>
                                <Badge variant="outline">{ingredient.category}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-2">
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Concentration Range</h4>
                                  <p>{ingredient.concentration}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Main Functions</h4>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {ingredient.mainFunctions.map((func, idx) => (
                                      <li key={idx}>{func}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Skin Benefits</h4>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {ingredient.benefits.map((benefit, idx) => (
                                      <li key={idx}>{benefit}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-2">REGIMA Formulation Notes</h4>
                                  <p className="text-sm">{ingredient.notes}</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Want to learn more about skincare ingredients? Visit the{" "}
              <Link href="/modules" className="text-primary hover:underline">
                Skincare Ingredients & Formulations
              </Link>{" "}
              module.
            </p>
          </div>
        </div>
    </div>
  );
}