
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSessionKey } from "@/lib/sessionManager";
import { getFlashcards, getDecks, getThemes } from "@/lib/localStorage";
import { Calendar, CalendarDays, Clock, Zap, TrendingUp, Medal, BookOpen, BrainCircuit, BarChart4 } from "lucide-react";

const StatsPage = () => {
  const [periodFilter, setPeriodFilter] = useState<"week" | "month" | "year">("week");
  const [studyStats, setStudyStats] = useState({
    totalCards: 0,
    totalDecks: 0,
    totalThemes: 0,
    studyDays: 0,
    averageScore: 0,
    totalStudyTime: 0,
    streakDays: 0,
    cardsPerDay: 0,
  });

  useEffect(() => {
    // In a real app, this would come from a backend API
    // We'll simulate some data based on the existing localStorage data
    const sessionKey = getSessionKey();
    if (!sessionKey) return;

    const flashcards = getFlashcards();
    const decks = getDecks();
    const themes = getThemes();

    // Simulate study statistics - in a real app this would be actual user data
    setStudyStats({
      totalCards: flashcards.length,
      totalDecks: decks.length,
      totalThemes: themes.length,
      studyDays: Math.min(flashcards.length / 3, 30), // Estimate days based on cards
      averageScore: Math.round(70 + Math.random() * 20), // Random score between 70-90%
      totalStudyTime: Math.round((flashcards.length * 2) / 60), // Assuming 2 minutes per card on average
      streakDays: Math.min(Math.round(flashcards.length / 4), 14), // Estimate based on cards
      cardsPerDay: Math.max(Math.round(flashcards.length / Math.max(studyStats.studyDays, 1)), 1),
    });
  }, [periodFilter]);

  // Sample chart data for demonstration - would come from real user data in a production app
  const activityData = {
    week: [
      { name: "Lun", minutes: 28 },
      { name: "Mar", minutes: 15 },
      { name: "Mer", minutes: 45 },
      { name: "Jeu", minutes: 32 },
      { name: "Ven", minutes: 18 },
      { name: "Sam", minutes: 35 },
      { name: "Dim", minutes: 22 },
    ],
    month: Array.from({ length: 30 }, (_, i) => ({
      name: `${i + 1}`,
      minutes: Math.floor(Math.random() * 60) + 5,
    })),
    year: Array.from({ length: 12 }, (_, i) => {
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      return {
        name: monthNames[i],
        minutes: Math.floor(Math.random() * 800) + 200,
      };
    }),
  };

  const performanceData = {
    week: [
      { name: "Lun", score: 85 },
      { name: "Mar", score: 78 },
      { name: "Mer", score: 92 },
      { name: "Jeu", score: 88 },
      { name: "Ven", score: 82 },
      { name: "Sam", score: 90 },
      { name: "Dim", score: 86 },
    ],
    month: Array.from({ length: 30 }, (_, i) => ({
      name: `${i + 1}`,
      score: Math.floor(Math.random() * 25) + 70, // Random score between 70-95%
    })),
    year: Array.from({ length: 12 }, (_, i) => {
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      return {
        name: monthNames[i],
        score: Math.floor(Math.random() * 20) + 75, // Random score between 75-95%
      };
    }),
  };

  const subjectDistributionData = [
    { name: "Mathématiques", value: 35 },
    { name: "Sciences", value: 20 },
    { name: "Langues", value: 25 },
    { name: "Histoire", value: 10 },
    { name: "Autre", value: 10 },
  ];

  return (
    <div className="container max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Vos statistiques d'apprentissage
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualisez vos progrès et analysez vos habitudes d'étude
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Cartes étudiées"
          value={studyStats.totalCards.toString()}
          description="Total des flashcards"
          icon={<BookOpen className="h-5 w-5 text-indigo-500" />}
          trend="+5 aujourd'hui"
        />
        <StatCard
          title="Temps d'étude"
          value={`${studyStats.totalStudyTime} h`}
          description="Temps total"
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          trend="+45 min aujourd'hui"
        />
        <StatCard
          title="Score moyen"
          value={`${studyStats.averageScore}%`}
          description="Taux de réussite"
          icon={<Medal className="h-5 w-5 text-yellow-500" />}
          trend="+2% cette semaine"
        />
        <StatCard
          title="Série actuelle"
          value={`${studyStats.streakDays} jours`}
          description="Jours consécutifs"
          icon={<Zap className="h-5 w-5 text-orange-500" />}
          trend="Record: 14 jours"
        />
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="bg-muted/50 p-0.5">
          <TabsTrigger value="activity" className="text-sm">
            Activité
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-sm">
            Performance
          </TabsTrigger>
          <TabsTrigger value="subjects" className="text-sm">
            Matières
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="md:col-span-3">
            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Temps d'étude</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={periodFilter === "week" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPeriodFilter("week")}
                        className="h-8"
                      >
                        Semaine
                      </Button>
                      <Button
                        variant={periodFilter === "month" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPeriodFilter("month")}
                        className="h-8"
                      >
                        Mois
                      </Button>
                      <Button
                        variant={periodFilter === "year" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPeriodFilter("year")}
                        className="h-8"
                      >
                        Année
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Minutes d'étude par jour</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={activityData[periodFilter]}
                    index="name"
                    categories={["minutes"]}
                    colors={["indigo"]}
                    valueFormatter={(value) => `${value} min`}
                    className="aspect-[4/3]"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-0">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Taux de réussite</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={periodFilter === "week" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPeriodFilter("week")}
                        className="h-8"
                      >
                        Semaine
                      </Button>
                      <Button
                        variant={periodFilter === "month" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPeriodFilter("month")}
                        className="h-8"
                      >
                        Mois
                      </Button>
                      <Button
                        variant={periodFilter === "year" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPeriodFilter("year")}
                        className="h-8"
                      >
                        Année
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Pourcentage de réponses correctes</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={performanceData[periodFilter]}
                    index="name"
                    categories={["score"]}
                    colors={["purple"]}
                    valueFormatter={(value) => `${value}%`}
                    className="aspect-[4/3]"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects" className="mt-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Répartition par matière</CardTitle>
                  <CardDescription>Temps consacré à chaque sujet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <PieChart
                      data={subjectDistributionData}
                      index="name"
                      category="value"
                      valueFormatter={(value) => `${value}%`}
                      colors={["indigo", "violet", "fuchsia", "purple", "slate"]}
                      className="h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Activité récente</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-4">
                  <RecentActivity
                    title="Étude: Mathématiques"
                    time="Il y a 2 heures"
                    stats="45 minutes · 85% de réussite"
                    icon={<BrainCircuit className="h-4 w-4 text-indigo-500" />}
                  />
                  <RecentActivity
                    title="Création de 12 cartes"
                    time="Hier, 15:30"
                    stats="Thème: Sciences"
                    icon={<BookOpen className="h-4 w-4 text-green-500" />}
                  />
                  <RecentActivity
                    title="Série de 7 jours"
                    time="Aujourd'hui"
                    stats="Bravo, continuez !"
                    icon={<Zap className="h-4 w-4 text-yellow-500" />}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Objectifs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <GoalItem
                  title="Étudier 30 minutes"
                  progress={75}
                  target="Chaque jour"
                  icon={<Clock className="h-4 w-4 text-blue-500" />}
                />
                <GoalItem
                  title="Apprendre 50 cartes"
                  progress={40}
                  target="Cette semaine"
                  icon={<TrendingUp className="h-4 w-4 text-indigo-500" />}
                />
                <GoalItem
                  title="Atteindre 90% de réussite"
                  progress={88}
                  target="Ce mois-ci"
                  icon={<BarChart4 className="h-4 w-4 text-purple-500" />}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      <Separator className="my-6" />

      <section className="py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-xl font-semibold">Améliorez vos statistiques</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Créez de nouveaux decks de flashcards et étudiez régulièrement pour améliorer vos performances.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link to="/explore">Explorer les decks</Link>
            </Button>
            <Button asChild variant="outline" className="border-indigo-200 dark:border-indigo-800/30">
              <Link to="/learning-methods">Méthodes d'apprentissage</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
  trend?: string;
}

const StatCard = ({ title, value, description, icon, trend }: StatCardProps) => (
  <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/30">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {trend && (
        <Badge variant="success" className="mt-2 text-xs">
          {trend}
        </Badge>
      )}
    </CardContent>
  </Card>
);

interface RecentActivityProps {
  title: string;
  time: string;
  stats: string;
  icon?: React.ReactNode;
}

const RecentActivity = ({ title, time, stats, icon }: RecentActivityProps) => (
  <div className="flex gap-3">
    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-950/20">
      {icon || <CalendarDays className="h-4 w-4 text-indigo-500" />}
    </div>
    <div>
      <p className="font-medium leading-none">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{time}</p>
      <p className="text-xs text-foreground/70 mt-1">{stats}</p>
    </div>
  </div>
);

interface GoalItemProps {
  title: string;
  progress: number;
  target: string;
  icon?: React.ReactNode;
}

const GoalItem = ({ title, progress, target, icon }: GoalItemProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <span className="text-sm font-medium">{progress}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
        style={{ width: `${progress}%` }}
      />
    </div>
    <p className="text-xs text-muted-foreground">{target}</p>
  </div>
);

export default StatsPage;
