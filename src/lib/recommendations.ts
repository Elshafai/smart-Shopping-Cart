// Hardcoded recommendation mappings by product name
// Each product maps to an array of recommended product names
export const RECOMMENDATIONS: Record<string, string[]> = {
  // Drinks
  "V Cola": ["Pepsi", "Suntop", "Johayana"],
  "Suntop": ["Johayana", "V Cola", "Milk"],
  "Milk": ["Zabado", "Nescafa Gold", "Suntop"],
  "Pepsi": ["V Cola", "Suntop", "RedBull"],
  "Johayana": ["V Cola", "Pepsi", "Suntop"],
  "RedBull": ["Pepsi", "V Cola", "Johayana"],
  "Zabado": ["Milk", "Suntop", "Johayana"],
  "Nescafa Gold": ["Milk", "Zabado", "Dairy Milk"],

  // Snacks
  "Big Chips": ["Supermi indomie", "Tiger", "Freska"],
  "Freska": ["Big Chips", "Tiger", "Hohos"],
  "Biskrem": ["Oreo", "Dairy Milk", "Al Abd Cookies"],
  "Toffifee": ["Dairy Milk", "Biskrem", "Al Abd Cookies"],
  "Dairy Milk": ["Toffifee", "Oreo", "Biskrem"],
  "Oreo": ["Biskrem", "Dairy Milk", "Hohos"],
  "Tiger": ["Big Chips", "Freska", "Supermi indomie"],
  "Hohos": ["Oreo", "Biskrem", "Dairy Milk"],
  "Al Abd Cookies": ["Biskrem", "Toffifee", "Dairy Milk"],
  "Supermi indomie": ["Big Chips", "Tiger", "Freska"],

  // Personal Care
  "Bless": ["Nivea", "Pantene", "Shampoo"],
  "Nivea": ["Bless", "Pantene", "Lifebuoy"],
  "Pantene": ["Shampoo", "Bless", "Nivea"],
  "Shampoo": ["Pantene", "Bless", "Lifebuoy"],
  "Lifebuoy": ["Shampoo", "Nivea", "Bless"],

  // Household Supplies
  "Fine": ["Pyrsol"],
  "Pyrsol": ["Fine"],

  // Food Products
  "Rhodes": ["Beans", "Tuna", "Maxtella"],
  "Maxtella": ["Rhodes", "Tuna", "Dairy Milk"],
  "Beans": ["Tuna", "Rhodes", "Maxtella"],
  "Tuna": ["Beans", "Rhodes", "Maxtella"],
};
