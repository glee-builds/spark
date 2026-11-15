// Loads the starter library: one JSON file per group of people.
// The files ship with the app, so this works offline once the page is cached.

export const LIBRARY_FILES = ['family', 'friends', 'work', 'networking', 'other'];

export async function loadLibrary() {
  const parts = await Promise.all(LIBRARY_FILES.map(async (name) => {
    const response = await fetch(`data/${name}.json`);
    if (!response.ok) return [];
    return response.json();
  }));
  return parts.flat();
}
