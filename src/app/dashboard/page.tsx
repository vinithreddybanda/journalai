"use client";

import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-white p-6">
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
            <Button onClick={() => setIsEditing(true)}>New Entry</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
