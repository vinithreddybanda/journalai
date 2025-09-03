"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Brain,
  Calendar as CalendarIcon,
  Sparkles,
  Save,
  Edit3,
  Plus,
  Search,
  MoreVertical,
  LogOut,
  Heart,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { analyzeMood } from "@/lib/groq";
import { useRouter } from "next/navigation";

interface JournalEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  mood?: string;
  moodSummary?: string;
  moodScore?: number;
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isGeneratingMood, setIsGeneratingMood] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const router = useRouter();

  // Load entries from Supabase
  const loadEntries = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading entries:', error);
        return;
      }

      const formattedEntries = data.map(entry => {
        let entryDate = new Date(entry.date);
        if (isNaN(entryDate.getTime())) {
          console.warn('Invalid date in database entry:', entry);
          // Use current date as fallback
          entryDate = new Date();
        }
        return {
          ...entry,
          date: entryDate,
          moodSummary: entry.mood_summary, // Map database field to UI property
          mood: entry.mood || 'neutral' // Ensure mood has a default value
        };
      });

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Check authentication and load user data
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth error:', error.message);
        router.push('/login');
        return;
      }
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    };

    checkUser();
  }, [router]);

  // Load entries when user is set
  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user, loadEntries]);

  useEffect(() => {
    // Find existing entry for selected date
    const existingEntry = entries.find(entry => {
      if (!entry.date || !(entry.date instanceof Date) || isNaN(entry.date.getTime())) {
        console.warn('Invalid date found in entry:', entry);
        return false;
      }
      return format(entry.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    });

    if (existingEntry) {
      // Only update currentEntry if it's different or doesn't exist
      if (!currentEntry || currentEntry.id !== existingEntry.id ||
          currentEntry.moodSummary !== existingEntry.moodSummary) {
        setCurrentEntry(existingEntry);
      }
      // Only update title/content if not currently editing
      if (!isEditing) {
        setTitle(existingEntry.title);
        setContent(existingEntry.content);
      }
    } else {
      setCurrentEntry(null);
      // Only reset if not editing
      if (!isEditing) {
        setTitle("");
        setContent("");
        setIsEditing(false);
      }
    }
  }, [selectedDate, entries, isEditing, currentEntry]);

  // Separate effect to handle moodSummary updates without interfering with editing
  useEffect(() => {
    if (currentEntry) {
      const latestEntry = entries.find(entry => entry.id === currentEntry.id);
      if (latestEntry && latestEntry.moodSummary !== currentEntry.moodSummary) {
        console.log('Updating currentEntry moodSummary:', latestEntry.moodSummary);
        setCurrentEntry(latestEntry);
      }
    }
  }, [entries, currentEntry]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const entryData = {
        user_id: user.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        title: title.trim(),
        content: content.trim(),
      };

      if (currentEntry) {
        // Update existing entry
        const { data, error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', currentEntry.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating entry:', error);
          return;
        }

        if (data) {
          const updatedEntry = {
            ...data,
            date: new Date(data.date),
            moodSummary: data.mood_summary,
            mood: data.mood || 'neutral'
          };
          setEntries(prev => prev.map(entry =>
            entry.id === currentEntry.id ? updatedEntry : entry
          ));
          setCurrentEntry(updatedEntry);
        }
      } else {
        // Add new entry
        const { data, error } = await supabase
          .from('journal_entries')
          .insert([entryData])
          .select()
          .single();

        if (error) {
          console.error('Error creating entry:', error);
          return;
        }

        if (data) {
          const newEntry = {
            ...data,
            date: new Date(data.date),
            moodSummary: data.mood_summary,
            mood: data.mood || 'neutral'
          };
          setEntries(prev => [newEntry, ...prev]);
          setCurrentEntry(newEntry);
        }
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleMoodAnalysis = async () => {
    if (!content.trim()) {
      console.error('No content to analyze');
      return;
    }

    if (!currentEntry) {
      console.error('No current entry to analyze');
      return;
    }

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setIsGeneratingMood(true);

    try {
      const moodAnalysis = await analyzeMood(content);

      if (!moodAnalysis || !moodAnalysis.summary) {
        console.error('Invalid mood analysis result');
        return;
      }

      const moodData = {
        mood_summary: moodAnalysis.summary
        // mood: moodAnalysis.mood || 'neutral' // Commented out until schema is applied
      };

      const { data, error } = await supabase
        .from('journal_entries')
        .update(moodData)
        .eq('id', currentEntry.id)
        .eq('user_id', user.id) // Ensure we only update user's own entries
        .select()
        .single();

      if (error) {
        console.error('Database update failed:', error.message);
        return;
      }

      if (data) {
        const updatedEntry = {
          ...data,
          date: new Date(data.date),
          moodSummary: data.mood_summary,
          mood: moodAnalysis.mood || 'neutral' // Keep mood for UI display
        };
        console.log('Created updatedEntry with moodSummary:', updatedEntry.moodSummary);
        setEntries(prev => prev.map(entry =>
          entry.id === currentEntry.id ? updatedEntry : entry
        ));
        setCurrentEntry(updatedEntry);
      }
    } catch (error) {
      console.error('Mood analysis error:', error instanceof Error ? error.message : String(error));
    } finally {
      setIsGeneratingMood(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Loading your journal...</h2>
          <p className="text-gray-600">Preparing your personal space</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'peaceful': return '😌';
      case 'anxious': return '😰';
      case 'excited': return '🤩';
      case 'thoughtful': return '🤔';
      default: return '😐';
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-black rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">Personal Journal</h1>
                <p className="text-sm text-gray-600">Your space for reflection and growth</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-sm text-gray-900 placeholder:text-gray-400 w-64"
                />
              </div>

              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(selectedDate, 'MMM dd')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-xl rounded-xl" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-xl border-0"
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={() => setIsEditing(true)}
                className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>

              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg px-3 py-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Stats */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3 bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-black" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black mb-1">{entries.length}</div>
                  <div className="text-xs text-gray-600">entries written</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3 bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-black" />
                  Recent Entries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {filteredEntries.slice(0, 5).map(entry => {
                  const isValidDate = entry.date && entry.date instanceof Date && !isNaN(entry.date.getTime());
                  const formattedDate = isValidDate ? format(entry.date, 'MMM dd') : 'Invalid Date';
                  const isSelected = isValidDate && format(entry.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

                  return (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'border-black bg-gray-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                      onClick={() => isValidDate && setSelectedDate(entry.date)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          {formattedDate}
                        </span>
                        {entry.mood && (
                          <span className="text-sm">{getMoodIcon(entry.mood)}</span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {entry.title || 'Untitled'}
                      </div>
                    </div>
                  );
                })}
                {filteredEntries.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No entries yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-black">
                      {format(selectedDate, 'EEEE, MMMM do')}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentEntry ? 'Continue your reflection' : 'Start your daily journaling'}
                    </p>
                  </div>
                  {currentEntry?.moodSummary && currentEntry.moodSummary.trim() && (
                    <Badge className="bg-black text-white font-medium px-3 py-1 rounded-full shadow-sm">
                      <Brain className="h-3 w-3 mr-1" />
                      AI Analyzed
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* AI Mood Summary */}
                {currentEntry?.moodSummary && currentEntry.moodSummary.trim() && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-1.5 bg-black rounded-lg">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-black text-sm">AI Insights</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{currentEntry.moodSummary}</p>
                  </div>
                )}

                {/* Journal Editor */}
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Give your thoughts a title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-xl font-semibold border-0 bg-transparent outline-none placeholder-gray-400 focus:ring-0 text-black"
                    />
                    <Textarea
                      placeholder="What's on your mind today? Share your thoughts, feelings, and experiences..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[300px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none text-base leading-relaxed focus:border-black focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                    />
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleSave}
                          className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Entry
                        </Button>
                        <Button
                          onClick={handleMoodAnalysis}
                          disabled={!content.trim() || isGeneratingMood}
                          variant="outline"
                          className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                        >
                          {isGeneratingMood ? (
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4 mr-2" />
                          )}
                          {isGeneratingMood ? 'Analyzing...' : 'Get AI Insights'}
                        </Button>
                      </div>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg transition-all duration-200"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentEntry ? (
                      <>
                        <h2 className="text-xl font-semibold text-black">
                          {currentEntry.title}
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-base bg-gray-50 p-4 rounded-xl border border-gray-200">
                          {currentEntry.content}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setIsEditing(true)}
                              variant="outline"
                              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={handleMoodAnalysis}
                              disabled={!currentEntry.content.trim() || isGeneratingMood}
                              variant="outline"
                              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                              <Brain className="h-4 w-4 mr-2" />
                              Re-analyze
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg px-3 py-2"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-16">
                        <div className="relative mb-6">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <BookOpen className="h-8 w-8 text-black" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center shadow-sm">
                            <Plus className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-black mb-2">
                          Ready to reflect?
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                          Take a moment to document your thoughts and experiences for today. Your AI companion is here to help you gain insights.
                        </p>
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Start Writing
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}