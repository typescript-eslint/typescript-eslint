export interface SponsorData {
  description?: string;
  id: string;
  image: string;
  name: string;
  tier?: string;
  totalDonations: number;
  website?: string;
}

export interface SponsorIncludeOptions {
  link?: boolean;
  name?: boolean;
}
