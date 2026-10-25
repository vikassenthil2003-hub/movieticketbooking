import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const LocationContext = createContext(null);

// Official list of all 38 districts of Tamil Nadu
export const TAMIL_NADU_DISTRICTS_LIST = [
  { id: 'chennai', name: 'Chennai', headquarters: 'Chennai', lat: 13.0827, lng: 80.2707, isPopular: true, cities: ['Chennai City', 'Royapettah', 'Vadapalani', 'Velachery', 'Anna Nagar', 'T. Nagar', 'Adyar', 'Mylapore', 'Koyambedu', 'Kilpauk', 'Perambur', 'Porur'] },
  { id: 'coimbatore', name: 'Coimbatore', headquarters: 'Coimbatore', lat: 11.0168, lng: 76.9558, isPopular: true, cities: ['Coimbatore City', 'Gandhipuram', 'RS Puram', 'Saravanampatti', 'Peelamedu', 'Singanallur', 'Pollachi', 'Mettupalayam', 'Sulur'] },
  { id: 'madurai', name: 'Madurai', headquarters: 'Madurai', lat: 9.9252, lng: 78.1198, isPopular: true, cities: ['Madurai City', 'KK Nagar', 'Town Hall', 'Anna Nagar', 'Goripalayam', 'Simmakkal', 'Thirunagar', 'Melur'] },
  { id: 'salem', name: 'Salem', headquarters: 'Salem', lat: 11.6643, lng: 78.1460, isPopular: true, cities: ['Salem City', 'Meyyanur', 'Fairlands', 'Hasthampatti', 'Shevapet', 'Attur', 'Mettur', 'Omalur'] },
  { id: 'tiruchirappalli', name: 'Tiruchirappalli', headquarters: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, isPopular: true, cities: ['Trichy City', 'Thillai Nagar', 'Cantonment', 'Srirangam', 'Palakkarai', 'KK Nagar', 'Manapparai'] },
  { id: 'tiruppur', name: 'Tiruppur', headquarters: 'Tiruppur', lat: 11.1085, lng: 77.3411, isPopular: true, cities: ['Tiruppur City', 'Avinashi Road', 'Palladam', 'Dharapuram', 'Udumalaipettai', 'Kangeyam', 'Avinashi'] },
  { id: 'erode', name: 'Erode', headquarters: 'Erode', lat: 11.3410, lng: 77.7172, isPopular: true, cities: ['Erode City', 'Perundurai', 'Bhavani', 'Gobichettipalayam', 'Sathyamangalam', 'Anthiyur'] },
  { id: 'vellore', name: 'Vellore', headquarters: 'Vellore', lat: 12.9165, lng: 79.1325, isPopular: true, cities: ['Vellore City', 'Katpadi', 'Gandhi Nagar', 'Bagayam', 'Gudiyatham', 'Thorapadi'] },
  { id: 'tirunelveli', name: 'Tirunelveli', headquarters: 'Tirunelveli', lat: 8.7139, lng: 77.7567, isPopular: true, cities: ['Tirunelveli City', 'Palayamkottai', 'Vannarpettai', 'Junction', 'Ambasamudram', 'Radhapuram'] },
  { id: 'thanjavur', name: 'Thanjavur', headquarters: 'Thanjavur', lat: 10.7870, lng: 79.1378, isPopular: true, cities: ['Thanjavur City', 'Medical College Road', 'Kumbakonam', 'Pattukkottai', 'Orathanadu'] },
  { id: 'chengalpattu', name: 'Chengalpattu', headquarters: 'Chengalpattu', lat: 12.6939, lng: 79.9757, isPopular: true, cities: ['Chengalpattu Town', 'Chromepet', 'Tambaram', 'Pallavaram', 'Guduvanchery', 'Mahabalipuram', 'Maraimalai Nagar'] },
  { id: 'tiruvallur', name: 'Tiruvallur', headquarters: 'Tiruvallur', lat: 13.1432, lng: 79.9083, isPopular: true, cities: ['Tiruvallur Town', 'Ambattur', 'Avadi', 'Poonamallee', 'Tiruttani', 'Gummidipoondi'] },
  { id: 'kancheepuram', name: 'Kancheepuram', headquarters: 'Kancheepuram', lat: 12.8342, lng: 79.7036, isPopular: false, cities: ['Kanchipuram City', 'Sriperumbudur', 'Walajabad', 'Kundrathur'] },
  { id: 'dindigul', name: 'Dindigul', headquarters: 'Dindigul', lat: 10.3673, lng: 77.9803, isPopular: false, cities: ['Dindigul City', 'Palani', 'Kodaikanal', 'Oddanchatram', 'Batlagundu'] },
  { id: 'thoothukudi', name: 'Thoothukudi', headquarters: 'Thoothukudi', lat: 8.7642, lng: 78.1348, isPopular: false, cities: ['Thoothukudi City', 'Kovilpatti', 'Tiruchendur', 'Kayalpattinam'] },
  { id: 'kanyakumari', name: 'Kanyakumari', headquarters: 'Nagercoil', lat: 8.0883, lng: 77.5385, isPopular: false, cities: ['Nagercoil', 'Kanyakumari Town', 'Marthandam', 'Thuckalay', 'Colachel'] },
  { id: 'namakkal', name: 'Namakkal', headquarters: 'Namakkal', lat: 11.2189, lng: 78.1674, isPopular: false, cities: ['Namakkal Town', 'Tiruchengode', 'Rasipuram', 'Paramathi Velur'] },
  { id: 'karur', name: 'Karur', headquarters: 'Karur', lat: 10.9601, lng: 78.0766, isPopular: false, cities: ['Karur City', 'Kulithalai', 'Aravakurichi', 'Velliyanai'] },
  { id: 'krishnagiri', name: 'Krishnagiri', headquarters: 'Krishnagiri', lat: 12.5186, lng: 78.2137, isPopular: false, cities: ['Hosur', 'Krishnagiri Town', 'Pochampalli', 'Bargur'] },
  { id: 'dharmapuri', name: 'Dharmapuri', headquarters: 'Dharmapuri', lat: 12.1211, lng: 78.1582, isPopular: false, cities: ['Dharmapuri Town', 'Harur', 'Palacode', 'Pennagaram'] },
  { id: 'villupuram', name: 'Villupuram', headquarters: 'Villupuram', lat: 11.9401, lng: 79.4861, isPopular: false, cities: ['Villupuram Town', 'Tindivanam', 'Gingee', 'Vikravandi'] },
  { id: 'cuddalore', name: 'Cuddalore', headquarters: 'Cuddalore', lat: 11.7480, lng: 79.7714, isPopular: false, cities: ['Cuddalore Town', 'Chidambaram', 'Panruti', 'Vridhachalam', 'Neyveli'] },
  { id: 'sivaganga', name: 'Sivaganga', headquarters: 'Sivaganga', lat: 9.8433, lng: 78.4809, isPopular: false, cities: ['Karaikudi', 'Sivaganga Town', 'Devakottai', 'Manamadurai'] },
  { id: 'virudhunagar', name: 'Virudhunagar', headquarters: 'Virudhunagar', lat: 9.5680, lng: 77.9624, isPopular: false, cities: ['Sivakasi', 'Rajapalayam', 'Virudhunagar Town', 'Srivilliputhur', 'Aruppukkottai'] },
  { id: 'ramanathapuram', name: 'Ramanathapuram', headquarters: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, isPopular: false, cities: ['Ramanathapuram Town', 'Rameswaram', 'Paramakudi', 'Kilakarai'] },
  { id: 'theni', name: 'Theni', headquarters: 'Theni', lat: 10.0104, lng: 77.4768, isPopular: false, cities: ['Theni Allinagaram', 'Bodinayakanur', 'Periyakulam', 'Cumbum'] },
  { id: 'tenkasi', name: 'Tenkasi', headquarters: 'Tenkasi', lat: 8.9594, lng: 77.3161, isPopular: false, cities: ['Tenkasi Town', 'Sankarankovil', 'Courtallam', 'Kadayanallur'] },
  { id: 'nilgiris', name: 'Nilgiris', headquarters: 'Udhagamandalam', lat: 11.4102, lng: 76.6950, isPopular: false, cities: ['Udhagamandalam (Ooty)', 'Coonoor', 'Kotagiri', 'Gudalur'] },
  { id: 'ariyalur', name: 'Ariyalur', headquarters: 'Ariyalur', lat: 11.1401, lng: 79.0786, isPopular: false, cities: ['Ariyalur Town', 'Jayankondam', 'Sendurai', 'Udayarpalayam'] },
  { id: 'perambalur', name: 'Perambalur', headquarters: 'Perambalur', lat: 11.2342, lng: 78.8817, isPopular: false, cities: ['Perambalur Town', 'Veppanthattai', 'Kunnam', 'Alathur'] },
  { id: 'pudukkottai', name: 'Pudukkottai', headquarters: 'Pudukkottai', lat: 10.3797, lng: 78.8208, isPopular: false, cities: ['Pudukkottai Town', 'Aranthangi', 'Alangudi', 'Viralimalai'] },
  { id: 'nagapattinam', name: 'Nagapattinam', headquarters: 'Nagapattinam', lat: 10.7672, lng: 79.8424, isPopular: false, cities: ['Nagapattinam Town', 'Velankanni', 'Kilvelur', 'Vedaranyam'] },
  { id: 'mayiladuthurai', name: 'Mayiladuthurai', headquarters: 'Mayiladuthurai', lat: 11.1075, lng: 79.6524, isPopular: false, cities: ['Mayiladuthurai Town', 'Sirkazhi', 'Tharangambadi', 'Kuthalam'] },
  { id: 'tiruvarur', name: 'Tiruvarur', headquarters: 'Tiruvarur', lat: 10.7725, lng: 79.6368, isPopular: false, cities: ['Tiruvarur Town', 'Mannargudi', 'Thiruthuraipoondi', 'Kudavasal'] },
  { id: 'kallakurichi', name: 'Kallakurichi', headquarters: 'Kallakurichi', lat: 11.7383, lng: 78.9639, isPopular: false, cities: ['Kallakurichi Town', 'Chinnasalem', 'Ulundurpet', 'Tirukoilur'] },
  { id: 'tiruvannamalai', name: 'Tiruvannamalai', headquarters: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, isPopular: false, cities: ['Tiruvannamalai Town', 'Arani', 'Polur', 'Cheyyar'] },
  { id: 'ranipet', name: 'Ranipet', headquarters: 'Ranipet', lat: 12.9272, lng: 79.3330, isPopular: false, cities: ['Ranipet Town', 'Walajapet', 'Arcot', 'Arakkonam', 'Sholinghur'] },
  { id: 'tirupathur', name: 'Tirupathur', headquarters: 'Tirupathur', lat: 12.4958, lng: 78.5678, isPopular: false, cities: ['Tirupathur Town', 'Vaniyambadi', 'Ambur', 'Jolarpet'] },
];

// All-India States Directory with key districts for the UI
export const ALL_INDIA_STATES_LIST = [
  { code: 'TN', name: 'Tamil Nadu', type: 'State', capital: 'Chennai', lat: 13.0827, lng: 80.2707, isPopular: true, districts: TAMIL_NADU_DISTRICTS_LIST },
  {
    code: 'MH',
    name: 'Maharashtra',
    type: 'State',
    capital: 'Mumbai',
    lat: 19.0760,
    lng: 72.8777,
    isPopular: true,
    districts: [
      { id: 'mumbai', name: 'Mumbai', headquarters: 'Mumbai', lat: 19.0760, lng: 72.8777, isPopular: true, cities: ['Andheri', 'Bandra', 'Borivali', 'Juhu', 'Colaba', 'Dadar', 'Kurla', 'Ghatkopar', 'Malad', 'Worli'] },
      { id: 'thane', name: 'Thane', headquarters: 'Thane', lat: 19.2183, lng: 72.9781, isPopular: true, cities: ['Thane West', 'Kalyan', 'Dombivli', 'Mira-Bhayandar', 'Navi Mumbai'] },
      { id: 'pune', name: 'Pune', headquarters: 'Pune', lat: 18.5204, lng: 73.8567, isPopular: true, cities: ['Pune City', 'Kothrud', 'Viman Nagar', 'Hadapsar', 'Hinjewadi', 'Shivajinagar', 'Pimpri-Chinchwad'] },
      { id: 'nagpur', name: 'Nagpur', headquarters: 'Nagpur', lat: 21.1458, lng: 79.0882, isPopular: false, cities: ['Nagpur City', 'Dharampeth', 'Sitabuldi', 'Civil Lines'] },
      { id: 'nashik', name: 'Nashik', headquarters: 'Nashik', lat: 19.9975, lng: 73.7898, isPopular: false, cities: ['Nashik City', 'College Road', 'Shalimar', 'Panchavati'] },
    ],
  },
  {
    code: 'KA',
    name: 'Karnataka',
    type: 'State',
    capital: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5946,
    isPopular: true,
    districts: [
      { id: 'bengaluru_urban', name: 'Bengaluru Urban', headquarters: 'Bengaluru', lat: 12.9716, lng: 77.5946, isPopular: true, cities: ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'Rajajinagar', 'Malleshwaram', 'BTM Layout', 'Electronic City'] },
      { id: 'mysuru', name: 'Mysuru', headquarters: 'Mysuru', lat: 12.2958, lng: 76.6394, isPopular: true, cities: ['Mysuru City', 'Jayalakshmipuram', 'Gokulam', 'Vijayanagar'] },
      { id: 'dakshina_kannada', name: 'Dakshina Kannada', headquarters: 'Mangaluru', lat: 12.9141, lng: 74.8560, isPopular: false, cities: ['Mangaluru City', 'Pandeshwar', 'Kodialbail', 'Surathkal'] },
      { id: 'dharwad', name: 'Dharwad', headquarters: 'Hubballi', lat: 15.3647, lng: 75.1240, isPopular: false, cities: ['Hubballi', 'Dharwad City', 'Gokul Road'] },
    ],
  },
  {
    code: 'TS',
    name: 'Telangana',
    type: 'State',
    capital: 'Hyderabad',
    lat: 17.3850,
    lng: 78.4867,
    isPopular: true,
    districts: [
      { id: 'hyderabad', name: 'Hyderabad', headquarters: 'Hyderabad', lat: 17.3850, lng: 78.4867, isPopular: true, cities: ['Banjara Hills', 'Jubilee Hills', 'Abids', 'Charminar', 'Necklace Road', 'Secunderabad'] },
      { id: 'ranga_reddy', name: 'Ranga Reddy', headquarters: 'Shamshabad', lat: 17.4399, lng: 78.3846, isPopular: true, cities: ['Hitec City', 'Gachibowli', 'Madhapur', 'Kondapur', 'Manikonda'] },
      { id: 'medchal_malkajgiri', name: 'Medchal-Malkajgiri', headquarters: 'Malkajgiri', lat: 17.4912, lng: 78.3918, isPopular: false, cities: ['Kukatpally', 'Miyapur', 'ECIL', 'Kompally'] },
      { id: 'warangal', name: 'Warangal', headquarters: 'Warangal', lat: 17.9689, lng: 79.5941, isPopular: false, cities: ['Warangal City', 'Hanamkonda', 'Kazipet'] },
    ],
  },
  {
    code: 'DL',
    name: 'Delhi',
    type: 'Union Territory',
    capital: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090,
    isPopular: true,
    districts: [
      { id: 'new_delhi', name: 'New Delhi', headquarters: 'Connaught Place', lat: 28.6331, lng: 77.2195, isPopular: true, cities: ['Connaught Place', 'Chanakyapuri', 'Barakhamba Road', 'Delhi Gate'] },
      { id: 'south_delhi', name: 'South Delhi', headquarters: 'Saket', lat: 28.5284, lng: 77.2194, isPopular: true, cities: ['Saket', 'Vasant Kunj', 'Hauz Khas', 'Greater Kailash'] },
      { id: 'south_east_delhi', name: 'South East Delhi', headquarters: 'Nehru Place', lat: 28.5494, lng: 77.2528, isPopular: false, cities: ['Nehru Place', 'Defence Colony', 'Okhla', 'Kalkaji'] },
      { id: 'west_delhi', name: 'West Delhi', headquarters: 'Rajouri Garden', lat: 28.6415, lng: 77.1209, isPopular: false, cities: ['Rajouri Garden', 'Janakpuri', 'Punjabi Bagh'] },
    ],
  },
  {
    code: 'KL',
    name: 'Kerala',
    type: 'State',
    capital: 'Thiruvananthapuram',
    lat: 8.5241,
    lng: 76.9366,
    isPopular: true,
    districts: [
      { id: 'ernakulam', name: 'Ernakulam', headquarters: 'Kochi', lat: 9.9816, lng: 76.2999, isPopular: true, cities: ['Kochi City', 'Edappally', 'MG Road', 'Marine Drive', 'Kakkanad', 'Aluva'] },
      { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', headquarters: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, isPopular: true, cities: ['Thiruvananthapuram City', 'Thampanoor', 'Chacka', 'Pattom', 'Kazhakoottam'] },
      { id: 'kozhikode', name: 'Kozhikode', headquarters: 'Kozhikode', lat: 11.2588, lng: 75.7804, isPopular: false, cities: ['Kozhikode City', 'Palazhi', 'Mavoor Road'] },
      { id: 'thrissur', name: 'Thrissur', headquarters: 'Thrissur', lat: 10.5276, lng: 76.2144, isPopular: false, cities: ['Thrissur City', 'Round South', 'Kokkala'] },
    ],
  },
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    type: 'State',
    capital: 'Amaravati',
    lat: 16.5062,
    lng: 80.6480,
    isPopular: true,
    districts: [
      { id: 'visakhapatnam', name: 'Visakhapatnam', headquarters: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, isPopular: true, cities: ['Visakhapatnam City', 'Beach Road', 'Jagadamba Centre', 'Gajuwaka'] },
      { id: 'krishna_ntr', name: 'NTR (Vijayawada)', headquarters: 'Vijayawada', lat: 16.5062, lng: 80.6480, isPopular: true, cities: ['Vijayawada City', 'MG Road', 'Governorpet', 'Benz Circle'] },
      { id: 'guntur', name: 'Guntur', headquarters: 'Guntur', lat: 16.3067, lng: 80.4365, isPopular: false, cities: ['Guntur City', 'Brodipet', 'Tenali'] },
      { id: 'tirupati_dist', name: 'Tirupati', headquarters: 'Tirupati', lat: 13.6288, lng: 79.4192, isPopular: true, cities: ['Tirupati City', 'Korlagunta', 'Renigunta', 'Chandragiri'] },
    ],
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    type: 'State',
    capital: 'Lucknow',
    lat: 26.8467,
    lng: 80.9462,
    isPopular: true,
    districts: [
      { id: 'gautam_buddha_nagar', name: 'Gautam Buddha Nagar (Noida)', headquarters: 'Noida', lat: 28.5355, lng: 77.3910, isPopular: true, cities: ['Noida Sector 18', 'Noida Sector 32', 'Greater Noida'] },
      { id: 'lucknow', name: 'Lucknow', headquarters: 'Lucknow', lat: 26.8467, lng: 80.9462, isPopular: true, cities: ['Lucknow City', 'Gomti Nagar', 'Alambagh', 'Hazratganj'] },
      { id: 'kanpur_nagar', name: 'Kanpur Nagar', headquarters: 'Kanpur', lat: 26.4499, lng: 80.3319, isPopular: false, cities: ['Kanpur City', 'MG Marg', 'Civil Lines'] },
      { id: 'varanasi', name: 'Varanasi', headquarters: 'Varanasi', lat: 25.3176, lng: 82.9739, isPopular: true, cities: ['Varanasi City', 'Varanasi Cantonment', 'Sigra'] },
      { id: 'agra', name: 'Agra', headquarters: 'Agra', lat: 27.1767, lng: 78.0081, isPopular: false, cities: ['Agra City', 'Agra Cantonment', 'Sanjay Place'] },
    ],
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    type: 'State',
    capital: 'Gandhinagar',
    lat: 23.0225,
    lng: 72.5714,
    isPopular: true,
    districts: [
      { id: 'ahmedabad', name: 'Ahmedabad', headquarters: 'Ahmedabad', lat: 23.0225, lng: 72.5714, isPopular: true, cities: ['Ahmedabad City', 'Vastrapur', 'SG Highway', 'Thaltej', 'Navrangpura'] },
      { id: 'surat', name: 'Surat', headquarters: 'Surat', lat: 21.1702, lng: 72.8311, isPopular: true, cities: ['Surat City', 'Adajan', 'Pal', 'Dumas Road', 'Varachha'] },
      { id: 'vadodara', name: 'Vadodara', headquarters: 'Vadodara', lat: 22.3072, lng: 73.1812, isPopular: false, cities: ['Vadodara City', 'Alkapuri', 'Gorwa Road'] },
      { id: 'rajkot', name: 'Rajkot', headquarters: 'Rajkot', lat: 22.3039, lng: 70.8022, isPopular: false, cities: ['Rajkot City', 'Kalawad Road', 'Yagnik Road'] },
    ],
  },
  {
    code: 'WB',
    name: 'West Bengal',
    type: 'State',
    capital: 'Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    isPopular: true,
    districts: [
      { id: 'kolkata', name: 'Kolkata', headquarters: 'Kolkata', lat: 22.5726, lng: 88.3639, isPopular: true, cities: ['Park Circus', 'Salt Lake', 'New Town', 'Ballygunge', 'Rabindra Sadan', 'Kankurgachi'] },
      { id: 'howrah', name: 'Howrah', headquarters: 'Howrah', lat: 22.5958, lng: 88.2636, isPopular: false, cities: ['Howrah City', 'Shibpur', 'Salkia'] },
      { id: 'darjeeling_siliguri', name: 'Darjeeling (Siliguri)', headquarters: 'Siliguri', lat: 26.7271, lng: 88.3953, isPopular: false, cities: ['Siliguri City', 'Matigara', 'Darjeeling Town'] },
    ],
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    type: 'State',
    capital: 'Jaipur',
    lat: 26.9124,
    lng: 75.7873,
    isPopular: true,
    districts: [
      { id: 'jaipur', name: 'Jaipur', headquarters: 'Jaipur', lat: 26.9124, lng: 75.7873, isPopular: true, cities: ['Jaipur City', 'C Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar'] },
      { id: 'jodhpur', name: 'Jodhpur', headquarters: 'Jodhpur', lat: 26.2389, lng: 73.0243, isPopular: false, cities: ['Jodhpur City', 'Sardarpura', 'Paota'] },
      { id: 'udaipur', name: 'Udaipur', headquarters: 'Udaipur', lat: 24.5854, lng: 73.7125, isPopular: false, cities: ['Udaipur City', 'Bhuwana', 'Fatehpura'] },
    ],
  },
  {
    code: 'CH',
    name: 'Chandigarh',
    type: 'Union Territory',
    capital: 'Chandigarh',
    lat: 30.7333,
    lng: 76.7794,
    isPopular: true,
    districts: [
      { id: 'chandigarh', name: 'Chandigarh', headquarters: 'Chandigarh', lat: 30.7333, lng: 76.7794, isPopular: true, cities: ['Sector 17', 'Industrial Area Phase 1 (Elante)', 'Sector 35', 'Sector 22'] },
    ],
  },
  {
    code: 'PB',
    name: 'Punjab',
    type: 'State',
    capital: 'Chandigarh',
    lat: 31.1471,
    lng: 75.3412,
    isPopular: false,
    districts: [
      { id: 'ludhiana', name: 'Ludhiana', headquarters: 'Ludhiana', lat: 30.9010, lng: 75.8573, isPopular: true, cities: ['Ludhiana City', 'Mall Road', 'Civil Lines'] },
      { id: 'amritsar', name: 'Amritsar', headquarters: 'Amritsar', lat: 31.6340, lng: 74.8723, isPopular: true, cities: ['Amritsar City', 'GT Road', 'Ranjit Avenue'] },
    ],
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    type: 'State',
    capital: 'Bhopal',
    lat: 23.2599,
    lng: 77.4126,
    isPopular: false,
    districts: [
      { id: 'indore', name: 'Indore', headquarters: 'Indore', lat: 22.7196, lng: 75.8577, isPopular: true, cities: ['Indore City', 'MG Road', 'Vijay Nagar', 'AB Road'] },
      { id: 'bhopal', name: 'Bhopal', headquarters: 'Bhopal', lat: 23.2599, lng: 77.4126, isPopular: false, cities: ['Bhopal City', 'Arera Hills', 'MP Nagar'] },
    ],
  },
  {
    code: 'BR',
    name: 'Bihar',
    type: 'State',
    capital: 'Patna',
    lat: 25.5941,
    lng: 85.1376,
    isPopular: false,
    districts: [
      { id: 'patna', name: 'Patna', headquarters: 'Patna', lat: 25.5941, lng: 85.1376, isPopular: true, cities: ['Patna City', 'Patliputra Colony', 'Gandhi Maidan'] },
    ],
  },
  {
    code: 'JH',
    name: 'Jharkhand',
    type: 'State',
    capital: 'Ranchi',
    lat: 23.3441,
    lng: 85.3096,
    isPopular: false,
    districts: [
      { id: 'ranchi', name: 'Ranchi', headquarters: 'Ranchi', lat: 23.3441, lng: 85.3096, isPopular: false, cities: ['Ranchi City', 'Circular Road', 'Main Road'] },
    ],
  },
  {
    code: 'AS',
    name: 'Assam',
    type: 'State',
    capital: 'Dispur',
    lat: 26.1445,
    lng: 91.7362,
    isPopular: false,
    districts: [
      { id: 'kamrup_metro', name: 'Kamrup Metropolitan (Guwahati)', headquarters: 'Guwahati', lat: 26.1445, lng: 91.7362, isPopular: true, cities: ['Guwahati City', 'GS Road', 'Christian Basti', 'Paltan Bazaar'] },
    ],
  },
  {
    code: 'GA',
    name: 'Goa',
    type: 'State',
    capital: 'Panaji',
    lat: 15.2993,
    lng: 74.1240,
    isPopular: false,
    districts: [
      { id: 'north_goa', name: 'North Goa', headquarters: 'Panaji', lat: 15.4909, lng: 73.8278, isPopular: true, cities: ['Panaji', 'Porvorim', 'Mapusa', 'Calangute'] },
      { id: 'south_goa', name: 'South Goa', headquarters: 'Margao', lat: 15.2832, lng: 73.9862, isPopular: false, cities: ['Margao', 'Vasco da Gama'] },
    ],
  },
  {
    code: 'PY',
    name: 'Puducherry',
    type: 'Union Territory',
    capital: 'Pondicherry',
    lat: 11.9416,
    lng: 79.8083,
    isPopular: true,
    districts: [
      { id: 'puducherry_district', name: 'Puducherry', headquarters: 'Pondicherry', lat: 11.9416, lng: 79.8083, isPopular: true, cities: ['White Town', 'Thiruvalluvar Salai', 'Muthialpet', 'Oulgaret'] },
    ],
  },
  {
    code: 'JK',
    name: 'Jammu and Kashmir',
    type: 'Union Territory',
    capital: 'Srinagar / Jammu',
    lat: 34.0837,
    lng: 74.7973,
    isPopular: false,
    districts: [
      { id: 'srinagar', name: 'Srinagar', headquarters: 'Srinagar', lat: 34.0837, lng: 74.7973, isPopular: false, cities: ['Srinagar City', 'Shivpora', 'Lal Chowk'] },
      { id: 'jammu', name: 'Jammu', headquarters: 'Jammu', lat: 32.7266, lng: 74.8570, isPopular: false, cities: ['Jammu City', 'Channi Himmat', 'Gandhi Nagar'] },
    ],
  },
  {
    code: 'HR',
    name: 'Haryana',
    type: 'State',
    capital: 'Chandigarh',
    lat: 29.0588,
    lng: 76.0856,
    isPopular: true,
    districts: [
      { id: 'gurugram', name: 'Gurugram', headquarters: 'Gurugram', lat: 28.4595, lng: 77.0266, isPopular: true, cities: ['Cyber City', 'MG Road', 'Golf Course Road', 'Sector 29'] },
      { id: 'faridabad', name: 'Faridabad', headquarters: 'Faridabad', lat: 28.4089, lng: 77.3178, isPopular: false, cities: ['Faridabad City', 'NIT Faridabad', 'Sector 15'] },
    ],
  },
  {
    code: 'OD',
    name: 'Odisha',
    type: 'State',
    capital: 'Bhubaneswar',
    lat: 20.2961,
    lng: 85.8245,
    isPopular: false,
    districts: [
      { id: 'khordha_bhubaneswar', name: 'Khordha (Bhubaneswar)', headquarters: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, isPopular: true, cities: ['Bhubaneswar City', 'Saheed Nagar', 'Patia'] },
    ],
  },
  {
    code: 'UK',
    name: 'Uttarakhand',
    type: 'State',
    capital: 'Dehradun',
    lat: 30.3165,
    lng: 78.0322,
    isPopular: false,
    districts: [
      { id: 'dehradun', name: 'Dehradun', headquarters: 'Dehradun', lat: 30.3165, lng: 78.0322, isPopular: false, cities: ['Dehradun City', 'Rajpur Road', 'Jakhan'] },
    ],
  },
  {
    code: 'HP',
    name: 'Himachal Pradesh',
    type: 'State',
    capital: 'Shimla',
    lat: 31.1048,
    lng: 77.1734,
    isPopular: false,
    districts: [
      { id: 'shimla', name: 'Shimla', headquarters: 'Shimla', lat: 31.1048, lng: 77.1734, isPopular: false, cities: ['Shimla City', 'The Mall'] },
    ],
  },
  {
    code: 'CG',
    name: 'Chhattisgarh',
    type: 'State',
    capital: 'Raipur',
    lat: 21.2514,
    lng: 81.6296,
    isPopular: false,
    districts: [
      { id: 'raipur', name: 'Raipur', headquarters: 'Raipur', lat: 21.2514, lng: 81.6296, isPopular: false, cities: ['Raipur City', 'Pandri', 'Civil Lines'] },
    ],
  },
];

export const LocationProvider = ({ children }) => {
  // Stored state preference
  const [selectedState, setSelectedState] = useState(() => {
    return localStorage.getItem('cineverse_state') || 'Tamil Nadu';
  });

  // Stored district preference
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    return localStorage.getItem('cineverse_district') || 'Chennai';
  });

  // Stored city preference
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('cineverse_city') || 'Chennai';
  });

  // Stored coordinates (defaults to Chennai center)
  const [userCoords, setUserCoords] = useState(() => {
    try {
      const stored = localStorage.getItem('cineverse_coords');
      return stored ? JSON.parse(stored) : { lat: 13.0827, lng: 80.2707 };
    } catch {
      return { lat: 13.0827, lng: 80.2707 };
    }
  });

  const [detectedArea, setDetectedArea] = useState(() => {
    return localStorage.getItem('cineverse_area') || '';
  });

  const [detectedPinCode, setDetectedPinCode] = useState(() => {
    return localStorage.getItem('cineverse_pincode') || '';
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cineverse_state', selectedState);
  }, [selectedState]);

  useEffect(() => {
    localStorage.setItem('cineverse_district', selectedDistrict);
  }, [selectedDistrict]);

  useEffect(() => {
    localStorage.setItem('cineverse_city', selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (userCoords) {
      localStorage.setItem('cineverse_coords', JSON.stringify(userCoords));
    }
  }, [userCoords]);

  useEffect(() => {
    if (detectedArea) {
      localStorage.setItem('cineverse_area', detectedArea);
    } else {
      localStorage.removeItem('cineverse_area');
    }
  }, [detectedArea]);

  useEffect(() => {
    if (detectedPinCode) {
      localStorage.setItem('cineverse_pincode', detectedPinCode);
    } else {
      localStorage.removeItem('cineverse_pincode');
    }
  }, [detectedPinCode]);

  // Find nearest state and district given coordinates
  const findClosestLocation = useCallback((lat, lng) => {
    let closestState = ALL_INDIA_STATES_LIST[0];
    let minStateDist = Infinity;

    for (const st of ALL_INDIA_STATES_LIST) {
      const d = Math.hypot(st.lat - lat, st.lng - lng);
      if (d < minStateDist) {
        minStateDist = d;
        closestState = st;
      }
    }

    let closestDist = closestState.districts[0];
    let minDist = Infinity;
    for (const d of closestState.districts) {
      const dist = Math.hypot(d.lat - lat, d.lng - lng);
      if (dist < minDist) {
        minDist = dist;
        closestDist = d;
      }
    }

    return {
      state: closestState.name,
      district: closestDist ? closestDist.name : closestState.capital,
      city: closestDist ? (closestDist.cities[0] || closestDist.headquarters) : closestState.capital,
      lat: closestDist ? closestDist.lat : closestState.lat,
      lng: closestDist ? closestDist.lng : closestState.lng,
    };
  }, []);

  /**
   * Request Geolocation permission and detect state + district + city + area via backend reverse geocoding
   */
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser.';
      setLocationError(errMsg);
      setLocationStatus('unavailable');
      return;
    }

    setIsDetecting(true);
    setLocationStatus('detecting');
    setLocationError(null);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserCoords(coords);

        try {
          const res = await api.get(`/location/reverse?lat=${latitude}&lng=${longitude}`);
          const data = res.data?.data || res.data;

          if (data) {
            const detectedStateName = data.state || 'Tamil Nadu';
            const detectedDistName = data.district || '';
            const detectedCityName = data.city || '';

            setSelectedState(detectedStateName);
            setSelectedDistrict(detectedDistName || detectedCityName || 'Chennai');
            setSelectedCity(detectedCityName || detectedDistName || 'Chennai');

            if (data.area) setDetectedArea(data.area);
            if (data.pinCode) setDetectedPinCode(data.pinCode);

            setLocationStatus('success');
            setLocationError(null);
          } else {
            const closest = findClosestLocation(latitude, longitude);
            setSelectedState(closest.state);
            setSelectedDistrict(closest.district);
            setSelectedCity(closest.city);
            setLocationStatus('success');
          }
        } catch (err) {
          console.warn('[Geocoding Notice]: Backend reverse geocode fallback:', err.message);
          const closest = findClosestLocation(latitude, longitude);
          setSelectedState(closest.state);
          setSelectedDistrict(closest.district);
          setSelectedCity(closest.city);
          setLocationStatus('success');
        } finally {
          setIsDetecting(false);
          setIsLocationModalOpen(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        if (error.code === 1) {
          setPermissionDenied(true);
          setLocationStatus('denied');
          setLocationError('Location permission was denied. You can select your state, district, or town manually.');
        } else if (error.code === 2) {
          setLocationStatus('unavailable');
          setLocationError('GPS position unavailable. Please choose your state or district below.');
        } else if (error.code === 3) {
          setLocationStatus('timeout');
          setLocationError('Location request timed out. Please choose your state or district below.');
        } else {
          setLocationStatus('error');
          setLocationError(error.message || 'Could not detect your current location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  }, [findClosestLocation]);

  /**
   * Manual Selection of a State
   */
  const selectStateManually = useCallback((stateName) => {
    setSelectedState(stateName);
    const stateObj = ALL_INDIA_STATES_LIST.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
    if (stateObj && stateObj.districts?.length > 0) {
      const firstDist = stateObj.districts[0];
      setSelectedDistrict(firstDist.name);
      setSelectedCity(firstDist.cities?.[0] || firstDist.headquarters || firstDist.name);
      setUserCoords({ lat: firstDist.lat || stateObj.lat, lng: firstDist.lng || stateObj.lng });
    }
    setDetectedArea('');
    setDetectedPinCode('');
    setLocationStatus('manual');
    setLocationError(null);
    setPermissionDenied(false);
  }, []);

  /**
   * Manual Selection of a District
   */
  const selectDistrictManually = useCallback((districtName, stateHint = '') => {
    let matchedState = stateHint;
    let distObj = null;

    if (stateHint) {
      const st = ALL_INDIA_STATES_LIST.find((s) => s.name.toLowerCase() === stateHint.toLowerCase());
      if (st) {
        distObj = st.districts.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
      }
    }

    if (!distObj) {
      for (const st of ALL_INDIA_STATES_LIST) {
        const found = st.districts.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
        if (found) {
          distObj = found;
          matchedState = st.name;
          break;
        }
      }
    }

    if (matchedState) {
      setSelectedState(matchedState);
    }

    if (distObj) {
      setSelectedDistrict(distObj.name);
      setSelectedCity(distObj.headquarters || distObj.name);
      setUserCoords({ lat: distObj.lat, lng: distObj.lng });
    } else {
      setSelectedDistrict(districtName);
      setSelectedCity(districtName);
    }

    setDetectedArea('');
    setDetectedPinCode('');
    setLocationStatus('manual');
    setLocationError(null);
    setPermissionDenied(false);
    setIsLocationModalOpen(false);
  }, []);

  /**
   * Manual Selection of a City / Town within a District
   */
  const selectCityManually = useCallback((cityName, districtHint = '', stateHint = '') => {
    setSelectedCity(cityName);

    if (stateHint) {
      setSelectedState(stateHint);
    }

    let foundDistrict = districtHint;
    if (!foundDistrict) {
      for (const st of ALL_INDIA_STATES_LIST) {
        const dMatch = st.districts.find(
          (d) =>
            d.name.toLowerCase() === cityName.toLowerCase() ||
            d.cities?.some((c) => c.toLowerCase() === cityName.toLowerCase())
        );
        if (dMatch) {
          foundDistrict = dMatch.name;
          setSelectedState(st.name);
          setUserCoords({ lat: dMatch.lat, lng: dMatch.lng });
          break;
        }
      }
    }

    if (foundDistrict) {
      setSelectedDistrict(foundDistrict);
    }

    setDetectedArea('');
    setDetectedPinCode('');
    setLocationStatus('manual');
    setLocationError(null);
    setPermissionDenied(false);
    setIsLocationModalOpen(false);
  }, []);

  /**
   * Manual Selection of an Area, Landmark, or PIN code
   */
  const selectLocationManually = useCallback((locationItem) => {
    if (!locationItem) return;

    if (locationItem.state) {
      setSelectedState(locationItem.state);
    }

    if (locationItem.district) {
      setSelectedDistrict(locationItem.district);
    } else if (locationItem.city) {
      setSelectedDistrict(locationItem.city);
    }

    if (locationItem.city) {
      setSelectedCity(locationItem.city);
    }

    if (locationItem.area || locationItem.name) {
      setDetectedArea(locationItem.area || locationItem.name);
    }

    if (locationItem.pinCode) {
      setDetectedPinCode(locationItem.pinCode);
    }

    const lat = locationItem.lat || locationItem.coordinates?.lat;
    const lng = locationItem.lng || locationItem.coordinates?.lng;

    if (lat && lng) {
      setUserCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }

    setLocationStatus('manual');
    setLocationError(null);
    setPermissionDenied(false);
    setIsLocationModalOpen(false);
  }, []);

  /**
   * Search location across all Indian states, districts, towns, PIN codes
   */
  const searchLocations = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await api.get(`/location/search?query=${encodeURIComponent(query.trim())}`);
      return res.data?.data || res.data || [];
    } catch (err) {
      console.warn('[Location Search Error]:', err.message);
      return [];
    }
  }, []);

  // Currently active state object
  const currentStateObj = ALL_INDIA_STATES_LIST.find(
    (s) => s.name.toLowerCase() === selectedState.toLowerCase()
  ) || ALL_INDIA_STATES_LIST[0];

  const value = {
    selectedState,
    selectedDistrict,
    selectedCity,
    userCoords,
    detectedArea,
    detectedPinCode,
    isDetecting,
    permissionDenied,
    locationStatus,
    locationError,
    isLocationModalOpen,
    openLocationModal: () => setIsLocationModalOpen(true),
    closeLocationModal: () => setIsLocationModalOpen(false),
    detectLocation,
    selectStateManually,
    selectDistrictManually,
    selectCityManually,
    selectLocationManually,
    searchLocations,
    allStates: ALL_INDIA_STATES_LIST,
    districts: currentStateObj ? currentStateObj.districts : TAMIL_NADU_DISTRICTS_LIST,
    tamilNaduDistricts: TAMIL_NADU_DISTRICTS_LIST,
    supportedCities: ALL_INDIA_STATES_LIST.filter((s) => s.isPopular),
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
