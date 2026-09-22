import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type User } from "@/lib/types";

interface PlatformProps {
  user: User | null;
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export default function Platform({ user, onLogin }: PlatformProps) {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("password");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await onLogin(username, password);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">SkinTwin operator login</CardTitle>
            <CardDescription className="text-center">
              One login signs you into Training, Connect, and RegimA Suite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} data-testid="platform-login">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-username">Username</Label>
                  <Input
                    id="platform-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    data-testid="platform-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-password">Password</Label>
                  <Input
                    id="platform-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="platform-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn} data-testid="platform-submit">
                  {isLoggingIn ? "Signing in…" : "Sign into SkinTwin"}
                </Button>
              </div>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Demo account: demo / password → demo@skintwin.ai
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">SkinTwin platform</h1>
      <p className="text-muted-foreground mb-8">
        Signed in as {user.email || user.username}. Continue opens Suite, then Connect, then returns here.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Training</CardTitle>
            <CardDescription>REGIMA LMS</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <a href="/">Open training</a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connect</CardTitle>
            <CardDescription>Clinic bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {user.continue?.connect ? (
              <Button asChild className="w-full">
                <a href={user.continue.connect} data-testid="platform-connect">
                  Open Connect
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Platform session unavailable</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suite</CardTitle>
            <CardDescription>Salon operations</CardDescription>
          </CardHeader>
          <CardContent>
            {user.continue?.suite ? (
              <Button asChild className="w-full">
                <a href={user.continue.suite} data-testid="platform-suite">
                  Open Suite
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Platform session unavailable</p>
            )}
          </CardContent>
        </Card>
      </div>
      {user.continue?.chain && (
        <div className="mt-6">
          <Button asChild>
            <a href={user.continue.chain} data-testid="platform-chain">
              Continue into Connect and Suite
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
