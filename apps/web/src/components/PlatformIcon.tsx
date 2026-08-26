'use client';

import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaLinkedin,
  FaXTwitter,
  FaPinterest,
  FaReddit,
  FaMastodon,
  FaDiscord,
  FaSlack,
  FaGoogle,
  FaSnapchat,
} from 'react-icons/fa6';
import { FaBluesky } from 'react-icons/fa6';
import { FaThreads } from 'react-icons/fa6';
import { IconType } from 'react-icons/lib';

export type PlatformIconId = string;

export function getPlatformIcon(id: string): IconType | undefined {
  const map: Record<string, IconType> = {
    instagram: FaInstagram,
    facebook: FaFacebook,
    tiktok: FaTiktok,
    youtube: FaYoutube,
    linkedin: FaLinkedin,
    x: FaXTwitter,
    threads: FaThreads,
    pinterest: FaPinterest,
    reddit: FaReddit,
    bluesky: FaBluesky,
    mastodon: FaMastodon,
    discord: FaDiscord,
    slack: FaSlack,
    google_business: FaGoogle,
    snapchat: FaSnapchat,
  };
  return map[id];
}

interface PlatformIconProps {
  id: string;
  size?: number;
  color?: string;
  className?: string;
}

export function PlatformIcon({ id, size = 18, color, className }: PlatformIconProps) {
  const Icon = getPlatformIcon(id);
  if (!Icon) return <div className="w-2 h-2 rounded-full bg-brand-text/30" />;
  return <Icon size={size} color={color} className={className} />;
}
