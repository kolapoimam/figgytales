import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Pricing Plans</h1>
        <p className="text-center text-muted-foreground mb-12">
          Choose the plan that best fits your needs. Start for free, upgrade anytime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Free</CardTitle>
              <p className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></p>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✔</span> 5 user stories per month
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✔</span> Basic AI features
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✔</span> Community support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/auth">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col border-orange-500 border-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Pro</CardTitle>
              <p className="text-3xl font-bold">$15<span className="text-sm font-normal">/month</span></p>
              <p className="text-muted-foreground">For growing teams</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✔</span> Unlimited user stories
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✔</span> Advanced AI features
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✔</span> Priority email support
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✔</span> Collaboration tools
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                <Link to="/auth">Choose Pro</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Enterprise</CardTitle>
              <p className="text-3xl font-bold">Custom</p>
              <p className="text-muted-foreground">For large organizations</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✔</span> Everything in Pro
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✔</span> Dedicated account manager
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✔</span> Custom integrations
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✔</span> 24/7 support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
