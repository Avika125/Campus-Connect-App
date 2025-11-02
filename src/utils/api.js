const API_URL = 'https://6904c0616b8dabde4964fc0f.mockapi.io/api/cc/CampusConnect';

export const fetchEventsFromAPI = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const mappedEvents = data.map(item => ({
      id: item.id.toString(),
      name: item.Name,
      category: item.Category,
      date: item.Date,
      description: item.Description,
      location: item.Location,
      organizer: item.Organizer,
    }));

    return mappedEvents;
  } catch (error) {
    console.error('Failed to fetch events from API', error);
    throw error;
  }
};
