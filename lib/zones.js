const US = {
  Alabama: 'America/Chicago', Alaska: 'America/Anchorage', Arizona: 'America/Phoenix', Arkansas: 'America/Chicago', California: 'America/Los_Angeles',
  Colorado: 'America/Denver', Connecticut: 'America/New_York', Delaware: 'America/New_York', 'District of Columbia': 'America/New_York', Florida: 'America/New_York',
  Georgia: 'America/New_York', Hawaii: 'Pacific/Honolulu', Idaho: 'America/Denver', Illinois: 'America/Chicago', Indiana: 'America/Indiana/Indianapolis',
  Iowa: 'America/Chicago', Kansas: 'America/Chicago', Kentucky: 'America/New_York', Louisiana: 'America/Chicago', Maine: 'America/New_York',
  Maryland: 'America/New_York', Massachusetts: 'America/New_York', Michigan: 'America/Detroit', Minnesota: 'America/Chicago', Mississippi: 'America/Chicago',
  Missouri: 'America/Chicago', Montana: 'America/Denver', Nebraska: 'America/Chicago', Nevada: 'America/Los_Angeles', 'New Hampshire': 'America/New_York',
  'New Jersey': 'America/New_York', 'New Mexico': 'America/Denver', 'New York': 'America/New_York', 'North Carolina': 'America/New_York', 'North Dakota': 'America/Chicago',
  Ohio: 'America/New_York', Oklahoma: 'America/Chicago', Oregon: 'America/Los_Angeles', Pennsylvania: 'America/New_York', 'Rhode Island': 'America/New_York',
  'South Carolina': 'America/New_York', 'South Dakota': 'America/Chicago', Tennessee: 'America/Chicago', Texas: 'America/Chicago', Utah: 'America/Denver',
  Vermont: 'America/New_York', Virginia: 'America/New_York', Washington: 'America/Los_Angeles', 'West Virginia': 'America/New_York', Wisconsin: 'America/Chicago', Wyoming: 'America/Denver',
};
// country -> { state/region: IANA timezone }. Multi-timezone states use their main timezone.
export const COUNTRIES = {
  'United States': US,
  'United Kingdom': { England: 'Europe/London', Scotland: 'Europe/London', Wales: 'Europe/London', 'Northern Ireland': 'Europe/London' },
  Australia: {
    'New South Wales': 'Australia/Sydney', Victoria: 'Australia/Melbourne', Queensland: 'Australia/Brisbane', 'Western Australia': 'Australia/Perth',
    'South Australia': 'Australia/Adelaide', Tasmania: 'Australia/Hobart', 'Australian Capital Territory': 'Australia/Sydney', 'Northern Territory': 'Australia/Darwin',
  },
  Qatar: { Doha: 'Asia/Qatar', 'Al Rayyan': 'Asia/Qatar', 'Al Wakrah': 'Asia/Qatar', Other: 'Asia/Qatar' },
  Pakistan: { Punjab: 'Asia/Karachi', Sindh: 'Asia/Karachi', 'Khyber Pakhtunkhwa': 'Asia/Karachi', Balochistan: 'Asia/Karachi', Islamabad: 'Asia/Karachi', 'Azad Kashmir': 'Asia/Karachi', 'Gilgit-Baltistan': 'Asia/Karachi' },
  Canada: { Ontario: 'America/Toronto', Quebec: 'America/Toronto', 'British Columbia': 'America/Vancouver', Alberta: 'America/Edmonton' },
  'United Arab Emirates': { Dubai: 'Asia/Dubai', 'Abu Dhabi': 'Asia/Dubai', Sharjah: 'Asia/Dubai' },
  'Saudi Arabia': { Riyadh: 'Asia/Riyadh', Makkah: 'Asia/Riyadh', Madinah: 'Asia/Riyadh' },
};
