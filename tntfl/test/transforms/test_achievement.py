import unittest
import tntfl.transforms.achievement as achievementTransform
from tntfl.game import Game


class TestAchievement(unittest.TestCase):
    def test(self):
        games = [Game('red', 6, 'blue', 4, 1)]

        games = achievementTransform.do(games)

        self.assertEqual(3, len(games[0].redAchievements))
        achievements = [a.name for a in games[0].redAchievements]
        self.assertIn('First Game', achievements)
        self.assertIn('Early Bird', achievements)
        self.assertIn('Night Owl', achievements)
