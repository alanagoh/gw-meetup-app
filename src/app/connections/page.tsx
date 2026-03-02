"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TAG_COLORS } from "@/lib/constants";
import BottomNav from "@/components/BottomNav";

interface ConnectedProfile {
  id: string;
  name: string;
  role: string;
  claude_title: string | null;
  photo_url: string | null;
  primary_tag: string | null;
  tags: string[];
  linkedin_url: string | null;
  share_email: boolean;
  email?: string;
}

interface ConnectionEntry {
  id: string;
  connected_at: string;
  other: ConnectedProfile;
}

function Avatar({ name, photo_url, primary_tag, size = 52 }: {
  name: string;
  photo_url: string | null;
  primary_tag: string | null;
  size?: number;
}) {
  const color = primary_tag ? TAG_COLORS[primary_tag] : null;
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (photo_url) {
    return (
      <img
        src={photo_url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-mono font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: color ? `${color.bg}30` : "var(--bg-elevated)",
        color: color ? color.bg : "var(--text-secondary)",
        border: `1.5px solid ${color ? color.bg : "var(--border-subtle)"}`,
        fontSize: size * 0.3,
      }}
    >
      {initials}
    </div>
  );
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ConnectionCard({ entry }: { entry: ConnectionEntry }) {
  const { other, connected_at } = entry;
  const color = other.primary_tag ? TAG_COLORS[other.primary_tag] : null;
  const topTags = other.tags.slice(0, 3);


  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Top row: avatar + info */}
      <div className="flex items-start gap-3">
        <Link href={`/profile/${other.id}`}>
          <Avatar name={other.name} photo_url={other.photo_url} primary_tag={other.primary_tag} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${other.id}`} className="hover:opacity-80">
            <p className="font-semibold text-sm truncate">{other.name}</p>
          </Link>
          <p className="text-text-secondary text-xs truncate">{other.role}</p>
          {other.claude_title && (
            <p className="font-mono text-xs truncate mt-0.5" style={{ color: "var(--accent-primary)" }}>
              {other.claude_title}
            </p>
          )}
        </div>
        <span className="text-[10px] text-text-secondary shrink-0 mt-0.5">
          {formatTimeAgo(connected_at)}
        </span>
      </div>

      {/* Tags */}
      {topTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topTags.map((tag) => {
            const tc = TAG_COLORS[tag];
            return (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: tc ? `${tc.bg}20` : "var(--bg-elevated)",
                  color: tc ? tc.bg : "var(--text-secondary)",
                  border: `1px solid ${tc ? `${tc.bg}40` : "var(--border-subtle)"}`,
                }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Contact links */}
      {(other.linkedin_url || other.email) && (
        <div className="flex gap-2 pt-0.5">
          {other.linkedin_url && (
            <a
              href={other.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition-opacity hover:opacity-80"
              style={{ background: "#0A66C220", color: "#0A66C2", border: "1px solid #0A66C240" }}
            >
              <span>in</span>
              <span>LinkedIn</span>
            </a>
          )}
          {other.email && (
            <a
              href={`mailto:${other.email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition-opacity hover:opacity-80"
              style={{
                background: color ? `${color.bg}20` : "var(--bg-elevated)",
                color: color ? color.bg : "var(--text-secondary)",
                border: `1px solid ${color ? `${color.bg}40` : "var(--border-subtle)"}`,
              }}
            >
              <span>✉</span>
              <span>{other.email}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<ConnectionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return; }
    });
  }, [router]);

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((data) => {
        setConnections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: "var(--bg-primary)" }}>
        <h1 className="font-mono text-xl font-bold">
          <span style={{ color: "var(--accent-primary)" }}>🤝</span> Matched
        </h1>
        {!loading && connections.length > 0 && (
          <p className="text-text-secondary text-xs mt-1 font-mono">
            {connections.length} match{connections.length !== 1 ? "es" : ""}
          </p>
        )}
      </div>

      <div className="px-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
            />
          </div>
        )}

        {!loading && connections.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <p className="text-4xl">🤝</p>
            <p className="font-mono font-bold">No matches yet</p>
            <p className="text-text-secondary text-sm max-w-[260px]">
              When you and someone wave at each other, you&apos;ll match here.
            </p>
            <Link
              href="/discover"
              className="text-sm px-4 py-2 rounded-xl font-medium mt-1"
              style={{ background: "var(--accent-primary)", color: "white" }}
            >
              Go to Discover
            </Link>
          </div>
        )}

        {!loading && connections.map((entry) => (
          <ConnectionCard key={entry.id} entry={entry} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
