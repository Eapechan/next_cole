
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Leaderboard = () => {
  const topPerformers = [
    {
      rank: 1,
      name: "Singareni Collieries Company Ltd",
      location: "Telangana",
      reductionPercent: 34.2,
      emissionScore: 9.2,
      badge: "Gold Champion",
      points: 2850,
      initiatives: ["Solar Power", "Electric Fleet", "Afforestation"],
      change: "+2.3%"
    },
    {
      rank: 2,
      name: "Mahanadi Coalfields Limited",
      location: "Odisha",
      reductionPercent: 28.7,
      emissionScore: 8.8,
      badge: "Silver Leader",
      points: 2640,
      initiatives: ["LED Lighting", "Methane Capture", "Waste Reduction"],
      change: "+1.8%"
    },
    {
      rank: 3,
      name: "Western Coalfields Limited",
      location: "Maharashtra",
      reductionPercent: 26.1,
      emissionScore: 8.5,
      badge: "Bronze Achiever",
      points: 2480,
      initiatives: ["Energy Efficiency", "Transportation", "Training"],
      change: "+1.2%"
    },
    {
      rank: 4,
      name: "Northern Coalfields Limited",
      location: "Uttar Pradesh",
      reductionPercent: 23.4,
      emissionScore: 8.1,
      badge: "Green Performer",
      points: 2280,
      initiatives: ["Renewable Energy", "Process Optimization"],
      change: "+0.9%"
    },
    {
      rank: 5,
      name: "South Eastern Coalfields Ltd",
      location: "Chhattisgarh",
      reductionPercent: 21.8,
      emissionScore: 7.9,
      badge: "Eco Warrior",
      points: 2150,
      initiatives: ["Carbon Offset", "Equipment Upgrade"],
      change: "+0.6%"
    }
  ];

  const achievements = [
    {
      id: "carbon-crusher",
      title: "Carbon Crusher",
      description: "Reduce emissions by 25% in a single year",
      icon: "🏆",
      rarity: "Gold",
      holders: 12,
      criteria: "25% annual reduction"
    },
    {
      id: "solar-pioneer",
      title: "Solar Pioneer",
      description: "Install 1MW+ of solar capacity",
      icon: "☀️",
      rarity: "Silver",
      holders: 34,
      criteria: "1MW+ solar installation"
    },
    {
      id: "green-fleet",
      title: "Green Fleet Champion",
      description: "Electrify 50%+ of vehicle fleet",
      icon: "🚗",
      rarity: "Silver",
      holders: 28,
      criteria: "50%+ electric vehicles"
    },
    {
      id: "tree-planter",
      title: "Forest Guardian",
      description: "Plant 10,000+ trees in a year",
      icon: "🌳",
      rarity: "Bronze",
      holders: 67,
      criteria: "10,000+ trees planted"
    },
    {
      id: "efficiency-master",
      title: "Efficiency Master",
      description: "Achieve 90%+ energy efficiency score",
      icon: "⚡",
      rarity: "Gold",
      holders: 8,
      criteria: "90%+ efficiency score"
    },
    {
      id: "data-champion",
      title: "Data Champion",
      description: "100% accurate reporting for 12 months",
      icon: "📊",
      rarity: "Bronze",
      holders: 89,
      criteria: "Perfect data accuracy"
    }
  ];

  const monthlyChallenge = {
    title: "February Green Challenge",
    description: "Reduce transportation emissions by 15%",
    progress: 67,
    participants: 124,
    timeLeft: "8 days left",
    reward: "500 points + Eco Warrior badge",
    leaderName: "Coal India Limited - Jharia"
  };

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case "Gold": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Silver": return "bg-gray-100 text-gray-800 border-gray-300";
      case "Bronze": return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carbon Neutrality Leaderboard</h1>
          <p className="text-gray-600 mt-1">Celebrating top performers in India's coal mine sustainability</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="all-regions">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-regions">All Regions</SelectItem>
              <SelectItem value="north">Northern India</SelectItem>
              <SelectItem value="south">Southern India</SelectItem>
              <SelectItem value="east">Eastern India</SelectItem>
              <SelectItem value="west">Western India</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">🏆 My Ranking</Button>
        </div>
      </div>

      <Tabs defaultValue="rankings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rankings">Top Performers</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Monthly Challenges</TabsTrigger>
          <TabsTrigger value="recognition">Recognition Program</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-6">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topPerformers.slice(0, 3).map((performer, index) => (
              <Card key={performer.rank} className={`relative overflow-hidden ${index === 0 ? 'ring-2 ring-yellow-400' : index === 1 ? 'ring-2 ring-gray-400' : 'ring-2 ring-orange-400'}`}>
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{getRankMedal(performer.rank)}</div>
                  <CardTitle className="text-lg">{performer.name}</CardTitle>
                  <CardDescription>{performer.location}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="text-2xl font-bold text-green-600">
                    {performer.reductionPercent}%
                  </div>
                  <div className="text-sm text-gray-600">CO₂ Reduction</div>
                  
                  <Badge className={`${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'}`}>
                    {performer.badge}
                  </Badge>
                  
                  <div className="text-lg font-semibold">
                    {performer.points.toLocaleString()} points
                  </div>
                  
                  <div className="flex flex-wrap gap-1 justify-center">
                    {performer.initiatives.slice(0, 2).map((initiative, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {initiative}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Rankings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Rankings</CardTitle>
              <CardDescription>
                All registered coal mines ranked by carbon reduction performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer) => (
                  <div key={performer.rank} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold w-12 text-center">
                        {getRankMedal(performer.rank)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{performer.name}</h3>
                        <p className="text-sm text-gray-600">{performer.location}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{performer.badge}</Badge>
                          <span className="text-xs text-green-600">{performer.change} this month</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {performer.reductionPercent}%
                        </div>
                        <div className="text-xs text-gray-600">CO₂ Reduction</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {performer.emissionScore}
                        </div>
                        <div className="text-xs text-gray-600">Emission Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {performer.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {achievement.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge className={getBadgeColor(achievement.rarity)}>
                      {achievement.rarity} Achievement
                    </Badge>
                    
                    <div className="text-sm text-gray-600">
                      <strong>Criteria:</strong> {achievement.criteria}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {achievement.holders} mines earned this
                      </span>
                      <Button size="sm" variant="outline">
                        View Holders
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-xl">{monthlyChallenge.title}</CardTitle>
              <CardDescription>
                {monthlyChallenge.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Challenge Progress</span>
                    <span>{monthlyChallenge.progress}%</span>
                  </div>
                  <Progress value={monthlyChallenge.progress} className="h-4" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold">{monthlyChallenge.participants}</div>
                    <div className="text-xs text-gray-600">Participants</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{monthlyChallenge.timeLeft}</div>
                    <div className="text-xs text-gray-600">Remaining</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-green-600">500</div>
                    <div className="text-xs text-gray-600">Reward Points</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-blue-600">🥇</div>
                    <div className="text-xs text-gray-600">Leading</div>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Current Leader:</div>
                  <div className="font-semibold">{monthlyChallenge.leaderName}</div>
                </div>
                
                <Button className="w-full sustainability-gradient text-white">
                  Join Challenge
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Challenges</CardTitle>
              <CardDescription>
                Future sustainability challenges and competitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">March Energy Efficiency Sprint</h3>
                  <p className="text-sm text-gray-600">Improve energy efficiency by 10% in 30 days</p>
                  <p className="text-xs text-gray-500 mt-1">Starts: March 1, 2024 • Reward: 750 points</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold">Q2 Afforestation Marathon</h3>
                  <p className="text-sm text-gray-600">Plant the most trees in your region</p>
                  <p className="text-xs text-gray-500 mt-1">Starts: April 1, 2024 • Reward: Special recognition</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold">Annual Net Zero Challenge</h3>
                  <p className="text-sm text-gray-600">Achieve carbon neutrality for one full year</p>
                  <p className="text-xs text-gray-500 mt-1">Starts: June 1, 2024 • Reward: Gold Champion status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recognition" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recognition Programs</CardTitle>
                <CardDescription>
                  Official recognition and awards for outstanding performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">🏆 Coal Mine Excellence Awards</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Annual awards ceremony recognizing top performers in sustainability
                  </p>
                  <Badge className="mt-2 bg-gold-100 text-gold-800">
                    Applications open March 2024
                  </Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">🌟 Ministry Recognition</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Official recognition from Ministry of Environment & Climate Change
                  </p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                    Quarterly selection
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefits & Rewards</CardTitle>
                <CardDescription>
                  What you get for being a top performer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Priority access to green financing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Expedited regulatory approvals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Public recognition and media coverage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Access to exclusive sustainability networks</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Carbon credit trading preferences</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
