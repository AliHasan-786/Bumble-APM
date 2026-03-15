export const profiles = [
  {
    id: 1,
    name: "Sarah",
    age: 28,
    bio: "Weekends are strictly for hiking upstate, trying to find the best slice of pizza in Manhattan, and hanging out with my Golden Retriever, Max. Unpopular opinion: The Office isn't that funny.",
    tags: ["Active", "Dog Lover", "Foodie"],
    avatar: "🧗‍♀️"
  },
  {
    id: 2,
    name: "David",
    age: 31,
    bio: "Software engineer. Love running and coffee. Just looking for someone to explore the city with.",
    tags: ["Tech", "Runner", "Coffee"],
    avatar: "☕"
  },
  {
    id: 3,
    name: "Elena",
    age: 26,
    bio: "New to the city! Looking for a museum buddy, someone to try weird natural wines with, and do Sunday morning runs.",
    tags: ["Art", "Wine", "Fitness"],
    avatar: "🍷"
  }
]

export type Profile = typeof profiles[0]
