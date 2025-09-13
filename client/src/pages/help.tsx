import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, BookOpen, Mail, Phone, MessageSquare, Clock, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Help() {
  const faqs = [
    {
      id: "faq-1",
      question: "How do I access the training modules?",
      answer: "Once logged in, navigate to the Modules page from the main menu. Your progress is automatically tracked, and modules unlock sequentially as you complete them."
    },
    {
      id: "faq-2",
      question: "How long does it take to complete the training?",
      answer: "The complete REGIMA training program typically takes 8-12 hours to complete. You can progress at your own pace, and your progress is saved automatically."
    },
    {
      id: "faq-3",
      question: "Can I retake modules I've already completed?",
      answer: "Yes, you can review any completed module at any time. Simply navigate to the module and click on any lesson to review the content."
    },
    {
      id: "faq-4",
      question: "How do I get my certificate?",
      answer: "Upon completing all required modules and passing the final assessment with a score of 80% or higher, your certificate will be automatically generated and available for download."
    },
    {
      id: "faq-5",
      question: "What if I forget my password?",
      answer: "Contact your training administrator or REGIMA support team to reset your password. They will provide you with temporary credentials to regain access."
    },
    {
      id: "faq-6",
      question: "Are the training materials updated regularly?",
      answer: "Yes, our training content is regularly updated to reflect the latest product formulations, techniques, and industry standards. You'll be notified of major updates."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <HelpCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4" data-testid="text-page-title">Help Center</h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to succeed in your REGIMA training journey
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-sm">Training Guide</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Award className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-sm">Certification</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-sm">Community</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-sm">Support</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* FAQs */}
      <Card className="max-w-4xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about the REGIMA training platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="max-w-4xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Need additional help? Our support team is here for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground">training@regima.com</p>
                <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Phone Support</h3>
                <p className="text-sm text-muted-foreground">+44 20 1234 5678</p>
                <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9AM-5PM GMT</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Available on website</p>
                <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9AM-5PM GMT</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Resources */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Training Resources</CardTitle>
          <CardDescription>
            Additional materials to enhance your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold">Product Manual PDF</h3>
              <p className="text-sm text-muted-foreground">Complete guide to all REGIMA products</p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-download-manual">
              Download
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold">Treatment Protocols</h3>
              <p className="text-sm text-muted-foreground">Step-by-step treatment procedures</p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-download-protocols">
              Download
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold">Quick Reference Guide</h3>
              <p className="text-sm text-muted-foreground">Essential information at a glance</p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-download-guide">
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}