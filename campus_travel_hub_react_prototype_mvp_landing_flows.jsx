import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Tent, Search } from "lucide-react";

// Mock Data
const gear = [
  { id: 1, name: "50L Trekking Backpack", price: 120, deposit: 500, location: "Hostel A", owner: "Aisha K.", rating: 4.8 },
  { id: 2, name: "2-Person Tent", price: 160, deposit: 800, location: "PG Block", owner: "Ravi S.", rating: 4.6 },
  { id: 3, name: "Sleeping Bag -5°C", price: 90, deposit: 400, location: "Hostel C", owner: "Neha M.", rating: 4.7 },
];

const itineraries = [
  { id: 1, title: "Kedarkantha Weekend", dates: "Oct 18–20", creator: "Vikram P.", stops: ["Dehradun", "Sankri", "Juda Talab", "Summit"], notes: "Budget ~₹6k, rental gear welcome." },
  { id: 2, title: "Pondicherry Ride", dates: "Nov 1–3", creator: "Sara A.", stops: ["Chennai", "Auroville", "Promenade"], notes: "Scooter rentals, beach hostel." },
];

const companions = [
  { id: 1, name: "Maya", trip: "Spiti Circuit", dates: "Nov 6–14", prefs: ["Budget", "Backpacking", "Photography"], seats: 2 },
  { id: 2, name: "Arjun", trip: "Hampi Weekend", dates: "Oct 25–27", prefs: ["History", "Hostels", "Sunrise hikes"], seats: 3 },
];

export default function CampusTravelHub() {
  const [q, setQ] = useState("");
  const filteredGear = useMemo(() => gear.filter(g => g.name.toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800">
      <header className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tent className="w-7 h-7"/>
          <h1 className="text-2xl font-bold">Campus Travel Hub</h1>
          <Badge className="ml-2">Beta</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Log in</Button>
          <Button>Sign up</Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Rent gear, share plans, and find travel buddies — all inside campus.</h2>
            <p className="mt-3 text-slate-600">Built for students: zero-commission rentals, verified campus IDs, and smart matching for itineraries.</p>
            <div className="mt-5 flex gap-2">
              <Button size="lg">List Your Gear</Button>
              <Button variant="outline" size="lg">Post an Itinerary</Button>
            </div>
            <ul className="mt-4 text-slate-600 list-disc pl-5 space-y-1">
              <li>Safety first: ID verification + refundable deposits</li>
              <li>No-hassle exchanges at campus pickup points</li>
              <li>Group chat rooms for each trip</li>
            </ul>
          </div>
          <Card className="shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5"/>Quick search</CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="Search gear (e.g., tent, backpack)" value={q} onChange={e=>setQ(e.target.value)} className="mb-3"/>
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredGear.map(g => (
                  <Card key={g.id}>
                    <CardContent className="pt-4">
                      <div className="font-medium">{g.name}</div>
                      <div className="text-sm text-slate-600">₹{g.price}/day • Dep ₹{g.deposit}</div>
                      <div className="text-xs mt-1 flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3"/>{g.location} • Owner {g.owner} • ⭐{g.rating}</div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm">Rent</Button>
                        <Button size="sm" variant="outline">Message</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <Tabs defaultValue="gear">
          <TabsList className="mb-4">
            <TabsTrigger value="gear">Rent Gear</TabsTrigger>
            <TabsTrigger value="itineraries">Itineraries</TabsTrigger>
            <TabsTrigger value="companions">Find Companions</TabsTrigger>
          </TabsList>

          <TabsContent value="gear">
            <div className="grid md:grid-cols-3 gap-4">
              {gear.map(g => (
                <Card key={g.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{g.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-600">₹{g.price}/day • Dep ₹{g.deposit}</div>
                    <div className="text-xs mt-1 text-slate-500">Pickup: {g.location} • Owner: {g.owner} • ⭐{g.rating}</div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm">Rent</Button>
                      <Button size="sm" variant="outline">Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="itineraries">
            <div className="grid md:grid-cols-2 gap-4">
              {itineraries.map(it => (
                <Card key={it.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{it.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">{it.dates} • By {it.creator}</div>
                    <div className="mt-2 text-slate-600 text-sm">Stops: {it.stops.join(" → ")}</div>
                    <p className="mt-2 text-slate-600 text-sm">{it.notes}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm">Join Group</Button>
                      <Button size="sm" variant="outline">Message Host</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6">
              <CardHeader className="pb-2"><CardTitle>Share an Itinerary</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                <Input placeholder="Trip title (e.g., Manali Long Weekend)"/>
                <Input placeholder="Dates (e.g., Nov 2–5)"/>
                <Textarea placeholder="Stops, budget, notes" className="md:col-span-2"/>
                <Button className="md:col-span-2">Publish</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companions">
            <div className="grid md:grid-cols-3 gap-4">
              {companions.map(c => (
                <Card key={c.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4"/>{c.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">{c.trip}</div>
                    <div className="text-xs text-slate-500">{c.dates} • Seats: {c.seats}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {c.prefs.map(p => (<Badge key={p} variant="secondary">{p}</Badge>))}
                    </div>
                    <div className="mt-3 flex gap-2"><Button size="sm">Request</Button><Button size="sm" variant="outline">Profile</Button></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 grid md:grid-cols-3 gap-4">
          <div>
            <div className="font-semibold">Campus Travel Hub</div>
            <p>Student‑run marketplace for safe gear rentals and peer travel.</p>
          </div>
          <div>
            <div className="font-semibold">Safety & Policy</div>
            <ul className="list-disc pl-5">
              <li>Campus ID verification</li>
              <li>Refundable deposits & late fees</li>
              <li>Damage claims flow</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Contact</div>
            <p>support@campustravel.local</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
