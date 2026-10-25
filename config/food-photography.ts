/** Royalty-free food photography references from Unsplash, used until brand photography is available. */
export const foodPhotography = {
  biryani: { src: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1600&q=80", alt: "Traditional biryani served with warm spices" },
  curry: { src: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80", alt: "A bowl of rich Indian curry" },
  dessert: { src: "https://images.unsplash.com/photo-1758910536889-43ce7b3199fd?auto=format&fit=crop&w=1200&q=80", alt: "Colorful Indian sweets arranged for serving" },
  snacks: { src: "https://images.unsplash.com/photo-1772729996007-40bad08b3c40?auto=format&fit=crop&w=1200&q=80", alt: "Golden savory snacks ready to serve" },
  dosa: { src: "https://images.unsplash.com/photo-1743517894265-c86ab035adef?auto=format&fit=crop&w=1200&q=80", alt: "Crisp dosa served with traditional accompaniments" },
  idli: { src: "https://images.unsplash.com/photo-1741376509253-221ac18fac0f?auto=format&fit=crop&w=1200&q=80", alt: "Idli served with sambar and chutney" },
  storyPortrait: { src: "https://images.unsplash.com/photo-1683106215993-811ec358430f?auto=format&fit=crop&w=1400&q=80", alt: "A woman stirring a pan of vegetables in her kitchen" },
} as const

export const categoryPhotography = [
  foodPhotography.biryani,
  foodPhotography.dessert,
  foodPhotography.snacks,
  foodPhotography.curry,
  foodPhotography.biryani,
  foodPhotography.idli,
  foodPhotography.dosa,
  foodPhotography.dessert,
  foodPhotography.snacks,
  foodPhotography.storyPortrait,
] as const

export const featuredPhotography = [
  foodPhotography.biryani,
  foodPhotography.dessert,
  foodPhotography.snacks,
  foodPhotography.curry,
  foodPhotography.idli,
  foodPhotography.dosa,
] as const
