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

// ---- Europe, India, Africa ----
const one = (tz) => ({ 'All regions': tz });
Object.assign(COUNTRIES, {
  // Europe
  Albania: one('Europe/Tirane'), Andorra: one('Europe/Andorra'), Austria: one('Europe/Vienna'), Belarus: one('Europe/Minsk'),
  Belgium: one('Europe/Brussels'), 'Bosnia and Herzegovina': one('Europe/Sarajevo'), Bulgaria: one('Europe/Sofia'), Croatia: one('Europe/Zagreb'),
  Cyprus: one('Asia/Nicosia'), 'Czech Republic': one('Europe/Prague'), Denmark: one('Europe/Copenhagen'), Estonia: one('Europe/Tallinn'),
  Finland: one('Europe/Helsinki'), France: one('Europe/Paris'), Germany: one('Europe/Berlin'), Greece: one('Europe/Athens'),
  Hungary: one('Europe/Budapest'), Iceland: one('Atlantic/Reykjavik'), Ireland: one('Europe/Dublin'), Italy: one('Europe/Rome'),
  Kosovo: one('Europe/Belgrade'), Latvia: one('Europe/Riga'), Liechtenstein: one('Europe/Vaduz'), Lithuania: one('Europe/Vilnius'),
  Luxembourg: one('Europe/Luxembourg'), Malta: one('Europe/Malta'), Moldova: one('Europe/Chisinau'), Monaco: one('Europe/Monaco'),
  Montenegro: one('Europe/Podgorica'), Netherlands: one('Europe/Amsterdam'), 'North Macedonia': one('Europe/Skopje'), Norway: one('Europe/Oslo'),
  Poland: one('Europe/Warsaw'), Portugal: { Mainland: 'Europe/Lisbon', Madeira: 'Atlantic/Madeira', Azores: 'Atlantic/Azores' },
  Romania: one('Europe/Bucharest'),
  Russia: { Kaliningrad: 'Europe/Kaliningrad', 'Moscow / Saint Petersburg': 'Europe/Moscow', Samara: 'Europe/Samara', Yekaterinburg: 'Asia/Yekaterinburg', Novosibirsk: 'Asia/Novosibirsk', Vladivostok: 'Asia/Vladivostok' },
  'San Marino': one('Europe/San_Marino'), Serbia: one('Europe/Belgrade'), Slovakia: one('Europe/Bratislava'), Slovenia: one('Europe/Ljubljana'),
  Spain: { Mainland: 'Europe/Madrid', 'Canary Islands': 'Atlantic/Canary' }, Sweden: one('Europe/Stockholm'), Switzerland: one('Europe/Zurich'),
  Turkey: one('Europe/Istanbul'), Ukraine: one('Europe/Kiev'), 'Vatican City': one('Europe/Vatican'),

  // India
  India: Object.fromEntries([
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
    'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
  ].map((s) => [s, 'Asia/Kolkata'])),

  // North Africa
  Algeria: one('Africa/Algiers'), Egypt: one('Africa/Cairo'), Libya: one('Africa/Tripoli'), Morocco: one('Africa/Casablanca'),
  Tunisia: one('Africa/Tunis'), Sudan: one('Africa/Khartoum'), 'South Sudan': one('Africa/Juba'), Mauritania: one('Africa/Nouakchott'),
  'Western Sahara': one('Africa/El_Aaiun'),

  // South / Southern Africa
  'South Africa': Object.fromEntries(['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'].map((s) => [s, 'Africa/Johannesburg'])),
  Namibia: one('Africa/Windhoek'), Botswana: one('Africa/Gaborone'), Zimbabwe: one('Africa/Harare'), Zambia: one('Africa/Lusaka'),
  Mozambique: one('Africa/Maputo'), Lesotho: one('Africa/Maseru'), Eswatini: one('Africa/Mbabane'), Malawi: one('Africa/Blantyre'),
  Angola: one('Africa/Luanda'), Madagascar: one('Indian/Antananarivo'), Mauritius: one('Indian/Mauritius'),
});