export interface StateDistrictMap {
  state: string;
  isUT?: boolean;
  districts: string[];
}

export const INDIA_STATES_AND_DISTRICTS: StateDistrictMap[] = [
  {
    state: 'Andhra Pradesh',
    districts: [
      'Alluri Sitharama Raju',
      'Anakapalli',
      'Anantapur',
      'Annamayya',
      'Bapatla',
      'Chittoor',
      'East Godavari (Rajahmundry)',
      'Eluru',
      'Guntur',
      'Kakinada',
      'Konaseema (Amalapuram)',
      'Krishna (Machilipatnam)',
      'Kurnool',
      'Nandyal',
      'NTR (Vijayawada)',
      'Palnadu (Narasaraopet)',
      'Prakasam (Ongole)',
      'Sri Potti Sriramulu Nellore',
      'Sri Sathya Sai (Puttaparthi)',
      'Srikakulam',
      'Tirupati',
      'Visakhapatnam',
      'Vizianagaram',
      'West Godavari (Bhimavaram)',
      'YSR Kadapa'
    ]
  },
  {
    state: 'Arunachal Pradesh',
    districts: [
      'Anjaw',
      'Changlang',
      'Dibang Valley',
      'East Kameng',
      'East Siang (Pasighat)',
      'Itanagar Capital Complex',
      'Kamle',
      'Kra Daadi',
      'Kurung Kumey',
      'Lepa Rada',
      'Lohit (Tezu)',
      'Longding',
      'Lower Dibang Valley',
      'Lower Siang',
      'Lower Subansiri (Ziro)',
      'Namsai',
      'Pakke Kessang',
      'Papum Pare (Yupia)',
      'Shi Yomi',
      'Siang',
      'Tawang',
      'Tirap (Khonsa)',
      'Upper Siang',
      'Upper Subansiri',
      'West Kameng (Bomdila)',
      'West Siang (Aalo)'
    ]
  },
  {
    state: 'Assam',
    districts: [
      'Baksa',
      'Bajali',
      'Barpeta',
      'Biswanath',
      'Bongaigaon',
      'Cachar (Silchar)',
      'Charaideo',
      'Chirang',
      'Darrang (Mangaldai)',
      'Dhemaji',
      'Dhubri',
      'Dibrugarh',
      'Dima Hasao (Haflong)',
      'Goalpara',
      'Golaghat',
      'Hailakandi',
      'Hojai',
      'Jorhat',
      'Kamrup (Amingaon)',
      'Kamrup Metropolitan (Guwahati)',
      'Karbi Anglong (Diphu)',
      'Karimganj',
      'Kokrajhar',
      'Lakhimpur (North Lakhimpur)',
      'Majuli',
      'Morigaon',
      'Nagaon',
      'Nalbari',
      'Sivasagar',
      'Sonitpur (Tezpur)',
      'South Salmara-Mankachar',
      'Tamulpur',
      'Tinsukia',
      'Udalguri',
      'West Karbi Anglong'
    ]
  },
  {
    state: 'Bihar',
    districts: [
      'Araria',
      'Arwal',
      'Aurangabad',
      'Banka',
      'Begusarai',
      'Bhagalpur',
      'Bhojpur (Arrah)',
      'Buxar',
      'Darbhanga',
      'East Champaran (Motihari)',
      'Gaya',
      'Gopalganj',
      'Jamui',
      'Jehanabad',
      'Kaimur (Bhabua)',
      'Katihar',
      'Khagaria',
      'Kishanganj',
      'Lakhisarai',
      'Madhepura',
      'Madhubani',
      'Munger',
      'Muzaffarpur',
      'Nalanda (Bihar Sharif)',
      'Nawada',
      'Patna',
      'Purnia',
      'Rohtas (Sasaram)',
      'Saharsa',
      'Samastipur',
      'Saran (Chhapra)',
      'Sheikhpura',
      'Sheohar',
      'Sitamarhi',
      'Siwan',
      'Supaul',
      'Vaishali (Hajipur)',
      'West Champaran (Bettiah)'
    ]
  },
  {
    state: 'Chhattisgarh',
    districts: [
      'Balod',
      'Baloda Bazar',
      'Balrampur',
      'Bastar (Jagdalpur)',
      'Bemetara',
      'Bijapur',
      'Bilaspur',
      'Dantewada',
      'Dhamtari',
      'Durg',
      'Gariaband',
      'Gaurela-Pendra-Marwahi',
      'Janjgir-Champa',
      'Jashpur',
      'Kabirdham (Kawardha)',
      'Kanker',
      'Khairagarh-Chhuikhadan-Gandai',
      'Kondagaon',
      'Korba',
      'Koriya',
      'Mahasamund',
      'Manendragarh-Chirmiri-Bharatpur',
      'Mohla-Manpur-Ambagarh Chowki',
      'Mungeli',
      'Narayanpur',
      'Raigarh',
      'Raipur',
      'Rajnandgaon',
      'Sarangarh-Bilaigarh',
      'Sakti',
      'Sukma',
      'Surajpur',
      'Surguja (Ambikapur)'
    ]
  },
  {
    state: 'Goa',
    districts: ['North Goa (Panaji)', 'South Goa (Margao)']
  },
  {
    state: 'Gujarat',
    districts: [
      'Ahmedabad',
      'Amreli',
      'Anand',
      'Aravalli (Modasa)',
      'Banaskantha (Palanpur)',
      'Bharuch',
      'Bhavnagar',
      'Botad',
      'Chhota Udaipur',
      'Dahod',
      'Dang (Ahwa)',
      'Devbhoomi Dwarka (Khambhalia)',
      'Gandhinagar',
      'Gir Somnath (Veraval)',
      'Jamnagar',
      'Junagadh',
      'Kheda (Nadiad)',
      'Kutch (Bhuj)',
      'Mahisagar (Lunawada)',
      'Mehsana',
      'Morbi',
      'Narmada (Rajpipla)',
      'Navsari',
      'Panchmahal (Godhra)',
      'Patan',
      'Porbandar',
      'Rajkot',
      'Sabarkantha (Himmatnagar)',
      'Surat',
      'Surendranagar',
      'Tapi (Vyara)',
      'Vadodara',
      'Valsad'
    ]
  },
  {
    state: 'Haryana',
    districts: [
      'Ambala',
      'Bhiwani',
      'Charkhi Dadri',
      'Faridabad',
      'Fatehabad',
      'Gurugram',
      'Hisar',
      'Jhajjar',
      'Jind',
      'Kaithal',
      'Karnal',
      'Kurukshetra',
      'Mahendragarh (Narnaul)',
      'Nuh (Mewat)',
      'Palwal',
      'Panchkula',
      'Panipat',
      'Rewari',
      'Rohtak',
      'Sirsa',
      'Sonipat',
      'Yamunanagar'
    ]
  },
  {
    state: 'Himachal Pradesh',
    districts: [
      'Bilaspur',
      'Chamba',
      'Hamirpur',
      'Kangra (Dharamshala)',
      'Kinnaur (Reckong Peo)',
      'Kullu',
      'Lahaul and Spiti (Keylong)',
      'Mandi',
      'Shimla',
      'Sirmaur (Nahan)',
      'Solan',
      'Una'
    ]
  },
  {
    state: 'Jharkhand',
    districts: [
      'Bokaro',
      'Chatra',
      'Deoghar',
      'Dhanbad',
      'Dumka',
      'East Singhbhum (Jamshedpur)',
      'Garhwa',
      'Giridih',
      'Godda',
      'Gumla',
      'Hazaribagh',
      'Jamtara',
      'Khunti',
      'Koderma',
      'Latehar',
      'Lohardaga',
      'Pakur',
      'Palamu (Medininagar)',
      'Ramgarh',
      'Ranchi',
      'Sahebganj',
      'Seraikela Kharsawan',
      'Simdega',
      'West Singhbhum (Chaibasa)'
    ]
  },
  {
    state: 'Karnataka',
    districts: [
      'Bagalkot',
      'Ballari (Bellary)',
      'Belagavi (Belgaum)',
      'Bengaluru Rural',
      'Bengaluru Urban',
      'Bidar',
      'Chamarajanagar',
      'Chikkaballapur',
      'Chikkamagaluru',
      'Chitradurga',
      'Dakshina Kannada (Mangaluru)',
      'Davanagere',
      'Dharwad (Hubballi)',
      'Gadag',
      'Hassan',
      'Haveri',
      'Kalaburagi (Gulbarga)',
      'Kodagu (Madikeri)',
      'Kolar',
      'Koppal',
      'Mandya',
      'Mysuru (Mysore)',
      'Raichur',
      'Ramanagara',
      'Shivamogga (Shimoga)',
      'Tumakuru (Tumkur)',
      'Udupi',
      'Uttara Kannada (Karwar)',
      'Vijayanagara (Hosapete)',
      'Vijayapura (Bijapur)',
      'Yadgir'
    ]
  },
  {
    state: 'Kerala',
    districts: [
      'Alappuzha',
      'Ernakulam (Kochi)',
      'Idukki (Painavu)',
      'Kannur',
      'Kasaragod',
      'Kollam',
      'Kottayam',
      'Kozhikode (Calicut)',
      'Malappuram',
      'Palakkad',
      'Pathanamthitta',
      'Thiruvananthapuram (Trivandrum)',
      'Thrissur',
      'Wayanad (Kalpetta)'
    ]
  },
  {
    state: 'Madhya Pradesh',
    districts: [
      'Agar Malwa',
      'Alirajpur',
      'Anuppur',
      'Ashoknagar',
      'Balaghat',
      'Barwani',
      'Betul',
      'Bhind',
      'Bhopal',
      'Burhanpur',
      'Chhatarpur',
      'Chhindwara',
      'Damoh',
      'Datia',
      'Dewas',
      'Dhar',
      'Dindori',
      'Guna',
      'Gwalior',
      'Harda',
      'Hoshangabad (Narmadapuram)',
      'Indore',
      'Jabalpur',
      'Jhabua',
      'Katni',
      'Khandwa',
      'Khargone (West Nimar)',
      'Maihar',
      'Mandla',
      'Mandsaur',
      'Mauganj',
      'Morena',
      'Narsinghpur',
      'Neemuch',
      'Niwari',
      'Pandhurna',
      'Panna',
      'Raisen',
      'Rajgarh',
      'Ratlam',
      'Rewa',
      'Sagar',
      'Satna',
      'Sehore',
      'Seoni',
      'Shahdol',
      'Shajapur',
      'Sheopur',
      'Shivpuri',
      'Sidhi',
      'Singrauli',
      'Tikamgarh',
      'Ujjain',
      'Umaria',
      'Vidisha'
    ]
  },
  {
    state: 'Maharashtra',
    districts: [
      'Ahmednagar (Ahilyanagar)',
      'Akola',
      'Amravati',
      'Beed',
      'Bhandara',
      'Buldhana',
      'Chandrapur',
      'Chhatrapati Sambhajinagar (Aurangabad)',
      'Dharashiv (Osmanabad)',
      'Dhule',
      'Gadchiroli',
      'Gondia',
      'Hingoli',
      'Jalgaon',
      'Jalna',
      'Kolhapur',
      'Latur',
      'Mumbai City',
      'Mumbai Suburban',
      'Nagpur',
      'Nanded',
      'Nandurbar',
      'Nashik',
      'Palghar',
      'Parbhani',
      'Pune',
      'Raigad (Alibag)',
      'Ratnagiri',
      'Sangli',
      'Satara',
      'Sindhudurg (Oros)',
      'Solapur',
      'Thane',
      'Wardha',
      'Washim',
      'Yavatmal'
    ]
  },
  {
    state: 'Manipur',
    districts: [
      'Bishnupur',
      'Chandel',
      'Churachandpur',
      'Imphal East',
      'Imphal West',
      'Jiribam',
      'Kakching',
      'Kamjong',
      'Kangpokpi',
      'Noney',
      'Pherzawl',
      'Senapati',
      'Tamenglong',
      'Tengnoupal',
      'Thoubal',
      'Ukhrul'
    ]
  },
  {
    state: 'Meghalaya',
    districts: [
      'East Garo Hills (Williamnagar)',
      'East Jaintia Hills (Khliehriat)',
      'East Khasi Hills (Shillong)',
      'Eastern West Khasi Hills (Mairang)',
      'North Garo Hills (Resubelpara)',
      'Ri Bhoi (Nongpoh)',
      'South Garo Hills (Baghmara)',
      'South West Garo Hills (Ampati)',
      'South West Khasi Hills (Mawkyrwat)',
      'West Garo Hills (Tura)',
      'West Jaintia Hills (Jowai)',
      'West Khasi Hills (Nongstoin)'
    ]
  },
  {
    state: 'Mizoram',
    districts: [
      'Aizawl',
      'Champhai',
      'Hnahthial',
      'Khawzawl',
      'Kolasib',
      'Lawngtlai',
      'Lunglei',
      'Mamit',
      'Saiha (Siaha)',
      'Saitual',
      'Serchhip'
    ]
  },
  {
    state: 'Nagaland',
    districts: [
      'Chümoukedima',
      'Dimapur',
      'Kiphire',
      'Kohima',
      'Longleng',
      'Mokokchung',
      'Mon',
      'Niuland',
      'Noklak',
      'Peren',
      'Phek',
      'Shamator',
      'Tseminyü',
      'Tuensang',
      'Wokha',
      'Zunheboto'
    ]
  },
  {
    state: 'Odisha',
    districts: [
      'Angul',
      'Balangir',
      'Balasore (Baleswar)',
      'Bargarh',
      'Bhadrak',
      'Boudh',
      'Cuttack',
      'Deogarh (Debagarh)',
      'Dhenkanal',
      'Gajapati (Paralakhemundi)',
      'Ganjam (Chhatrapur)',
      'Jagatsinghpur',
      'Jajpur',
      'Jharsuguda',
      'Kalahandi (Bhawanipatna)',
      'Kandhamal (Phulbani)',
      'Kendrapara',
      'Kendujhar (Keonjhar)',
      'Khordha (Bhubaneswar)',
      'Koraput',
      'Malkangiri',
      'Mayurbhanj (Baripada)',
      'Nabarangpur',
      'Nayagarh',
      'Nuapada',
      'Puri',
      'Rayagada',
      'Sambalpur',
      'Subarnapur (Sonepur)',
      'Sundargarh'
    ]
  },
  {
    state: 'Punjab',
    districts: [
      'Amritsar',
      'Barnala',
      'Bathinda',
      'Faridkot',
      'Fatehgarh Sahib',
      'Fazilka',
      'Ferozepur',
      'Gurdaspur',
      'Hoshiarpur',
      'Jalandhar',
      'Kapurthala',
      'Ludhiana',
      'Malerkotla',
      'Mansa',
      'Moga',
      'Pathankot',
      'Patiala',
      'Rupnagar (Ropar)',
      'Sahibzada Ajit Singh Nagar (Mohali)',
      'Sangrur',
      'Shahid Bhagat Singh Nagar (Nawanshahr)',
      'Sri Muktsar Sahib',
      'Tarn Taran'
    ]
  },
  {
    state: 'Rajasthan',
    districts: [
      'Ajmer',
      'Alwar',
      'Anupgarh',
      'Balotra',
      'Banswara',
      'Baran',
      'Barmer',
      'Beawar',
      'Bharatpur',
      'Bhilwara',
      'Bikaner',
      'Bundi',
      'Chittorgarh',
      'Churu',
      'Dausa',
      'Deeg',
      'Dholpur',
      'Didwana-Kuchaman',
      'Dudu',
      'Dungarpur',
      'Ganganagar (Sri Ganganagar)',
      'Gangapur City',
      'Hanumangarh',
      'Jaipur (City)',
      'Jaipur Rural',
      'Jaisalmer',
      'Jalore',
      'Jhalawar',
      'Jhunjhunu',
      'Jodhpur (City)',
      'Jodhpur Rural',
      'Kekri',
      'Khairthal-Tijara',
      'Kota',
      'Kotputli-Behror',
      'Nagaur',
      'Neem Ka Thana',
      'Pali',
      'Phalodi',
      'Pratapgarh',
      'Rajsamand',
      'Salumber',
      'Sanchore',
      'Sawai Madhopur',
      'Shahpura',
      'Sikar',
      'Sirohi',
      'Tonk',
      'Udaipur'
    ]
  },
  {
    state: 'Sikkim',
    districts: [
      'Gangtok (East Sikkim)',
      'Gyalshing (West Sikkim)',
      'Mangan (North Sikkim)',
      'Namchi (South Sikkim)',
      'Pakyong',
      'Soreng'
    ]
  },
  {
    state: 'Tamil Nadu',
    districts: [
      'Ariyalur',
      'Chengalpattu',
      'Chennai',
      'Coimbatore',
      'Cuddalore',
      'Dharmapuri',
      'Dindigul',
      'Erode',
      'Kallakurichi',
      'Kanchipuram',
      'Kanyakumari (Nagercoil)',
      'Karur',
      'Krishnagiri',
      'Madurai',
      'Mayiladuthurai',
      'Nagapattinam',
      'Namakkal',
      'Nilgiris (Ooty)',
      'Perambalur',
      'Pudukkottai',
      'Ramanathapuram',
      'Ranipet',
      'Salem',
      'Sivaganga',
      'Tenkasi',
      'Thanjavur',
      'Theni',
      'Thoothukudi (Tuticorin)',
      'Tiruchirappalli (Trichy)',
      'Tirunelveli',
      'Tirupathur',
      'Tiruppur',
      'Tiruvallur',
      'Tiruvannamalai',
      'Tiruvarur',
      'Vellore',
      'Viluppuram',
      'Virudhunagar'
    ]
  },
  {
    state: 'Telangana',
    districts: [
      'Adilabad',
      'Bhadradri Kothagudem',
      'Hanumakonda',
      'Hyderabad',
      'Jagtial',
      'Jangaon',
      'Jayashankar Bhupalpally',
      'Jogulamba Gadwal',
      'Kamareddy',
      'Karimnagar',
      'Khammam',
      'Kumuram Bheem Asifabad',
      'Mahabubabad',
      'Mahabubnagar',
      'Mancherial',
      'Medak',
      'Medchal-Malkajgiri',
      'Mulugu',
      'Nagarkurnool',
      'Nalgonda',
      'Narayanpet',
      'Nirmal',
      'Nizamabad',
      'Peddapalli',
      'Rajanna Sircilla',
      'Ranga Reddy',
      'Sangareddy',
      'Siddipet',
      'Suryapet',
      'Vikarabad',
      'Wanaparthy',
      'Warangal',
      'Yadadri Bhuvanagiri'
    ]
  },
  {
    state: 'Tripura',
    districts: [
      'Dhalai (Ambassa)',
      'Gomati (Udaipur)',
      'Khowai',
      'North Tripura (Dharmanagar)',
      'Sepahijala (Bishramganj)',
      'South Tripura (Belonia)',
      'Unakoti (Kailashahar)',
      'West Tripura (Agartala)'
    ]
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      'Agra',
      'Aligarh',
      'Ambedkar Nagar',
      'Amethi',
      'Amroha',
      'Auraiya',
      'Ayodhya (Faizabad)',
      'Azamgarh',
      'Baghpat',
      'Bahraich',
      'Ballia',
      'Balrampur',
      'Banda',
      'Barabanki',
      'Bareilly',
      'Basti',
      'Bhadohi (Sant Ravidas Nagar)',
      'Bijnor',
      'Budaun',
      'Bulandshahr',
      'Chandauli',
      'Chitrakoot',
      'Deoria',
      'Etah',
      'Etawah',
      'Farrukhabad',
      'Fatehpur',
      'Firozabad',
      'Gautam Buddha Nagar (Noida/Gr. Noida)',
      'Ghaziabad',
      'Ghazipur',
      'Gonda',
      'Gorakhpur',
      'Hamirpur',
      'Hapur',
      'Hardoi',
      'Hathras',
      'Jalaun (Orai)',
      'Jaunpur',
      'Jhansi',
      'Kannauj',
      'Kanpur Dehat',
      'Kanpur Nagar',
      'Kasganj',
      'Kaushambi',
      'Kushinagar',
      'Lakhimpur Kheri',
      'Lalitpur',
      'Lucknow',
      'Maharajganj',
      'Mahoba',
      'Mainpuri',
      'Mathura',
      'Mau',
      'Meerut',
      'Mirzapur',
      'Moradabad',
      'Muzaffarnagar',
      'Pilibhit',
      'Pratapgarh',
      'Prayagraj (Allahabad)',
      'Raebareli',
      'Rampur',
      'Saharanpur',
      'Sambhal',
      'Sant Kabir Nagar (Khalilabad)',
      'Shahjahanpur',
      'Shamli',
      'Shravasti',
      'Siddharthnagar (Naugarh)',
      'Sitapur',
      'Sonbhadra (Robertsganj)',
      'Sultanpur',
      'Unnao',
      'Varanasi (Kashi)'
    ]
  },
  {
    state: 'Uttarakhand',
    districts: [
      'Almora',
      'Bageshwar',
      'Chamoli (Gopeshwar)',
      'Champawat',
      'Dehradun',
      'Haridwar',
      'Nainital',
      'Pauri Garhwal',
      'Pithoragarh',
      'Rudraprayag',
      'Tehri Garhwal (New Tehri)',
      'Udham Singh Nagar (Rudrapur)',
      'Uttarkashi'
    ]
  },
  {
    state: 'West Bengal',
    districts: [
      'Alipurduar',
      'Bankura',
      'Birbhum (Suri)',
      'Cooch Behar',
      'Dakshin Dinajpur (Balurghat)',
      'Darjeeling',
      'Hooghly (Chinsurah)',
      'Howrah',
      'Jalpaiguri',
      'Jhargram',
      'Kalimpong',
      'Kolkata',
      'Malda (English Bazar)',
      'Murshidabad (Baharampur)',
      'Nadia (Krishnanagar)',
      'North 24 Parganas (Barasat)',
      'Paschim Bardhaman (Asansol)',
      'Paschim Medinipur (Midnapore)',
      'Purba Bardhaman (Bardhaman)',
      'Purba Medinipur (Tamluk)',
      'Purulia',
      'South 24 Parganas (Alipore)',
      'Uttar Dinajpur (Raiganj)'
    ]
  },

  // Union Territories
  {
    state: 'Delhi (NCT)',
    isUT: true,
    districts: [
      'Central Delhi',
      'East Delhi',
      'New Delhi (Connaught Place / Central)',
      'North Delhi',
      'North East Delhi',
      'North West Delhi',
      'Shahdara',
      'South Delhi',
      'South East Delhi',
      'South West Delhi',
      'West Delhi'
    ]
  },
  {
    state: 'Jammu & Kashmir',
    isUT: true,
    districts: [
      'Anantnag',
      'Bandipora',
      'Baramulla',
      'Budgam',
      'Doda',
      'Ganderbal',
      'Jammu',
      'Kathua',
      'Kishtwar',
      'Kulgam',
      'Kupwara',
      'Poonch',
      'Pulwama',
      'Rajouri',
      'Ramban',
      'Reasi',
      'Samba',
      'Shopian',
      'Srinagar',
      'Udhampur'
    ]
  },
  {
    state: 'Ladakh',
    isUT: true,
    districts: ['Kargil', 'Leh']
  },
  {
    state: 'Chandigarh',
    isUT: true,
    districts: ['Chandigarh']
  },
  {
    state: 'Puducherry',
    isUT: true,
    districts: ['Karaikal', 'Mahe', 'Puducherry (Pondicherry)', 'Yanam']
  },
  {
    state: 'Andaman & Nicobar Islands',
    isUT: true,
    districts: ['Nicobar', 'North and Middle Andaman', 'South Andaman (Port Blair)']
  },
  {
    state: 'Dadra & Nagar Haveli and Daman & Diu',
    isUT: true,
    districts: ['Dadra and Nagar Haveli (Silvassa)', 'Daman', 'Diu']
  },
  {
    state: 'Lakshadweep',
    isUT: true,
    districts: ['Lakshadweep (Kavaratti)']
  }
];

export const ALL_INDIAN_STATES = INDIA_STATES_AND_DISTRICTS.map((item) => item.state);

export const getDistrictsForState = (stateName: string): string[] => {
  if (!stateName) return [];
  const normalized = stateName.toLowerCase().trim();
  const match = INDIA_STATES_AND_DISTRICTS.find(
    (item) => item.state.toLowerCase() === normalized ||
      item.state.toLowerCase().includes(normalized) ||
      normalized.includes(item.state.toLowerCase())
  );
  return match ? match.districts : [];
};

export const guessStateFromPincode = (pincode: string): { state: string; defaultDistrict: string } => {
  const pin = pincode.replace(/[^0-9]/g, '');
  if (pin.length < 2) {
    return { state: 'Uttar Pradesh', defaultDistrict: 'Prayagraj (Allahabad)' };
  }

  const prefix2 = pin.slice(0, 2);
  switch (prefix2) {
    case '11':
      return { state: 'Delhi (NCT)', defaultDistrict: 'New Delhi (Connaught Place / Central)' };
    case '12':
    case '13':
      return { state: 'Haryana', defaultDistrict: 'Gurugram' };
    case '14':
    case '15':
      return { state: 'Punjab', defaultDistrict: 'Ludhiana' };
    case '16':
      return { state: 'Chandigarh', defaultDistrict: 'Chandigarh' };
    case '17':
      return { state: 'Himachal Pradesh', defaultDistrict: 'Shimla' };
    case '18':
    case '19':
      return { state: 'Jammu & Kashmir', defaultDistrict: 'Jammu' };
    case '20':
    case '21':
      return { state: 'Uttar Pradesh', defaultDistrict: 'Prayagraj (Allahabad)' };
    case '22':
    case '23':
    case '24':
    case '25':
    case '26':
    case '27':
    case '28':
      return { state: 'Uttar Pradesh', defaultDistrict: 'Lucknow' };
    case '30':
    case '31':
    case '32':
    case '33':
    case '34':
      return { state: 'Rajasthan', defaultDistrict: 'Jaipur (City)' };
    case '36':
    case '37':
    case '38':
    case '39':
      return { state: 'Gujarat', defaultDistrict: 'Ahmedabad' };
    case '40':
    case '41':
    case '42':
    case '43':
    case '44':
      return { state: 'Maharashtra', defaultDistrict: 'Pune' };
    case '45':
    case '46':
    case '47':
    case '48':
      return { state: 'Madhya Pradesh', defaultDistrict: 'Bhopal' };
    case '49':
      return { state: 'Chhattisgarh', defaultDistrict: 'Raipur' };
    case '50':
    case '51':
    case '52':
    case '53':
      return { state: 'Andhra Pradesh', defaultDistrict: 'Visakhapatnam' };
    case '56':
    case '57':
    case '58':
    case '59':
      return { state: 'Karnataka', defaultDistrict: 'Bengaluru Urban' };
    case '60':
    case '61':
    case '62':
    case '63':
    case '64':
      return { state: 'Tamil Nadu', defaultDistrict: 'Chennai' };
    case '67':
    case '68':
    case '69':
      return { state: 'Kerala', defaultDistrict: 'Ernakulam (Kochi)' };
    case '70':
    case '71':
    case '72':
    case '73':
    case '74':
      return { state: 'West Bengal', defaultDistrict: 'Kolkata' };
    case '75':
    case '76':
    case '77':
      return { state: 'Odisha', defaultDistrict: 'Khordha (Bhubaneswar)' };
    case '78':
      return { state: 'Assam', defaultDistrict: 'Kamrup Metropolitan (Guwahati)' };
    case '79':
      return { state: 'Tripura', defaultDistrict: 'West Tripura (Agartala)' };
    case '80':
    case '81':
    case '82':
    case '83':
    case '84':
    case '85':
      return { state: 'Bihar', defaultDistrict: 'Patna' };
    case '86':
    case '87':
    case '88':
    case '89':
      return { state: 'Jharkhand', defaultDistrict: 'Ranchi' };
    default:
      return { state: 'Uttar Pradesh', defaultDistrict: 'Prayagraj (Allahabad)' };
  }
};
