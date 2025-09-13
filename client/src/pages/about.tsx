import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Award, Users, Target, Sparkles, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4" data-testid="text-page-title">About REGIMA</h1>
        <p className="text-xl text-muted-foreground">
          Leading the way in professional skincare excellence since 1992
        </p>
      </div>

      {/* Mission Statement */}
      <Card className="max-w-4xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            REGIMA is dedicated to providing skincare professionals with the highest quality 
            products and comprehensive training. We combine cutting-edge scientific research 
            with natural ingredients to create effective, results-driven skincare solutions 
            that transform lives.
          </p>
        </CardContent>
      </Card>

      {/* Values Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Excellence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We maintain the highest standards in product formulation, 
              manufacturing, and professional education.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Innovation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Continuously advancing skincare science through research 
              and development of breakthrough formulations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Partnership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Building lasting relationships with skincare professionals 
              through comprehensive training and ongoing support.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company Overview */}
      <Card className="max-w-4xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Global Presence
          </CardTitle>
          <CardDescription>
            Trusted by professionals worldwide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Heritage</h3>
              <p className="text-muted-foreground">
                For over three decades, REGIMA has been at the forefront of 
                professional skincare, developing products that deliver visible, 
                lasting results. Our commitment to quality and efficacy has made 
                us a trusted partner for skincare professionals globally.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Research & Development</h3>
              <p className="text-muted-foreground">
                Our state-of-the-art laboratories work tirelessly to identify 
                and harness the power of natural ingredients, combining them with 
                advanced delivery systems to maximize their effectiveness and 
                ensure optimal skin health.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Commitment */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Professional Training Excellence</CardTitle>
          <CardDescription>
            Empowering professionals with knowledge and expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            At REGIMA, we believe that exceptional products require exceptional 
            knowledge. That's why we've developed this comprehensive training portal 
            to ensure every professional using our products has the expertise to 
            deliver outstanding results.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Our training covers:</strong> Product knowledge, ingredient science, 
              application techniques, treatment protocols, and client consultation skills.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}