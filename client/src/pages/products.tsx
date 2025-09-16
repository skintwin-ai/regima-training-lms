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
import { Loader2, ShoppingBag, Beaker, Filter } from "lucide-react";

interface ProductsProps {
  user: User | null;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
}

interface Product {
  id: number;
  name: string;
  category: string;
  type: "professional" | "retail";
  description: string;
  keyIngredients: string[];
  skinTypes: string[];
  size: string;
  usageInstructions: string;
}

export default function Products({ user, onLogin, onLogout }: ProductsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  
  const { data: productData, isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const products: Product[] = productData?.products || [];
  const categories: string[] = productData?.categories || [];
  const types: string[] = productData?.types || [];
  
  // Filter products based on search term, active category, and active type
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.keyIngredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())) ||
      product.skinTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !activeCategory || product.category === activeCategory;
    const matchesType = !activeType || product.type === activeType;
    
    return matchesSearch && matchesCategory && matchesType;
  });
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">REGIMA Product Library</h1>
          <p className="text-muted-foreground mt-2">
            A comprehensive catalog of professional and retail products for skincare treatments
          </p>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input
                    placeholder="Search products, ingredients, or skin types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {activeCategory && (
                    <Button variant="outline" onClick={() => setActiveCategory(null)} className="gap-1 text-xs">
                      <span>Category:</span>
                      <Badge variant="secondary">{activeCategory}</Badge>
                    </Button>
                  )}
                  
                  {activeType && (
                    <Button variant="outline" onClick={() => setActiveType(null)} className="gap-1 text-xs">
                      <span>Type:</span>
                      <Badge variant="secondary">{activeType === 'professional' ? 'Professional' : 'Retail'}</Badge>
                    </Button>
                  )}
                  
                  {(activeCategory || activeType) && (
                    <Button variant="ghost" onClick={() => {
                      setActiveCategory(null);
                      setActiveType(null);
                    }} className="text-xs">
                      Clear All Filters
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
            <div className="grid gap-6 md:grid-cols-4">
              {/* Left Sidebar - Filters */}
              <div className="md:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter size={18} />
                      <span>Filters</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="space-y-6">
                      {/* Product Types */}
                      <div>
                        <h3 className="text-sm font-medium mb-3">Product Types</h3>
                        <div className="space-y-2">
                          {types.map((type) => (
                            <Button
                              key={type}
                              variant={activeType === type ? "default" : "outline"}
                              className="w-full justify-start text-left"
                              size="sm"
                              onClick={() => setActiveType(type === activeType ? null : type)}
                            >
                              {type === 'professional' ? (
                                <div className="flex items-center">
                                  <Beaker className="h-4 w-4 mr-2" />
                                  <span>Professional</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <ShoppingBag className="h-4 w-4 mr-2" />
                                  <span>Retail</span>
                                </div>
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Categories */}
                      <div>
                        <h3 className="text-sm font-medium mb-3">Product Categories</h3>
                        <ScrollArea className="h-[300px] pr-3">
                          <div className="space-y-2">
                            {categories.map((category) => (
                              <Button
                                key={category}
                                variant={activeCategory === category ? "default" : "ghost"}
                                className="w-full justify-start text-left"
                                size="sm"
                                onClick={() => setActiveCategory(category === activeCategory ? null : category)}
                              >
                                {category}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content - Product List */}
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeCategory 
                        ? activeType 
                          ? `${activeCategory} - ${activeType === 'professional' ? 'Professional' : 'Retail'}`
                          : activeCategory
                        : activeType
                          ? activeType === 'professional' ? 'Professional Products' : 'Retail Products'
                          : 'All Products'}
                    </CardTitle>
                    <CardDescription>
                      {filteredProducts.length} products found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <Accordion type="single" collapsible className="w-full">
                        {filteredProducts.map((product) => (
                          <AccordionItem value={`item-${product.id}`} key={product.id}>
                            <AccordionTrigger>
                              <div className="flex justify-between items-center w-full pr-4">
                                <div className="text-left">
                                  <span className="block">{product.name}</span>
                                  <span className="text-xs text-muted-foreground">{product.size}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={product.type === 'professional' ? "default" : "outline"}>
                                    {product.type === 'professional' ? 'Pro' : 'Retail'}
                                  </Badge>
                                  <Badge variant="secondary">{product.category}</Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-2">
                                <div>
                                  <p>{product.description}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Key Ingredients</h4>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {product.keyIngredients.map((ingredient, idx) => (
                                      <li key={idx}>{ingredient}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Recommended Skin Types</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {product.skinTypes.map((skinType, idx) => (
                                      <Badge key={idx} variant="outline">{skinType}</Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Usage Instructions</h4>
                                  <p className="text-sm">{product.usageInstructions}</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">No products found</h3>
                          <p className="text-muted-foreground text-center max-w-md mt-2">
                            Try adjusting your search or filters to find what you're looking for.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => {
                              setSearchTerm("");
                              setActiveCategory(null);
                              setActiveType(null);
                            }}
                          >
                            Clear all filters
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Need more information about ingredients? Check out the{" "}
              <Link href="/ingredients" className="text-primary hover:underline">
                Ingredients Reference
              </Link>{" "}
              for detailed information on active ingredients.
            </p>
          </div>
        </div>
    </div>
  );
}