class ArenaRatingService {
  // Standard ELO calculation: K-factor of 32
  calculateNewRating(ratingA, ratingB, outcome, kFactor = 32) {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    return Math.round(ratingA + kFactor * (outcome - expectedA));
  }

  async updateRatings(winnerId, loserId) {
    // Logic to fetch and update user ELO in the DB
    console.log(`Updating ELO for winner ${winnerId} and loser ${loserId}`);
  }
}
module.exports = new ArenaRatingService();
