// Frontend Fetch Function
export const fetchTeacherRatings = async (teacherId) => {
  try {
    const response = await fetch(`/api/reviews/stats/teacher/${teacherId}`);
    console.log("called fetchTeacherRatings with teacherId:", teacherId, "response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch teacher ratings: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Received data:", data.data);
    
    return data.data; // Access the data property from the response
  } catch (error) {
    console.error('Error fetching teacher ratings:', error);
    return {
      overall: {
        averageRating: 0,
        totalReviews: 0
      },
      error: true
    };
  }
};