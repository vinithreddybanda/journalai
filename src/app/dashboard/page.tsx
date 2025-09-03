"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("date", { ascending: false });

      if (!error && data) {
        setEntries(data.map((entry: any) => ({ ...entry, date: new Date(entry.date) })));
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    const entryData = {
      date: format(selectedDate, "yyyy-MM-dd"),
      title: title.trim(),
      content: content.trim(),
    };

    const { data, error } = await supabase
      .from("journal_entries")
      .insert([entryData])
      .select()
      .single();

    if (!error && data) {
      setEntries([{ ...data, date: new Date(data.date) }, ...entries]);
      setIsEditing(false);
      setTitle("");
      setContent("");
    }
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-6 grid grid-cols-[250px_1fr] gap-6">
      {/* Sidebar */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                  onClick={() => {
                    setSelectedDate(entry.date);
                    setTitle(entry.title);
                    setContent(entry.content);
                    setIsEditing(false);
                  }}
                >
                  <p className="text-sm font-medium">{entry.title || "(No Title)"}</p>
                  <p className="text-xs text-gray-500">
                    {format(entry.date, "MMM d, yyyy")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No matching entries</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>{format(selectedDate, "EEEE, MMMM do")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <Button onClick={handleSave}>Save</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{title || "No Title"}</h2>
              <p className="text-gray-700 whitespace-pre-line">{content || "No content yet."}</p>
              <Button onClick={() => setIsEditing(true)}>New Entry</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
